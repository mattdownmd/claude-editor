import React from "react";
import { noise2D } from "@remotion/noise";
import { measureText } from "@remotion/layout-utils";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import type { TimedWord } from "../TimedWords";
import { theme, spring } from "../../style";
import { displayFont } from "../../fonts";

type Placed = TimedWord & { tx: number; ty: number; w: number };

/**
 * The transcript arriving as a swarm. Every word starts scattered on a noise
 * field, drifting; on the frame it is actually spoken it flies to its place in
 * the sentence and locks.
 *
 * The motion is derived from the recording rather than authored — the scatter
 * is seeded per word and the arrival is the Whisper timing, so no two videos
 * animate the same way.
 */
export const WordSwarm: React.FC<{
  words: TimedWord[];
  fontSize?: number;
  maxWidth?: number;
  lineHeight?: number;
  color?: string;
  highlight?: string[];
  /** How far the scattered words start from home. */
  spread?: number;
  leadFrames?: number;
}> = ({
  words,
  fontSize = 82,
  maxWidth = 1400,
  lineHeight = 1.12,
  color = theme.ink,
  highlight = [],
  spread = 520,
  leadFrames = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const strip = (w: string) => w.replace(/[.,!?—–"'']/g, "").toLowerCase();
  const keys = new Set(highlight.map(strip));

  // Lay the sentence out by hand: measure each word, break lines at maxWidth.
  const space = measureText({
    text: " ",
    fontFamily: displayFont,
    fontSize,
    fontWeight: "700",
  }).width;

  const placed: Placed[] = [];
  let cursorX = 0;
  let line = 0;

  for (const word of words) {
    const text = word.text.trim();
    const { width } = measureText({
      text,
      fontFamily: displayFont,
      fontSize,
      fontWeight: "700",
    });

    if (cursorX > 0 && cursorX + width > maxWidth) {
      line += 1;
      cursorX = 0;
    }

    placed.push({ ...word, text, tx: cursorX, ty: line * fontSize * lineHeight, w: width });
    cursorX += width + space;
  }

  const height = (line + 1) * fontSize * lineHeight;

  return (
    <div style={{ position: "relative", width: maxWidth, height }}>
      {placed.map((word, i) => {
        const landed = (word.startMs / 1000) * fps - leadFrames;

        const settle = remotionSpring({
          frame: frame - landed,
          fps,
          config: spring.snappy,
          durationInFrames: 26,
        });

        // Scatter position, seeded per word so it is stable across renders.
        const sx = noise2D("swarm-x", i * 0.7, 0) * spread;
        const sy = noise2D("swarm-y", 0, i * 0.7) * spread * 0.55;

        // Before it lands the word drifts on the field rather than sitting still.
        const drift = frame * 0.014;
        const dx = noise2D("drift-x", i * 0.5, drift) * 26;
        const dy = noise2D("drift-y", drift, i * 0.5) * 26;

        const x = interpolate(settle, [0, 1], [word.tx + sx + dx, word.tx]);
        const y = interpolate(settle, [0, 1], [word.ty + sy + dy, word.ty]);

        // Far from home it is small, faint and out of focus.
        const blur = interpolate(settle, [0, 0.7, 1], [7, 1.4, 0], {
          extrapolateRight: "clamp",
        });

        return (
          <span
            key={`${word.text}-${i}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate(${x}px, ${y}px) scale(${interpolate(
                settle,
                [0, 1],
                [0.62, 1],
              )})`,
              transformOrigin: "left top",
              fontFamily: displayFont,
              fontSize,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              whiteSpace: "pre",
              color: keys.has(strip(word.text)) ? theme.accent : color,
              opacity: interpolate(settle, [0, 0.35, 1], [0.16, 0.5, 1], {
                extrapolateRight: "clamp",
              }),
              filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
