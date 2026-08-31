import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { spring } from "../../style";

export type CursorStop = {
  /** Frame the cursor arrives at this point. */
  frame: number;
  x: number;
  y: number;
  /** Fire a click here — a ring pulses out and the pointer dips. */
  click?: boolean;
};

/**
 * The macOS pointing-hand cursor, moving under its own power.
 *
 * This is the single element that makes a screen shot read as *someone using
 * the product* rather than a screenshot with animation on top. The reference
 * film has it in almost every interface shot.
 *
 * Two details do the work. It **eases between stops on a spring**, so it
 * accelerates away and settles rather than sliding at constant speed — a linear
 * cursor reads as a diagram. And it **dips on click**, which is what a hand
 * actually does; the ring alone looks like a ripple effect.
 */
export const Cursor: React.FC<{
  stops: CursorStop[];
  /** Pointer height in px. The reference sits around 60 on a 1080 frame. */
  size?: number;
  /** Frames the pointer takes to travel between stops. */
  travel?: number;
  /** Hidden until this frame, then fades in. */
  from?: number;
  to?: number;
}> = ({ stops, size = 62, travel = 22, from, to }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (stops.length === 0) return null;

  let idx = 0;
  for (let i = 0; i < stops.length; i++) {
    if (frame >= stops[i].frame) idx = i;
  }

  const target = stops[idx];
  const prev = idx === 0 ? target : stops[idx - 1];

  const t =
    idx === 0
      ? 1
      : remotionSpring({
          frame: frame - target.frame,
          fps,
          config: spring.gentle,
          durationInFrames: travel,
        });

  const x = interpolate(t, [0, 1], [prev.x, target.x]);
  const y = interpolate(t, [0, 1], [prev.y, target.y]);

  // The click lands once the pointer has arrived, not while it is still moving.
  const clickAt = target.click ? target.frame + travel - 4 : null;
  const press =
    clickAt === null
      ? 0
      : interpolate(frame, [clickAt, clickAt + 3, clickAt + 9], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const ring =
    clickAt === null
      ? 0
      : interpolate(frame, [clickAt, clickAt + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const visible = interpolate(
    frame,
    [from ?? -1, (from ?? -1) + 8, (to ?? 1e9) - 8, to ?? 1e9],
    [from === undefined ? 1 : 0, 1, 1, to === undefined ? 1 : 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity: visible,
      }}
    >
      {ring > 0 && ring < 1 && (
        <div
          style={{
            position: "absolute",
            left: -size * 0.5,
            top: -size * 0.5,
            width: size,
            height: size,
            borderRadius: "50%",
            border: `3px solid rgba(26, 19, 18, ${0.4 * (1 - ring)})`,
            transform: `scale(${0.3 + ring * 1.5})`,
          }}
        />
      )}

      {/*
        Hotspot is the fingertip, so the SVG hangs down-right from (x, y) with a
        small negative offset — clicking "at" a point should land the fingertip
        on it, not the wrist.
      */}
      <svg
        width={size}
        height={size * 1.32}
        viewBox="0 0 34 45"
        style={{
          position: "absolute",
          left: -size * 0.18,
          top: -size * 0.08,
          transform: `scale(${1 - press * 0.12})`,
          transformOrigin: "22% 8%",
          filter: "drop-shadow(0 3px 6px rgba(36, 26, 22, 0.35))",
        }}
      >
        <path
          d="M12.4 2.3c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3v14.4l1.4-4.2c.4-1.2 1.7-1.9 2.9-1.5 1.2.4 1.9 1.7 1.5 2.9l-.5 1.6 1-.6c1.1-.6 2.5-.3 3.1.8.4.7.4 1.5.1 2.2l.6-.2c1.2-.4 2.5.3 2.9 1.5.3 1-.1 2-.9 2.6l.5.1c1.2.3 2 1.5 1.7 2.7l-2 8.6c-1 4.3-4.8 7.3-9.2 7.3h-4.7c-3 0-5.8-1.5-7.5-4L2.1 28.8c-.8-1.2-.5-2.7.6-3.5 1.1-.8 2.6-.6 3.5.4l2 2.4V6.1c0-1.3 1-2.3 2.3-2.3"
          fill="#FFFFFF"
          stroke="#1A1312"
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        {/* finger separations — without these it reads as a mitten */}
        <path
          d="M17 30.5V22M21.6 30.5v-7.8M26.2 30.7v-6.4"
          stroke="#1A1312"
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.75}
        />
      </svg>
    </div>
  );
};
