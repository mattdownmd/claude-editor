import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, spring } from "../style";
import { monoFont } from "../fonts";

/**
 * The section marker: a short accent rule that draws out, then an index and a
 * label. It names the beat the shot belongs to — never what's being said, so it
 * doesn't compete with the headline underneath it.
 */
export const Kicker: React.FC<{
  index: string;
  label: string;
  delay?: number;
  /** `deep` when the kicker sits on a dark ground. */
  tone?: "light" | "deep" | "clay";
}> = ({ index, label, delay = 0, tone = "light" }) => {
  const mark =
    tone === "deep" ? theme.onClay : tone === "clay" ? theme.onClay : theme.accent;
  const text =
    tone === "deep" ? theme.accentSoft : tone === "clay" ? theme.accentSoft : theme.olive;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const draw = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enter = remotionSpring({ frame: frame - delay - 5, fps, config: spring.snappy });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div
        style={{
          width: 64 * draw,
          height: 5,
          borderRadius: 3,
          backgroundColor: mark,
        }}
      />
      <div
        style={{
          display: "flex",
          gap: 14,
          fontFamily: monoFont,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: enter,
          transform: `translateX(${interpolate(enter, [0, 1], [-14, 0])}px)`,
        }}
      >
        <span style={{ color: mark }}>{index}</span>
        <span style={{ color: text }}>{label}</span>
      </div>
    </div>
  );
};
