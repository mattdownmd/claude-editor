import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { CodeWindow } from "../components/CodeWindow";
import { Kicker } from "../components/Kicker";
import { AnimatedText } from "../components/AnimatedText";
import { theme, layout } from "../style";

export const codeLineSchema = z.object({
  text: z.string(),
  frame: z.number().optional(),
});

export const codeShotSchema = z.object({
  kickerIndex: z.string(),
  kickerLabel: z.string(),
  headline: z.string(),
  headlineFrame: z.number(),
  title: z.string(),
  windowFrame: z.number(),
  stagger: z.number(),
  fontSize: z.number(),
  lines: z.array(codeLineSchema),
});

/** A source file as the subject of the shot. Drop it in wherever the script says "in code". */
export const CodeShot: React.FC<z.infer<typeof codeShotSchema>> = ({
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
        <CodeWindow
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
