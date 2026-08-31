import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Window, WindowLine } from "./Window";
import { theme, code } from "../style";
import { monoFont } from "../fonts";

/**
 * - `command` — something you typed. Gets a prompt marker and types itself out.
 * - `output`  — what came back.
 * - `done`    — a finished step, marked and set in the warm note of the palette.
 */
export type TerminalLine = {
  text: string;
  kind?: "command" | "output" | "done";
  frame?: number;
  /** Frames the command takes to type. Ignored on other kinds. */
  typeFrames?: number;
};

const MARKER: Record<string, string> = { command: "$", done: "✓", output: " " };

const LineText: React.FC<{ line: TerminalLine; landed: number; fontSize: number }> = ({
  line,
  landed,
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const kind = line.kind ?? "output";

  const color =
    kind === "command" ? code.text : kind === "done" ? theme.cream : theme.accentSoft;

  // Commands type out; output and results arrive whole.
  let shown = line.text;
  let caret = false;
  if (kind === "command") {
    const dur = line.typeFrames ?? Math.max(10, line.text.length);
    const chars = Math.round(
      interpolate(frame, [landed, landed + dur], [0, line.text.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
    shown = line.text.slice(0, chars);
    caret = frame >= landed && chars < line.text.length;
  }

  return (
    <div style={{ display: "flex", gap: 18, whiteSpace: "pre" }}>
      <span
        style={{
          color: kind === "done" ? theme.cream : theme.subtle,
          minWidth: fontSize * 0.8,
        }}
      >
        {MARKER[kind]}
      </span>
      <span style={{ color }}>
        {shown}
        {caret && <span style={{ color: theme.accentSoft }}>▋</span>}
      </span>
    </div>
  );
};

/**
 * A terminal running the commands the script is describing. Use it when the
 * point is *what you actually type* — a pipeline diagram is for flow, this is
 * for the real thing.
 */
export const TerminalWindow: React.FC<{
  lines: TerminalLine[];
  title?: string;
  delay?: number;
  stagger?: number;
  fontSize?: number;
  width?: number | string;
}> = ({ lines, title = "zsh", delay = 0, stagger = 24, fontSize = 26, width = "100%" }) => {
  return (
    <Window title={title} tone="dark" delay={delay} width={width} pad={30}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: fontSize * 0.5,
          fontFamily: monoFont,
          fontSize,
          lineHeight: 1.45,
        }}
      >
        {lines.map((line, i) => {
          const landed = line.frame ?? delay + 10 + i * stagger;
          return (
            <WindowLine key={i} delay={landed}>
              <LineText line={line} landed={landed} fontSize={fontSize} />
            </WindowLine>
          );
        })}
      </div>
    </Window>
  );
};
