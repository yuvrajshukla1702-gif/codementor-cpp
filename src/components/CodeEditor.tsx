"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";

export type EditorDiagnostic = {
  line: number;
  column: number;
  message: string;
  severity?: "error" | "warning";
};

export function CodeEditor({
  value,
  onChange,
  height = "420px",
  diagnostics = [],
  focusLine,
}: {
  value: string;
  onChange: (v: string) => void;
  height?: string;
  diagnostics?: EditorDiagnostic[];
  focusLine?: number | null;
}) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);

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
    <div className="h-full overflow-hidden bg-[#1e1e1e]">
      <Editor
        height={height}
        defaultLanguage="cpp"
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
          applyMarkers();
        }}
        options={{
          fontSize: 14,
          fontFamily: "IBM Plex Mono, ui-monospace, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          glyphMargin: true,
          renderValidationDecorations: "on",
        }}
      />
    </div>
  );
}
