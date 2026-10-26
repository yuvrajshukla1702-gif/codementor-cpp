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

export function prepareCpp(code: string): { source: string; wrapped: boolean } {
  const src = normalizeSource(code).trim();
  if (hasMain(src)) return { source: src, wrapped: false };
  return {
    source: `#include <bits/stdc++.h>\nusing namespace std;\n#line 1\n${src}\n#line 10000\nint main() {\n    return 0;\n}\n`,
    wrapped: true,
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
