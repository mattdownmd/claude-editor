import React from "react";
import { AbsoluteFill } from "remotion";
import { ToolChip } from "../components/ToolChip";
import { theme, layout, radius } from "../style";
import { displayFont, monoFont, serifFont } from "../fonts";

const SWATCHES: { name: string; value: string; note: string }[] = [
  { name: "bg", value: theme.bg, note: "parchment ground" },
  { name: "clay", value: theme.clay, note: "clay ground" },
  { name: "surface", value: theme.surface, note: "window / card" },
  { name: "ink", value: theme.ink, note: "primary type" },
  { name: "muted", value: theme.muted, note: "secondary type" },
  { name: "subtle", value: theme.subtle, note: "inactive / struck" },
  { name: "line", value: theme.line, note: "hairline" },
  { name: "accent", value: theme.accent, note: "emphasis on light" },
  { name: "accentSoft", value: theme.accentSoft, note: "fills, keywords" },
  { name: "onClay", value: theme.onClay, note: "type on clay" },
  { name: "deep", value: theme.deep, note: "window ground" },
  { name: "deepAlt", value: theme.deepAlt, note: "dark window chrome" },
  { name: "clayLine", value: theme.clayLine, note: "hairline on clay" },
  { name: "olive", value: theme.olive, note: "connectors, dots" },
];

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: monoFont,
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: theme.olive,
    }}
  >
    {children}
  </div>
);

/**
 * The system on one frame — every token with its hex, the type scale, and the
 * components that use them. Open it in the Studio when you need to check what
 * something is actually called before writing a new shot.
 */
export const DesignSystem: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, padding: 90 }}>
      <div style={{ display: "flex", gap: 70, height: "100%" }}>
        {/* colour */}
        <div style={{ flex: "0 0 960px", display: "flex", flexDirection: "column", gap: 26 }}>
          <Label>Colour</Label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
            }}
          >
            {SWATCHES.map((s) => (
              <div
                key={s.name}
                style={{
                  border: `2px solid ${theme.line}`,
                  borderRadius: radius.card,
                  overflow: "hidden",
                  backgroundColor: theme.surface,
                }}
              >
                <div
                  style={{
                    height: 68,
                    backgroundColor: s.value,
                    borderBottom: `2px solid ${theme.line}`,
                  }}
                />
                <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontSize: 20,
                      fontWeight: 700,
                      color: theme.ink,
                    }}
                  >
                    {s.name}
                  </span>
                  <span style={{ fontFamily: monoFont, fontSize: 17, color: theme.muted }}>
                    {s.value}
                  </span>
                  <span style={{ fontFamily: displayFont, fontSize: 17, color: theme.subtle }}>
                    {s.note}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* type and parts */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 34 }}>
          <Label>Type — three faces, three jobs</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div
                style={{
                  fontFamily: serifFont,
                  fontSize: 66,
                  fontWeight: 400,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.06,
                  color: theme.ink,
                }}
              >
                Statements in{" "}
                <span style={{ fontStyle: "italic", color: theme.accent }}>Newsreader</span>
              </div>
              <div style={{ fontFamily: monoFont, fontSize: 17, color: theme.subtle }}>
                serif — the one sentence a shot delivers
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: displayFont,
                  fontSize: 38,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: theme.ink,
                }}
              >
                Interface type in Plus Jakarta Sans
              </div>
              <div style={{ fontFamily: monoFont, fontSize: 17, color: theme.subtle }}>
                sans — labels, steps, anything inside a window
              </div>
            </div>
            <div>
              <div style={{ fontFamily: monoFont, fontSize: 26, color: theme.ink }}>
                JetBrains Mono 26
              </div>
              <div style={{ fontFamily: monoFont, fontSize: 17, color: theme.subtle }}>
                mono — if a viewer could type it, set it here
              </div>
            </div>
          </div>

          <Label>Parts</Label>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <ToolChip label="Claude Code" glyph="terminal" accent fontSize={32} />
            <ToolChip label="Remotion" glyph="play" fontSize={32} />
          </div>

          <div
            style={{
              marginTop: "auto",
              fontFamily: displayFont,
              fontSize: 22,
              lineHeight: 1.5,
              color: theme.muted,
              maxWidth: 620,
            }}
          >
            Sampled from the reference film in{" "}
            <span style={{ fontFamily: monoFont, color: theme.accent }}>references/</span>
            . Import from{" "}
            <span style={{ fontFamily: monoFont, color: theme.accent }}>src/style.ts</span> — never
            hardcode a hex in a composition.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
