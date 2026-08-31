import React from "react";
import { Window, WindowLine } from "./Window";
import { code, codeLight, theme } from "../style";
import { monoFont } from "../fonts";

export type CodeLine = {
  text: string;
  /** Absolute frame this line lands on. Falls back to delay + index * stagger. */
  frame?: number;
};

type Token = { t: string; c: string };

const KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "const",
  "let",
  "return",
  "function",
  "await",
  "async",
  "new",
  "default",
  "type",
  "interface",
]);

/**
 * Colours a line of TS/JSX well enough to read as code on screen. This is a
 * screen-accurate impression, not a real parser — it handles the four things
 * the eye actually registers at 1080p: comments, strings, keywords, and tags.
 */
const tokenize = (line: string, c: typeof code): Token[] => {
  const comment = line.indexOf("//");
  if (comment >= 0) {
    const before = line.slice(0, comment);
    return [...tokenize(before, c), { t: line.slice(comment), c: c.comment }];
  }

  const out: Token[] = [];
  // Strings, JSX tag names, identifiers, numbers, everything else.
  const re = /("[^"]*"|'[^']*'|`[^`]*`)|(<\/?[A-Za-z][\w.]*)|([A-Za-z_$][\w$]*)|(\d+)|([^\w\s]+)|(\s+)/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(line)) !== null) {
    if (m[1]) out.push({ t: m[1], c: c.string });
    else if (m[2]) out.push({ t: m[2], c: c.keyword });
    else if (m[3]) out.push({ t: m[3], c: KEYWORDS.has(m[3]) ? c.keyword : c.text });
    else if (m[4]) out.push({ t: m[4], c: c.string });
    else if (m[5]) out.push({ t: m[5], c: c.punct });
    else out.push({ t: m[6], c: c.text });
  }

  return out;
};

/**
 * A source file appearing line by line. Key each line's `frame` to the word
 * being spoken over it and the code reads as the narration's evidence.
 */
export const CodeWindow: React.FC<{
  lines: CodeLine[];
  title?: string;
  delay?: number;
  stagger?: number;
  fontSize?: number;
  width?: number | string;
  showLineNumbers?: boolean;
  tone?: "dark" | "light";
}> = ({
  lines,
  title = "IntroFull.tsx",
  delay = 0,
  stagger = 8,
  fontSize = 26,
  width = "100%",
  showLineNumbers = true,
  tone = "light",
}) => {
  const c = tone === "light" ? (codeLight as unknown as typeof code) : code;
  return (
    <Window title={title} tone={tone} delay={delay} width={width} pad={30}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: fontSize * 0.42,
          fontFamily: monoFont,
          fontSize,
          lineHeight: 1.45,
        }}
      >
        {lines.map((line, i) => (
          <WindowLine
            key={i}
            delay={line.frame ?? delay + 8 + i * stagger}
            style={{ display: "flex", gap: 22, whiteSpace: "pre" }}
          >
            {showLineNumbers && (
              <span
                style={{
                  color: tone === "light" ? theme.subtle : theme.olive,
                  minWidth: fontSize * 1.1,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {i + 1}
              </span>
            )}
            <span>
              {tokenize(line.text, c).map((tok, j) => (
                <span key={j} style={{ color: tok.c }}>
                  {tok.t}
                </span>
              ))}
            </span>
          </WindowLine>
        ))}
      </div>
    </Window>
  );
};
