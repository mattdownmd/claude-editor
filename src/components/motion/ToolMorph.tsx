import React from "react";
import { evolvePath } from "@remotion/paths";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { ShapeMorph } from "./ShapeMorph";
import { burst, playTriangle, ring, VIEW_BOX } from "./shapes";
import { theme, spring } from "../../style";
import { displayFont } from "../../fonts";

/**
 * Claude Code becoming Remotion, as one continuous object.
 *
 * The burst's spokes collapse inward and re-form as the play triangle — the
 * outline never breaks — and the Remotion ring then draws around it. The two
 * captions cross-fade under the mark so the viewer is told what they just
 * watched happen.
 */
export const ToolMorph: React.FC<{
  /** Frame the burst arrives. Key to the word "Claude". */
  fromFrame: number;
  /** Frame the morph starts. Key to the word "Remotion". */
  toFrame: number;
  size?: number;
  labels?: [string, string];
  morphDuration?: number;
}> = ({ fromFrame, toFrame, size = 210, labels = ["Claude Code", "Remotion"], morphDuration = 26 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The ring closes once the triangle has settled — the mark completing itself.
  const ringStart = toFrame + morphDuration - 6;
  const ringDraw = interpolate(frame, [ringStart, ringStart + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const { strokeDasharray, strokeDashoffset } = evolvePath(ringDraw, ring(176));

  const swap = remotionSpring({
    frame: frame - toFrame - 6,
    fps,
    config: spring.snappy,
    durationInFrames: 18,
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <ShapeMorph
          size={size}
          duration={morphDuration}
          keys={[
            { d: burst(12, 94, 30), frame: fromFrame, fill: theme.accent },
            { d: playTriangle(118), frame: toFrame, fill: theme.deep },
          ]}
        />
        <svg
          width={size}
          height={size}
          viewBox={VIEW_BOX}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <path
            d={ring(176)}
            fill="none"
            stroke={theme.deep}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
      </div>

      {/* the caption swaps as the mark does */}
      <div style={{ position: "relative", height: 54, minWidth: 340 }}>
        {labels.map((label, i) => {
          // Hand off with a gap. Overlapping cross-fades stack the two words and
          // read as a strikethrough.
          const shown =
            i === 0
              ? interpolate(swap, [0, 0.4], [1, 0], { extrapolateRight: "clamp" })
              : interpolate(swap, [0.55, 1], [0, 1], { extrapolateLeft: "clamp" });
          return (
            <div
              key={label}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                fontFamily: displayFont,
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: i === 0 ? theme.accent : theme.ink,
                opacity: frame < fromFrame ? 0 : shown,
                transform: `translateY(${interpolate(shown, [0, 1], [16, 0])}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
