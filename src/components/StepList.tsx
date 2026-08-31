import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, spring } from "../style";
import { displayFont } from "../fonts";

export type Step = { label: string; sub?: string };

/**
 * A numbered roadmap. Items enter staggered, each with an oversized accent index.
 */
export const StepList: React.FC<{
  steps: Step[];
  delay?: number;
  stagger?: number;
  fontSize?: number;
  /** Off when a wrapper (`Throw`, a shared-element move) owns the entrance. */
  animate?: boolean;
  /** Numbering offset, for when rows are rendered one at a time. */
  startIndex?: number;
}> = ({ steps, delay = 0, stagger = 9, fontSize = 62, animate = true, startIndex = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, width: "100%" }}>
      {steps.map((step, i) => {
        const enter = animate
          ? remotionSpring({
              frame: frame - delay - i * stagger,
              fps,
              config: spring.snappy,
            })
          : 1;

        return (
          <div
            key={`${step.label}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 34,
              opacity: enter,
              transform: `translateX(${interpolate(enter, [0, 1], [-44, 0])}px)`,
            }}
          >
            <div
              style={{
                flex: "0 0 auto",
                width: 92,
                height: 92,
                borderRadius: 20,
                backgroundColor: theme.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: displayFont,
                fontSize: 44,
                fontWeight: 800,
                color: theme.bg,
              }}
            >
              {startIndex + i + 1}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  fontFamily: displayFont,
                  fontSize,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: theme.ink,
                  lineHeight: 1.1,
                }}
              >
                {step.label}
              </div>
              {step.sub && (
                <div
                  style={{
                    fontFamily: displayFont,
                    fontSize: 28,
                    fontWeight: 500,
                    color: theme.muted,
                  }}
                >
                  {step.sub}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
