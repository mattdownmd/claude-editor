import React from "react";
import { AbsoluteFill, interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { layout, spring } from "../../style";

export type PunchMark = {
  frame: number;
  /** Scale. 1 is the framed-wide view; 2 is a hard punch into a detail. */
  scale: number;
  /**
   * The point that stays put, in composition pixels. Punch in on the thing the
   * narration is about and it stays centred while everything else grows past
   * the edges.
   */
  x?: number;
  y?: number;
};

/**
 * A punch-in on part of the frame — the reference's other signature move.
 *
 * Everything inside scales around a focal point rather than the frame centre,
 * so a zoom onto a dropdown in the corner actually lands on the dropdown.
 * Nothing inside animates; the camera does the work, which is why it reads as
 * *looking closer* rather than as elements growing.
 *
 * Keep the wide view on screen for a beat before punching. A zoom that starts
 * immediately gives the eye nothing to orient against.
 */
export const Punch: React.FC<{
  marks: PunchMark[];
  children: React.ReactNode;
  /** Frames a punch takes to settle. */
  moveDuration?: number;
}> = ({ marks, children, moveDuration = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let idx = 0;
  for (let i = 0; i < marks.length; i++) {
    if (frame >= marks[i].frame) idx = i;
  }

  const to = marks[idx];
  const from = idx === 0 ? to : marks[idx - 1];
  const t =
    idx === 0
      ? 1
      : remotionSpring({
          frame: frame - to.frame,
          fps,
          config: spring.gentle,
          durationInFrames: moveDuration,
        });

  const scale = interpolate(t, [0, 1], [from.scale, to.scale]);
  const fx = interpolate(t, [0, 1], [from.x ?? layout.width / 2, to.x ?? layout.width / 2]);
  const fy = interpolate(t, [0, 1], [from.y ?? layout.height / 2, to.y ?? layout.height / 2]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${(fx / layout.width) * 100}% ${(fy / layout.height) * 100}%`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
