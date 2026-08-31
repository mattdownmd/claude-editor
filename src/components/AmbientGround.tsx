import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../style";

export type GroundTone = "light" | "deep";

type Wash = { color: string; x: string; y: string; size: string };

/**
 * The ground everything sits on. Not a flat fill — a few very soft colour
 * washes bleeding into each other, the way a well-lit product shot has
 * atmosphere rather than a backdrop.
 *
 * This is the one place ambient motion is allowed: the washes drift a few
 * pixels over the whole composition. It reads as air, not animation. Pass
 * `drift={0}` for a shot that has to sit perfectly still.
 */
export const AmbientGround: React.FC<{
  tone?: GroundTone;
  /** Pixels the washes travel across the whole composition. */
  drift?: number;
  /** Faint dotted grid, for canvas and workflow shots. */
  grid?: boolean;
  durationInFrames?: number;
}> = ({ tone = "light", drift = 26, grid = false, durationInFrames = 900 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, durationInFrames], [0, Math.PI * 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Opposite arcs, so the field breathes rather than sliding one way.
  const ax = Math.sin(t) * drift;
  const ay = Math.cos(t) * drift * 0.6;
  const bx = Math.cos(t) * -drift;
  const by = Math.sin(t) * -drift * 0.6;

  const light = tone === "light";

  const washes: Wash[] = light
    ? [
        { color: theme.accentSoft, x: "18%", y: "24%", size: "58% 50%" },
        { color: theme.cream, x: "84%", y: "76%", size: "54% 48%" },
        { color: theme.line, x: "62%", y: "12%", size: "40% 36%" },
      ]
    : [
        { color: theme.deepAlt, x: "20%", y: "26%", size: "60% 52%" },
        { color: theme.accent, x: "82%", y: "78%", size: "54% 48%" },
        { color: theme.olive, x: "58%", y: "10%", size: "38% 34%" },
      ];

  const offsets = [
    [ax, ay],
    [bx, by],
    [ax * 0.5, by * 0.5],
  ];

  const backgroundImage = washes
    .map((w, i) => {
      const [dx, dy] = offsets[i];
      return `radial-gradient(${w.size} at calc(${w.x} + ${dx.toFixed(1)}px) calc(${w.y} + ${dy.toFixed(1)}px), ${w.color}, transparent 70%)`;
    })
    .join(", ");

  return (
    <AbsoluteFill style={{ backgroundColor: light ? theme.bg : theme.deep }}>
      <AbsoluteFill style={{ backgroundImage, opacity: light ? 0.55 : 0.6 }} />
      {grid && (
        <AbsoluteFill
          style={{
            backgroundImage: `radial-gradient(circle, ${
              light ? theme.line : theme.deepAlt
            } 1.6px, transparent 1.6px)`,
            backgroundSize: "38px 38px",
            opacity: light ? 0.75 : 0.6,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
