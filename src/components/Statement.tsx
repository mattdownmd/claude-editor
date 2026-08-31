import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, spring, font } from "../style";
import type { TimedWord } from "./TimedWords";

/**
 * A statement headline in the serif. This is the brand voice — use it for the
 * one sentence a shot exists to deliver, not for labels or UI copy.
 *
 * Words rise in sequence rather than the block fading as one. At this size the
 * stagger is what makes it feel spoken.
 */
export const Statement: React.FC<{
  text?: string;
  /**
   * Transcript words with their own timings. When given, each word lands on the
   * frame it is spoken rather than on a fixed stagger — `text` is ignored.
   */
  words?: TimedWord[];
  /** Frames ahead of the audio each word lands. Matching exactly reads as late. */
  leadFrames?: number;
  delay?: number;
  stagger?: number;
  fontSize?: number;
  color?: string;
  /** Words rendered in the accent. Matched case-insensitively, punctuation ignored. */
  highlight?: string[];
  maxWidth?: number;
  weight?: number;
  italicHighlight?: boolean;
  /** Colour for highlighted words. Flip to `theme.cream` on a dark ground. */
  accentColor?: string;
}> = ({
  text,
  words: timed,
  leadFrames = 3,
  delay = 0,
  stagger = 2,
  fontSize = 92,
  color = theme.ink,
  highlight = [],
  maxWidth = 1400,
  weight = 400,
  italicHighlight = false,
  accentColor = theme.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const strip = (w: string) => w.replace(/[.,!?—–"'']/g, "").toLowerCase();
  const keys = new Set(highlight.map(strip));
  const words = timed ? timed.map((w) => w.text) : (text ?? "").split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.08em 0.26em",
        fontFamily: font.serif,
        fontSize,
        fontWeight: weight,
        lineHeight: 1.08,
        letterSpacing: "-0.015em",
        maxWidth,
      }}
    >
      {words.map((word, i) => {
        const landed = timed
          ? (timed[i].startMs / 1000) * fps - leadFrames
          : delay + i * stagger;
        const enter = remotionSpring({
          frame: frame - landed,
          fps,
          config: spring.snappy,
        });
        const isKey = keys.has(strip(word));

        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [32, 0])}px)`,
              color: isKey ? accentColor : color,
              fontStyle: isKey && italicHighlight ? "italic" : "normal",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
