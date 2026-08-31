import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, font, spring } from "../style";

export const Callout: React.FC<{
  label: string;
  value: string;
  delay?: number;
}> = ({ label, value, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = remotionSpring({ frame: frame - delay, fps, config: spring.bouncy });

  return (
    <div
      style={{
        backgroundColor: theme.accentSoft,
        border: `3px solid ${theme.accent}`,
        borderRadius: 28,
        padding: "36px 52px",
        display: "inline-flex",
        flexDirection: "column",
        gap: 10,
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
      }}
    >
      <div style={{ fontFamily: font.body, fontSize: 26, fontWeight: 700, color: theme.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontFamily: font.display, fontSize: 76, fontWeight: 800, color: theme.ink, letterSpacing: "-0.02em" }}>
        {value}
      </div>
    </div>
  );
};
