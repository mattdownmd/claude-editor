import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { TerminalWindow } from "../components/TerminalWindow";
import { Kicker } from "../components/Kicker";
import { AnimatedText } from "../components/AnimatedText";
import { theme, layout } from "../style";

export const terminalLineSchema = z.object({
  text: z.string(),
  kind: z.enum(["command", "output", "done"]).optional(),
  frame: z.number().optional(),
  typeFrames: z.number().optional(),
});

export const terminalShotSchema = z.object({
  kickerIndex: z.string(),
  kickerLabel: z.string(),
  headline: z.string(),
  headlineFrame: z.number(),
  title: z.string(),
  windowFrame: z.number(),
  stagger: z.number(),
  fontSize: z.number(),
  lines: z.array(terminalLineSchema),
});

/** The commands themselves, typing out. Use when the point is what you actually run. */
export const TerminalShot: React.FC<z.infer<typeof terminalShotSchema>> = ({
  kickerIndex,
  kickerLabel,
  headline,
  headlineFrame,
  title,
  windowFrame,
  stagger,
  fontSize,
  lines,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <div
        style={{
          position: "absolute",
          left: layout.margin,
          top: layout.margin,
          width: layout.width - layout.margin * 2,
          height: layout.height - layout.margin * 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 44,
        }}
      >
        <Kicker index={kickerIndex} label={kickerLabel} delay={0} />
        <AnimatedText text={headline} delay={headlineFrame} fontSize={78} maxWidth={1300} />
        <TerminalWindow
          lines={lines}
          title={title}
          delay={windowFrame}
          stagger={stagger}
          fontSize={fontSize}
          width={1320}
        />
      </div>
    </AbsoluteFill>
  );
};
