"use client";

import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";

export type EditorDiagnostic = {
  line: number;
  column: number;
  message: string;
  severity?: "error" | "warning";
};

const MONO_FALLBACK = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** next/font hashes family names, so read the resolved CSS variable instead of guessing a name. */
function resolveMono(): { stack: string; primary: string } {
  if (typeof document === "undefined") return { stack: MONO_FALLBACK, primary: "" };
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim();
  if (!v) return { stack: MONO_FALLBACK, primary: "" };
  return { stack: `${v}, ${MONO_FALLBACK}`, primary: v.split(",")[0].trim() };
}

const defineTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("cm-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5c6878", fontStyle: "italic" },
      { token: "keyword", foreground: "ff8fb1" },
      { token: "string", foreground: "e5d98f" },
      { token: "number", foreground: "ffb86b" },
      { token: "type", foreground: "7cc4ff" },
      { token: "type.identifier", foreground: "7cc4ff" },
      { token: "namespace", foreground: "7cc4ff" },
      { token: "delimiter", foreground: "8d99ab" },
      { token: "operator", foreground: "9fb0c8" },
      { token: "identifier", foreground: "d7e0ee" },
      { token: "predefined", foreground: "c8f65d" },
    ],
    colors: {
      "editor.background": "#0a0e14",
      "editor.foreground": "#d7e0ee",
      "editorGutter.background": "#0a0e14",
      "editorLineNumber.foreground": "#3f4a5b",
      "editorLineNumber.activeForeground": "#8d99ab",
      "editorCursor.foreground": "#c8f65d",
      "editor.selectionBackground": "#c8f65d30",
      "editor.inactiveSelectionBackground": "#c8f65d18",
      "editor.selectionHighlightBackground": "#c8f65d14",
      "editor.lineHighlightBackground": "#ffffff08",
      "editor.lineHighlightBorder": "#00000000",
      "editor.findMatchBackground": "#ffd16655",
      "editor.findMatchHighlightBackground": "#ffd16630",
      "editorIndentGuide.background1": "#161d28",
      "editorIndentGuide.activeBackground1": "#2a3545",
      "editorBracketMatch.background": "#c8f65d1f",
      "editorBracketMatch.border": "#c8f65d55",
      "editorWidget.background": "#0d1118",
      "editorWidget.border": "#283446",
      "editorSuggestWidget.background": "#0d1118",
      "editorSuggestWidget.border": "#283446",
      "editorSuggestWidget.selectedBackground": "#18212e",
      "editorHoverWidget.background": "#0d1118",
      "editorHoverWidget.border": "#283446",
      "input.background": "#0a0e14",
      "scrollbarSlider.background": "#24304466",
      "scrollbarSlider.hoverBackground": "#33445f88",
      "scrollbarSlider.activeBackground": "#33445fcc",
      "editorOverviewRuler.border": "#00000000",
    },
  });
};

export function CodeEditor({
  value,
  onChange,
  height = "420px",
  language = "cpp",
  diagnostics = [],
  focusLine,
  onRun,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  height?: string;
  language?: string;
  diagnostics?: EditorDiagnostic[];
  focusLine?: number | null;
  /** Ctrl/Cmd + Enter */
  onRun?: () => void;
  /** Ctrl/Cmd + Shift + Enter */
  onSubmit?: () => void;
}) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const runRef = useRef(onRun);
  const submitRef = useRef(onSubmit);
  const [mono] = useState(resolveMono);

  useEffect(() => {
    runRef.current = onRun;
    submitRef.current = onSubmit;
  });

  const applyMarkers = () => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel();
    if (!editor || !monaco || !model) return;
    monaco.editor.setModelMarkers(
      model,
      "g++",
      diagnostics.map((d) => ({
        startLineNumber: d.line,
        startColumn: Math.max(1, d.column),
        endLineNumber: Math.min(d.line, model.getLineCount()),
        endColumn: Math.max(
          d.column + 1,
          model.getLineLength(Math.min(Math.max(1, d.line), model.getLineCount())) + 1
        ),
        message: d.message,
        severity:
          d.severity === "warning" ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
      }))
    );
    if (focusLine && focusLine > 0) {
      editor.revealLineInCenter(focusLine);
      editor.setPosition({ lineNumber: focusLine, column: 1 });
    }
  };

  useEffect(() => {
    applyMarkers();
    // Re-apply only when the compiler result or the source changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagnostics, focusLine, value]);

  return (
    <div className="h-full overflow-hidden bg-[var(--surface)]">
      <Editor
        height={height}
        language={language}
        theme="cm-dark"
        value={value}
        beforeMount={defineTheme}
        loading={
          <div className="grid h-full w-full place-items-center text-sm text-[var(--muted)]">Loading editor…</div>
        }
        onChange={(v) => onChange(v ?? "")}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;

          editor.addAction({
            id: "cm.run",
            label: "Run tests",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: () => runRef.current?.(),
          });
          editor.addAction({
            id: "cm.submit",
            label: "Submit",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter],
            run: () => submitRef.current?.(),
          });

          // Webfonts load lazily; re-measure once ours is ready so the caret lines up.
          if (mono.primary && document.fonts) {
            document.fonts
              .load(`14px ${mono.primary}`)
              .then(() => monaco.editor.remeasureFonts())
              .catch(() => {});
          }
          applyMarkers();
        }}
        options={{
          fontSize: 14,
          lineHeight: 22,
          fontFamily: mono.stack,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          glyphMargin: true,
          lineNumbersMinChars: 3,
          padding: { top: 14, bottom: 14 },
          renderValidationDecorations: "on",
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          bracketPairColorization: { enabled: true },
          guides: { indentation: true, bracketPairs: false },
          scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false },
        }}
      />
    </div>
  );
}
