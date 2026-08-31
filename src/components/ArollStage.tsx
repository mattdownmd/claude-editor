import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  spring as remotionSpring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, spring } from "../style";

/**
 * Where the A-roll sits on the canvas.
 *
 * - `full`  — full bleed. The presenter carries the shot on his own.
 * - `right` — a portrait card docked right, leaving a 930px column for graphics.
 * - `pip`   — a small 16:9 inset, for when a graphic needs the full width but
 *             we still want eye contact.
 * - `off`    — out of frame entirely, for a section that commits to graphics.
 *              The element stays mounted, so the voice keeps playing.
 */
export type StagePreset = "full" | "right" | "pip" | "off";

/** The frame a preset takes over from. The first mark applies from frame 0. */
export type StageMark = { frame: number; preset: StagePreset };

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  border: number;
  /** Horizontal focal point of the crop, in percent — the subject sits just right of centre. */
  focusX: number;
  opacity: number;
};

const PRESETS: Record<StagePreset, Rect> = {
  full: { x: 0, y: 0, w: 1920, h: 1080, radius: 0, border: 0, focusX: 50, opacity: 1 },
  right: { x: 1160, y: 150, w: 620, h: 780, radius: 36, border: 3, focusX: 52, opacity: 1 },
  pip: { x: 1420, y: 800, w: 360, h: 202, radius: 18, border: 3, focusX: 50, opacity: 1 },
  off: { x: 1500, y: 860, w: 300, h: 168, radius: 18, border: 3, focusX: 50, opacity: 0 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The recording, keyframed between layout presets. Every move is one spring —
 * no cross-dissolve, no slow zoom. The camera doesn't move; the frame does.
 */
export const ArollStage: React.FC<{
  src: string;
  marks: StageMark[];
  /** Frames a reframe takes to settle. */
  moveDuration?: number;
}> = ({ src, marks, moveDuration = 26 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let idx = 0;
  for (let i = 0; i < marks.length; i++) {
    if (frame >= marks[i].frame) idx = i;
  }

  const to = PRESETS[marks[idx].preset];
  const from = idx === 0 ? to : PRESETS[marks[idx - 1].preset];
  const t =
    idx === 0
      ? 1
      : remotionSpring({
          frame: frame - marks[idx].frame,
          fps,
          config: spring.gentle,
          durationInFrames: moveDuration,
        });

  const border = lerp(from.border, to.border, t);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: lerp(from.x, to.x, t),
          top: lerp(from.y, to.y, t),
          width: lerp(from.w, to.w, t),
          height: lerp(from.h, to.h, t),
          borderRadius: lerp(from.radius, to.radius, t),
          overflow: "hidden",
          boxSizing: "border-box",
          border: `${border}px solid ${theme.line}`,
          backgroundColor: theme.ink,
          opacity: lerp(from.opacity, to.opacity, t),
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${lerp(from.focusX, to.focusX, t)}% 50%`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Exposed so compositions can lay graphics out against the docked card. */
export const stageRect = (preset: StagePreset) => PRESETS[preset];
