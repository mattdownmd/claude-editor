import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme, layout } from "../style";

/**
 * A hairline at the foot of the frame that fills as the intro runs, ticked at
 * each section boundary. It's the one persistent element in the edit — it tells
 * the viewer how much of the setup is left, which is a real thing to know.
 */
export const ChapterRail: React.FC<{
  /** Section boundary frames, excluding 0 and the end. */
  ticks: number[];
  total: number;
  /** Frames the rail fades in and out on. */
  from: number;
  to: number;
  y?: number;
  /** Frame the rail flips to its clay-ground colours. */
  clayFrom?: number;
}> = ({ ticks, total, from, to, y = 1022, clayFrom }) => {
  const frame = useCurrentFrame();
  const onClay = clayFrom !== undefined && frame >= clayFrom;

  const width = layout.width - layout.margin * 2;
  const progress = interpolate(frame, [0, total], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [from, from + 10, to, to + 10], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: layout.margin,
        top: y,
        width,
        height: 4,
        borderRadius: 2,
        backgroundColor: onClay ? theme.clayLine : theme.line,
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: width * progress,
          borderRadius: 2,
          backgroundColor: onClay ? theme.onClay : theme.accent,
        }}
      />
      {ticks.map((tick) => (
        <div
          key={tick}
          style={{
            position: "absolute",
            left: (tick / total) * width,
            top: -5,
            width: 3,
            height: 14,
            borderRadius: 2,
            backgroundColor: onClay ? theme.clayLine : theme.line,
          }}
        />
      ))}
    </div>
  );
};
