import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { LayoutQA, qa } from "../components/LayoutQA";
import { displayFont } from "../fonts";
import { theme } from "../style";

/**
 * A worked example of the layout check. Three cards in one group, a caption
 * that must stay inside the stage. With `broken` on, the third card is pushed
 * onto the second and the caption off the frame, and
 *
 *   node scripts/stills.mjs --qa LayoutCheckDemo out/qa 0
 *
 * reports both. With it off the same command prints "QA: clean". Copy the
 * pattern: tag the boxes that matter with `qa(...)`, mount <LayoutQA />, and
 * give the root `data-qa-root`.
 */
export const layoutCheckDemoSchema = z.object({ broken: z.boolean() });

const Card: React.FC<{ name: string; x: number; broken?: boolean }> = ({ name, x }) => (
  <div
    {...qa(name, { group: "cards", in: "stage" })}
    style={{
      position: "absolute",
      left: x,
      top: 240,
      width: 460,
      height: 360,
      borderRadius: 28,
      backgroundColor: theme.surface,
      fontFamily: displayFont,
      fontSize: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.ink,
    }}
  >
    {name}
  </div>
);

export const LayoutCheckDemo: React.FC<z.infer<typeof layoutCheckDemoSchema>> = ({ broken }) => (
  <AbsoluteFill data-qa-root="1" style={{ backgroundColor: theme.bg }}>
    <LayoutQA />
    <div data-qa-id="stage" style={{ position: "absolute", left: 80, top: 120, width: 1760, height: 760 }} />
    <Card name="One" x={160} />
    <Card name="Two" x={700} />
    <Card name="Three" x={broken ? 900 : 1240} />
    <div
      {...qa("caption", { in: "stage" })}
      style={{
        position: "absolute",
        left: 160,
        top: broken ? 1040 : 700,
        fontFamily: displayFont,
        fontSize: 44,
        color: theme.ink,
      }}
    >
      The caption stays inside the stage.
    </div>
  </AbsoluteFill>
);
