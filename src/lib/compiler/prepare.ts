/** Turn a pasted snippet into something the real compiler can build. */

export function normalizeSource(code: string) {
  return code.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

export function hasMain(code: string) {
  return /\bmain\s*\(/.test(code);
}

/** Classes, templates, and the STL are outside the instant runner. */
export function needsFullCompiler(code: string) {
  const src = normalizeSource(code);
  return (
    /\b(class|template)\b/.test(src) ||
    /\b(vector|map|set|unordered_map|unordered_set|queue|stack|deque|priority_queue)\s*</.test(src) ||
    /#include\s*<\s*(vector|bits\/|algorithm|map|set|queue|stack|deque)\b/.test(src)
  );
}

type Kind = "int" | "long" | "double" | "bool" | "string" | "vi" | "vs" | "vvi" | "void";

type Param = { kind: Exclude<Kind, "void">; name: string };

type Method = { ret: Kind; name: string; params: Param[]; className: string | null };

const SKIP_NAMES = new Set(["if", "for", "while", "switch", "catch", "main"]);

function splitArgs(list: string) {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of list) {
    if (ch === "<") depth++;
    else if (ch === ">") depth = Math.max(0, depth - 1);
    else if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function parseParam(raw: string): Param | null {
  const cleaned = raw.replace(/\bconst\b/g, "").replace(/[&*]/g, " ").replace(/\s+/g, " ").trim();
  const name = cleaned.match(/([A-Za-z_]\w*)$/)?.[1];
  if (!name) return null;
  const type = cleaned.slice(0, cleaned.length - name.length).replace(/\s+/g, "");
  if (type === "int") return { kind: "int", name };
  if (type === "longlong") return { kind: "long", name };
  if (type === "double" || type === "float") return { kind: "double", name };
  if (type === "bool") return { kind: "bool", name };
  if (type === "string") return { kind: "string", name };
  if (type === "vector<int>") return { kind: "vi", name };
  if (type === "vector<string>") return { kind: "vs", name };
  if (type === "vector<vector<int>>") return { kind: "vvi", name };
  return null;
}

function findMethod(src: string): Method | null {
  const className = src.match(/\bclass\s+([A-Za-z_]\w*)/)?.[1] ?? null;
  const sig = /\b(void|bool|int|double|string|long\s+long|vector\s*<\s*int\s*>|vector\s*<\s*string\s*>|vector\s*<\s*vector\s*<\s*int\s*>\s*>)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/g;
  for (const match of src.matchAll(sig)) {
    const name = match[2];
    if (SKIP_NAMES.has(name) || name === className) continue;
    const params: Param[] = [];
    let ok = true;
    for (const raw of splitArgs(match[3])) {
      const param = parseParam(raw);
      if (!param) {
        ok = false;
        break;
      }
      params.push(param);
    }
    if (!ok) continue;
    const raw = match[1].replace(/\s+/g, "");
    const ret: Kind = raw === "longlong" ? "long" : (raw as Kind);
    return { ret, name, params, className };
  }
  return null;
}

function sample(kind: Param["kind"], index: number) {
  if (kind === "int") return index === 0 ? "1" : "3";
  if (kind === "long") return "3";
  if (kind === "double") return "1.5";
  if (kind === "bool") return "true";
  if (kind === "string") return '"abc"';
  if (kind === "vi") return "{1, 3, 5, 7}";
  if (kind === "vs") return '{"a", "b"}';
  return "{{1, 2}, {3, 4}}";
}

function sampleText(kind: Param["kind"], index: number) {
  return sample(kind, index).replaceAll('"', "");
}

function readStmt(param: Param, id: string) {
  if (param.kind === "vi" || param.kind === "vs") {
    const value = param.kind === "vi" ? "int" : "string";
    return `string cm_line_${id};\n    getline(cin, cm_line_${id});\n    {\n        stringstream cm_ss_${id}(cm_line_${id});\n        ${value} cm_item_${id};\n        while (cm_ss_${id} >> cm_item_${id}) ${id}.push_back(cm_item_${id});\n    }`;
  }
  if (param.kind === "vvi") {
    return `int cm_rows_${id} = 0;\n    if (!(cin >> cm_rows_${id})) cm_rows_${id} = 0;\n    cin.ignore();\n    for (int cm_r_${id} = 0; cm_r_${id} < cm_rows_${id}; cm_r_${id}++) {\n        string cm_line_${id};\n        getline(cin, cm_line_${id});\n        stringstream cm_ss_${id}(cm_line_${id});\n        vector<int> cm_row_${id};\n        int cm_item_${id};\n        while (cm_ss_${id} >> cm_item_${id}) cm_row_${id}.push_back(cm_item_${id});\n        ${id}.push_back(cm_row_${id});\n    }`;
  }
  if (param.kind === "string") return `getline(cin, ${id});`;
  return `cin >> ${id};`;
}

function decl(param: Param, id: string, fromInput: boolean) {
  const type =
    param.kind === "int"
      ? "int"
      : param.kind === "long"
        ? "long long"
        : param.kind === "double"
          ? "double"
          : param.kind === "bool"
            ? "bool"
            : param.kind === "string"
              ? "string"
              : param.kind === "vi"
                ? "vector<int>"
                : param.kind === "vs"
                  ? "vector<string>"
                  : "vector<vector<int>>";
  if (fromInput) {
    const init = param.kind === "string" || param.kind === "vi" || param.kind === "vs" || param.kind === "vvi" ? "" : " = 0";
    return `${type} ${id}${init};\n    ${readStmt(param, id)}`;
  }
  return `${type} ${id} = ${sample(param.kind, 0)};`;
}

function printResult(ret: Kind, expr: string) {
  if (ret === "void") return `${expr};\n`;
  if (ret === "bool") return `cout << (${expr} ? "true" : "false") << "\\n";\n`;
  if (ret === "vi" || ret === "vs") {
    return `{\n        auto cm_ans = ${expr};\n        for (int cm_i = 0; cm_i < (int)cm_ans.size(); cm_i++) {\n            if (cm_i) cout << " ";\n            cout << cm_ans[cm_i];\n        }\n        cout << "\\n";\n    }\n`;
  }
  if (ret === "vvi") {
    return `{\n        auto cm_ans = ${expr};\n        for (int cm_r = 0; cm_r < (int)cm_ans.size(); cm_r++) {\n            for (int cm_c = 0; cm_c < (int)cm_ans[cm_r].size(); cm_c++) {\n                if (cm_c) cout << " ";\n                cout << cm_ans[cm_r][cm_c];\n            }\n            cout << "\\n";\n        }\n    }\n`;
  }
  return `cout << (${expr}) << "\\n";\n`;
}

/** Build a main that calls the pasted function and prints what it returns. */
export function prepareCpp(code: string, stdin = ""): { source: string; wrapped: boolean; called?: string } {
  const src = normalizeSource(code).trim();
  if (hasMain(src)) return { source: src, wrapped: false };
  const method = findMethod(src);
  const header = `#include <bits/stdc++.h>\nusing namespace std;\n#line 1\n${src}\n#line 10000\n`;
  if (!method) {
    return {
      source: `${header}int main() {\n    return 0;\n}\n`,
      wrapped: true,
    };
  }
  const typed = stdin.replace(/\r\n?/g, "\n").trim();
  const fromInput = typed.length > 0 && typed.replace(/\s+/g, " ") !== "4 5";
  const ids = method.params.map((param, index) => ({ param, id: `cm_arg_${index}` }));
  const lines = ids.map(({ param, id }, index) => {
    if (fromInput) return decl(param, id, true);
    const type =
      param.kind === "int"
        ? "int"
        : param.kind === "long"
          ? "long long"
          : param.kind === "double"
            ? "double"
            : param.kind === "bool"
              ? "bool"
              : param.kind === "string"
                ? "string"
                : param.kind === "vi"
                  ? "vector<int>"
                  : param.kind === "vs"
                    ? "vector<string>"
                    : "vector<vector<int>>";
    return `${type} ${id} = ${sample(param.kind, index)};`;
  });
  const args = ids.map(({ id }) => id).join(", ");
  const call = method.className ? `cm_sol.${method.name}(${args})` : `${method.name}(${args})`;
  const object = method.className ? `${method.className} cm_sol;\n    ` : "";
  const shown = `${method.name}(${ids.map(({ param }, index) => sampleText(param.kind, index)).join(", ")})`;
  return {
    source: `${header}int main() {\n    ${object}${lines.join("\n    ")}\n    ${printResult(method.ret, call)}    return 0;\n}\n`,
    wrapped: true,
    called: fromInput ? undefined : shown,
  };
}

export function prepareC(code: string): { source: string; wrapped: boolean } {
  const src = normalizeSource(code).trim();
  if (hasMain(src)) return { source: src, wrapped: false };
  const header = /#include\s*<\s*stdio\.h\s*>/.test(src) ? "" : "#include <stdio.h>\n";
  return {
    source: `${header}#line 1\n${src}\n#line 10000\nint main(void) {\n    return 0;\n}\n`,
    wrapped: true,
  };
}
