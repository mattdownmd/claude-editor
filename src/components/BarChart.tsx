import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, font, spring } from "../style";

export type Bar = { label: string; value: number; color?: string };

export const BarChart: React.FC<{
  data: Bar[];
  delay?: number;
  height?: number;
  suffix?: string;
}> = ({ data, delay = 0, height = 520, suffix = "" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 56, height }}>
      {data.map((bar, i) => {
        const grow = remotionSpring({
          frame: frame - delay - i * 4,
          fps,
          config: spring.gentle,
        });
        const barHeight = interpolate(grow, [0, 1], [0, (bar.value / max) * (height - 120)]);
        return (
          <div key={bar.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div
              style={{
                fontFamily: font.display,
                fontSize: 40,
                fontWeight: 800,
                color: theme.ink,
                opacity: grow,
              }}
            >
              {Math.round(bar.value * grow)}
              {suffix}
            </div>
            <div
              style={{
                width: 150,
                height: barHeight,
                borderRadius: 16,
                backgroundColor: bar.color ?? theme.accent,
              }}
            />
            <div style={{ fontFamily: font.body, fontSize: 30, color: theme.muted, fontWeight: 600 }}>
              {bar.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
