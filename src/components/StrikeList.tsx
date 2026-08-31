import React from "react";
import {
  interpolate,
  interpolateColors,
  spring as remotionSpring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, spring, font } from "../style";
import { displayFont } from "../fonts";

export type StrikeItem = {
  text: string;
  /** Frame the item slides in on. */
  enterFrame: number;
  /** Frame the strike-through starts drawing. */
  strikeFrame: number;
};

/**
 * A stack of statements that each get struck through on cue — for spoken
 * sequences of negations ("I don't have X. I don't have Y.").
 *
 * Items arrive from the left rather than fading up, and a struck line settles
 * back a fraction as the rule crosses it — the sentence deflating rather than
 * just changing colour.
 */
export const StrikeList: React.FC<{
  items: StrikeItem[];
  fontSize?: number;
  gap?: number;
  /** `serif` when the list is the shot's statement rather than a UI list. */
  tone?: "serif" | "sans";
  /** Pixels each line travels in from. */
  enterX?: number;
}> = ({ items, fontSize = 84, gap = 34, tone = "sans", enterX = 64 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const serif = tone === "serif";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap, alignItems: "flex-start" }}>
      {items.map((item, i) => {
        const enter = remotionSpring({
          frame: frame - item.enterFrame,
          fps,
          config: spring.snappy,
        });

        // The rule sweeps across on a spring, so it arrives fast and eases out.
        // A linear wipe at this scale reads as a progress bar.
        const strike = remotionSpring({
          frame: frame - item.strikeFrame,
          fps,
          config: spring.gentle,
          durationInFrames: 14,
        });

        return (
          <div
            key={`${item.text}-${i}`}
            style={{
              position: "relative",
              display: "inline-block",
              opacity: enter,
              transform: `translateX(${interpolate(enter, [0, 1], [-enterX, 0])}px) scale(${
                1 - strike * 0.015
              })`,
              transformOrigin: "left center",
            }}
          >
            <span
              style={{
                fontFamily: serif ? font.serif : displayFont,
                fontSize,
                fontWeight: serif ? 400 : 800,
                letterSpacing: serif ? "-0.015em" : "-0.02em",
                lineHeight: 1.12,
                // Fades toward grey as the rule crosses it.
                color: interpolateColors(strike, [0, 1], [theme.ink, theme.olive]),
              }}
            >
              {item.text}
            </span>
            <div
              style={{
                position: "absolute",
                left: 0,
                // Crosses the middle of the letterforms. Inter's optical centre
                // sits a touch below the line box's midpoint at this line-height.
                top: serif ? "50%" : "53%",
                height: serif ? 6 : 8,
                width: `${strike * 100}%`,
                backgroundColor: theme.accent,
                borderRadius: 4,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
