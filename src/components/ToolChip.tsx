import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, spring } from "../style";
import { displayFont } from "../fonts";

export type ChipGlyph = "terminal" | "play" | "braces";

/**
 * Marks are drawn, not imported. A stroked 24px-grid glyph recolours with the
 * chip and stays crisp at any size — no logo PNG to go stale or sit at the
 * wrong weight next to the type.
 */
const Glyph: React.FC<{ kind: ChipGlyph; color: string; s: number }> = ({ kind, color, s }) => {
  const common = {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (kind === "terminal") {
    return (
      <svg {...common}>
        <rect x="2.2" y="3.6" width="19.6" height="16.8" rx="4" />
        <path d="M7.4 9.6 L10.9 12.6 L7.4 15.6" />
        <path d="M13.2 16 H17.2" />
      </svg>
    );
  }

  if (kind === "play") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9.4" />
        <path d="M10.1 8.3 L16 12 L10.1 15.7 Z" fill={color} />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M9.6 3.6 C7.2 3.6 7.2 7.1 7.2 8.6 C7.2 10.6 5.7 12 4.6 12 C5.7 12 7.2 13.4 7.2 15.4 C7.2 16.9 7.2 20.4 9.6 20.4" />
      <path d="M14.4 3.6 C16.8 3.6 16.8 7.1 16.8 8.6 C16.8 10.6 18.3 12 19.4 12 C18.3 12 16.8 13.4 16.8 15.4 C16.8 16.9 16.8 20.4 14.4 20.4" />
    </svg>
  );
};

/**
 * A named tool as a pill: glyph plus wordmark, set in the deck's own type so it
 * belongs to the frame rather than sitting on top of it.
 */
export const ToolChip: React.FC<{
  label: string;
  glyph: ChipGlyph;
  delay?: number;
  accent?: boolean;
  fontSize?: number;
}> = ({ label, glyph, delay = 0, accent = false, fontSize = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = remotionSpring({ frame: frame - delay, fps, config: spring.snappy });
  const color = accent ? theme.cream : theme.ink;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.42,
        padding: `${fontSize * 0.44}px ${fontSize * 0.74}px`,
        borderRadius: 999,
        border: `2px solid ${accent ? theme.deepAlt : theme.line}`,
        backgroundColor: accent ? theme.deep : theme.surface,
        fontFamily: displayFont,
        fontSize,
        fontWeight: 800,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        color,
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [26, 0])}px) scale(${interpolate(
          enter,
          [0, 1],
          [0.92, 1],
        )})`,
      }}
    >
      <Glyph kind={glyph} color={color} s={fontSize * 1.05} />
      <span>{label}</span>
    </div>
  );
};

/** The "+" that joins two chips. Snaps in a beat after the chip on its left. */
export const ChipJoin: React.FC<{ delay?: number; fontSize?: number }> = ({
  delay = 0,
  fontSize = 52,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = remotionSpring({ frame: frame - delay, fps, config: spring.bouncy });

  return (
    <div
      style={{
        fontFamily: displayFont,
        fontSize,
        fontWeight: 800,
        color: theme.accent,
        lineHeight: 1,
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.4, 1])}) rotate(${interpolate(
          enter,
          [0, 1],
          [-40, 0],
        )}deg)`,
      }}
    >
      +
    </div>
  );
};
