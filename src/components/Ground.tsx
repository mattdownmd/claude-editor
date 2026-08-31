import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../style";

export type GroundTone = "cream" | "clay" | "deep";

const FILL: Record<GroundTone, string> = {
  cream: theme.bg,
  clay: theme.clay,
  deep: theme.deep,
};

export type GroundMark = { frame: number; tone: GroundTone };

/**
 * The flat ground every shot sits on.
 *
 * Deliberately flat — no gradient, no texture, no drift. The reference film
 * gets all of its depth from windows floating above a solid colour, and adding
 * atmosphere to the ground is what made the earlier version of this project
 * look like a template. The only thing that changes is *which* colour, and
 * that change is a cut, not a fade.
 *
 * Alternating cream and clay is how a section boundary reads without a title.
 */
export const Ground: React.FC<{
  /** Tone changes, keyed to absolute frames. The first applies from frame 0. */
  marks: GroundMark[];
  /** Frames a colour change takes. Keep it short — this should read as a cut. */
  changeFrames?: number;
}> = ({ marks, changeFrames = 6 }) => {
  const frame = useCurrentFrame();

  let idx = 0;
  for (let i = 0; i < marks.length; i++) {
    if (frame >= marks[i].frame) idx = i;
  }

  const to = marks[idx];
  const from = idx === 0 ? to : marks[idx - 1];
  const t =
    idx === 0
      ? 1
      : interpolate(frame, [to.frame, to.frame + changeFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <AbsoluteFill style={{ backgroundColor: FILL[from.tone] }}>
      <AbsoluteFill style={{ backgroundColor: FILL[to.tone], opacity: t }} />
    </AbsoluteFill>
  );
};

/** The tone in force at a given frame — so a shot can pick type colour to match. */
export const toneAt = (marks: GroundMark[], frame: number): GroundTone => {
  let tone: GroundTone = marks[0]?.tone ?? "cream";
  for (const m of marks) if (frame >= m.frame) tone = m.tone;
  return tone;
};
