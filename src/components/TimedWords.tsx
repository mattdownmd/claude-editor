import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, spring } from "../style";
import { displayFont } from "../fonts";

export type TimedWord = { text: string; startMs: number; endMs: number };

const strip = (w: string) => w.replace(/[.,!?—–"'']/g, "").toLowerCase();

/**
 * Renders a line of words that each land on the frame the word is actually spoken,
 * using Whisper's per-word timestamps rather than a fixed stagger.
 *
 * `offsetMs` is the section's start time in the source recording, so absolute
 * caption timings can be rebased onto a composition that starts at frame 0.
 */
export const TimedWords: React.FC<{
  words: TimedWord[];
  offsetMs?: number;
  fontSize?: number;
  color?: string;
  highlight?: string[];
  maxWidth?: number;
  leadFrames?: number;
}> = ({
  words,
  offsetMs = 0,
  fontSize = 96,
  color = theme.ink,
  highlight = [],
  maxWidth = 1560,
  leadFrames = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const highlighted = new Set(highlight.map(strip));

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.12em 0.3em",
        fontFamily: displayFont,
        fontSize,
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        maxWidth,
      }}
    >
      {words.map((word, i) => {
        // Land the word slightly ahead of the audio — matching exactly reads as late.
        const startFrame = ((word.startMs - offsetMs) / 1000) * fps - leadFrames;
        const enter = remotionSpring({
          frame: frame - startFrame,
          fps,
          config: spring.snappy,
        });

        const isKey = highlighted.has(strip(word.text));

        return (
          <span
            key={`${word.text}-${i}`}
            style={{
              display: "inline-block",
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [34, 0])}px)`,
              color: isKey ? theme.accent : color,
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
