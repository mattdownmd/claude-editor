import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, spring } from "../style";
import { displayFont } from "../fonts";

export const AnimatedText: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  weight?: number;
  maxWidth?: number;
}> = ({ text, delay = 0, fontSize = 96, color = theme.ink, weight = 800, maxWidth = 1500 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = remotionSpring({
    frame: frame - delay,
    fps,
    config: spring.snappy,
  });

  const y = interpolate(enter, [0, 1], [40, 0]);

  return (
    <div
      style={{
        fontFamily: displayFont,
        fontSize,
        fontWeight: weight,
        color,
        lineHeight: 1.08,
        letterSpacing: "-0.02em",
        maxWidth,
        opacity: enter,
        transform: `translateY(${y}px)`,
      }}
    >
      {text}
    </div>
  );
};

export const WordByWord: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  fontSize?: number;
  color?: string;
  highlight?: string[];
  maxWidth?: number;
}> = ({
  text,
  delay = 0,
  stagger = 2,
  fontSize = 96,
  color = theme.ink,
  highlight = [],
  maxWidth = 1500,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0 0.28em",
        fontFamily: displayFont,
        fontSize,
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        maxWidth,
      }}
    >
      {words.map((word, i) => {
        const enter = remotionSpring({
          frame: frame - delay - i * stagger,
          fps,
          config: spring.snappy,
        });
        const isHighlighted = highlight.includes(word.replace(/[.,!?]/g, ""));
        return (
          <span
            key={`${word}-${i}`}
            style={{
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
              color: isHighlighted ? theme.accent : color,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
