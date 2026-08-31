import React from "react";
import { interpolatePath } from "@remotion/paths";
import { spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { spring } from "../../style";
import { VIEW_BOX } from "./shapes";

export type MorphKey = {
  /** SVG path in the shared 200×200 box. */
  d: string;
  /** Frame this shape starts becoming the current one. */
  frame: number;
  fill?: string;
  stroke?: string;
};

/**
 * One shape becoming another — the real thing, not a cross-fade. Nothing
 * appears or disappears; the outline itself travels.
 *
 * This is the house move. Reach for it whenever a shot would otherwise cut
 * from one object to a different object: a window collapsing into a play
 * button, a card becoming a circle. The eye follows a single object across the
 * cut, which is why it reads as expensive.
 */
export const ShapeMorph: React.FC<{
  keys: MorphKey[];
  size?: number;
  /** Frames each morph takes. */
  duration?: number;
  strokeWidth?: number;
}> = ({ keys, size = 200, duration = 22, strokeWidth = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let idx = 0;
  for (let i = 0; i < keys.length; i++) {
    if (frame >= keys[i].frame) idx = i;
  }

  const to = keys[idx];
  const from = idx === 0 ? to : keys[idx - 1];

  const t =
    idx === 0
      ? 1
      : remotionSpring({
          frame: frame - to.frame,
          fps,
          config: spring.gentle,
          durationInFrames: duration,
        });

  const d = idx === 0 ? to.d : interpolatePath(t, from.d, to.d);

  // Colour travels with the shape rather than switching at the keyframe.
  const mix = (a: string | undefined, b: string | undefined) => (t < 0.5 ? a : b);

  return (
    <svg width={size} height={size} viewBox={VIEW_BOX} style={{ overflow: "visible" }}>
      <path
        d={d}
        fill={mix(from.fill, to.fill) ?? "none"}
        stroke={mix(from.stroke, to.stroke) ?? "none"}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
};
