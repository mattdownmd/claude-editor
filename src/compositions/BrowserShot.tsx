import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { AmbientGround } from "../components/AmbientGround";
import { BrowserWindow } from "../components/BrowserWindow";
import { Kicker } from "../components/Kicker";
import { Statement } from "../components/Statement";
import { theme, layout } from "../style";

export const browserShotSchema = z.object({
  kickerIndex: z.string(),
  kickerLabel: z.string(),
  headline: z.string(),
  headlineFrame: z.number(),
  highlight: z.array(z.string()),
  url: z.string(),
  tab: z.string(),
  mode: z.enum(["outline", "solid"]),
  windowFrame: z.number(),
});

/** A browser as the subject. `outline` on the deep ground is the house treatment. */
export const BrowserShot: React.FC<z.infer<typeof browserShotSchema>> = ({
  kickerIndex,
  kickerLabel,
  headline,
  headlineFrame,
  highlight,
  url,
  tab,
  mode,
  windowFrame,
}) => {
  const deep = mode === "outline";

  return (
    <AbsoluteFill>
      <AmbientGround tone={deep ? "deep" : "light"} drift={22} />
      <AbsoluteFill
        style={{
          padding: layout.margin,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 60,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <Kicker index={kickerIndex} label={kickerLabel} delay={0} tone={deep ? "deep" : "light"} />
          <Statement
            text={headline}
            delay={headlineFrame}
            fontSize={80}
            maxWidth={1200}
            color={deep ? theme.bg : theme.ink}
            highlight={highlight}
            accentColor={deep ? theme.cream : theme.accent}
            italicHighlight
          />
        </div>
        <BrowserWindow
          url={url}
          tab={tab}
          mode={mode}
          delay={windowFrame}
          width={1340}
          bodyHeight={300}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
