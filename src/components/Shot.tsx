import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { spring } from "../style";

/**
 * Holds one section's graphics for a range of the timeline. Children animate on
 * absolute composition frames — this only handles the section's own entrance
 * and the lift-off before the next one takes over.
 */
export const Shot: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
  /** Frames the shot spends leaving, ending on `to`. */
  exitFrames?: number;
  style?: React.CSSProperties;
}> = ({ from, to, children, exitFrames = 12, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < from || frame > to) {
    return null;
  }

  const enter = remotionSpring({ frame: frame - from, fps, config: spring.snappy });
  const exit = interpolate(frame, [to - exitFrames, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        ...style,
        opacity: enter * (1 - exit),
        transform: `translateY(${interpolate(enter, [0, 1], [26, 0]) - exit * 26}px)`,
      }}
    >
      {children}
    </div>
  );
};
