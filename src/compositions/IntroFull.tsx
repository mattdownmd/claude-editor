import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { AmbientGround } from "../components/AmbientGround";
import { ArollStage } from "../components/ArollStage";
import { ChapterRail } from "../components/ChapterRail";
import { CodeWindow } from "../components/CodeWindow";
import { TerminalWindow } from "../components/TerminalWindow";
import { Kicker } from "../components/Kicker";
import { Shot } from "../components/Shot";
import { Statement } from "../components/Statement";
import { StrikeList } from "../components/StrikeList";
import { StepList } from "../components/StepList";
import { WorkflowGraph } from "../components/WorkflowGraph";
import { Camera, CameraLayer } from "../components/motion/Camera";
import { ToolMorph } from "../components/motion/ToolMorph";
import { Throw } from "../components/motion/Throw";
import { timedWordSchema, strikeItemSchema, stepSchema } from "../schemas";
import { graphNodeSchema, graphEdgeSchema } from "./WorkflowShot";
import { layout } from "../style";

export const introFullSchema = z.object({
  videoSrc: z.string(),

  // §1 — the claim
  claimHeadline: z.string(),
  claimFrame: z.number(),
  claudeFrame: z.number(),
  remotionFrame: z.number(),

  // §2 — the problem
  constraints: z.array(strikeItemSchema),

  // §3 — the fix, full frame
  turnWords: z.array(timedWordSchema),
  turnHighlight: z.array(z.string()),
  cameraFrame: z.number(),
  graphFrame: z.number(),
  stampFrame: z.number(),
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),

  // §4 — what's coming
  promiseHeadline: z.string(),
  promiseFrame: z.number(),
  stepsFrame: z.number(),
  stepsStagger: z.number(),
  steps: z.array(stepSchema),
});

/**
 * The graphics column beside the docked card.
 *
 * Top-aligned, not centred: each section carries a different amount of content,
 * so centring made the kicker land at a different height every time (290, 337,
 * 220 across the three column sections). A label that moves between sections
 * reads as sloppy — the eye tracks it. Pinning the top holds it still.
 */
const COLUMN: React.CSSProperties = {
  position: "absolute",
  left: layout.margin,
  top: 258,
  width: 930,
  height: 672,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
};

/**
 * The complete intro, cut against Intro.mp4's own transcript.
 *
 * The recording reframes rather than cross-fading, and §3 hands the frame over
 * to graphics entirely — the card goes to `off`, the voice keeps running, and
 * the camera travels through the toolchain. Every cue is a spoken word:
 *
 *   §1  f78  – f250   "…created by Claude Code using Remotion."   docked right
 *   §2  f250 – f476   "no editor / no motion designer"            docked right
 *   §3  f476 – f742   "but nowadays you don't have to"            FULL FRAME
 *   §4  f742 – f975   "the step-by-step guide"                    docked right
 *   end f975 – f1013  "Let's start."                              full bleed
 */
export const IntroFull: React.FC<z.infer<typeof introFullSchema>> = ({
  videoSrc,
  claimHeadline,
  claimFrame,
  claudeFrame,
  remotionFrame,
  constraints,
  turnWords,
  turnHighlight,
  cameraFrame,
  graphFrame,
  stampFrame,
  nodes,
  edges,
  promiseHeadline,
  promiseFrame,
  stepsFrame,
  stepsStagger,
  steps,
}) => {
  const frame = useCurrentFrame();

  // The §3 statement clears the frame as the camera move begins.
  const turnOut = interpolate(frame, [cameraFrame - 18, cameraFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AmbientGround tone="light" drift={22} durationInFrames={1013} />

      <ArollStage
        src={videoSrc}
        marks={[
          { frame: 0, preset: "full" },
          { frame: 78, preset: "right" },
          { frame: 476, preset: "off" },
          { frame: 742, preset: "right" },
          { frame: 975, preset: "full" },
        ]}
      />

      {/* §1 — the claim. The Claude mark arrives on his name and becomes the
          Remotion mark on hers: one object, no cut. */}
      <Shot from={80} to={250} style={{ ...COLUMN, gap: 56 }}>
        <Kicker index="01" label="What you're watching" delay={80} />
        <Statement text={claimHeadline} delay={claimFrame} fontSize={78} maxWidth={930} />
        <ToolMorph fromFrame={claudeFrame} toFrame={remotionFrame} size={190} />
      </Shot>

      {/* §2 — three things he doesn't have, struck through as he says them. */}
      <Shot from={250} to={476} style={{ ...COLUMN, gap: 54 }}>
        <Kicker index="02" label="The problem" delay={252} />
        <StrikeList items={constraints} fontSize={78} gap={30} tone="serif" enterX={72} />
      </Shot>

      {/* §3 — full frame. The card is gone; only the voice remains. */}
      <Shot from={476} to={742} exitFrames={14} style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", left: layout.margin, top: layout.margin }}>
          <Kicker index="03" label="The fix" delay={478} />
        </div>

        {/* Fixed top rather than centred: words arrive one at a time, so a
            centred block would jump down the frame the moment it wraps. */}
        <div
          style={{
            position: "absolute",
            left: layout.margin,
            top: 360,
            width: 1500,
            opacity: turnOut,
          }}
        >
          <Statement
            words={turnWords}
            fontSize={118}
            maxWidth={1500}
            highlight={turnHighlight}
            italicHighlight
          />
        </div>

        {frame >= cameraFrame - 6 && (
          <Camera
            perspective={1900}
            moveDuration={46}
            marks={[
              { frame: cameraFrame, z: -60, x: 0, y: 0 },
              { frame: cameraFrame + 52, z: 720, x: 240, y: 0 },
              { frame: graphFrame, z: 1480, x: -210, y: 0 },
            ]}
          >
            <CameraLayer z={0} x={0} y={0}>
              <div style={{ width: 1560 }}>
                <CodeWindow
                  title="IntroFull.tsx"
                  delay={cameraFrame}
                  fontSize={34}
                  lines={[
                    // Content lands with the window. An empty pane, even for a
                    // few frames, reads as a loading state.
                    { text: "// every cue is a spoken word", frame: cameraFrame },
                    { text: "<TimedWords words={words} />", frame: cameraFrame + 8 },
                  ]}
                />
              </div>
            </CameraLayer>

            <CameraLayer z={-780} x={240} y={0}>
              <div style={{ width: 1560 }}>
                <TerminalWindow
                  title="zsh"
                  delay={cameraFrame + 44}
                  fontSize={34}
                  lines={[
                    { text: "claude", kind: "command", frame: cameraFrame + 46 },
                    { text: "IntroFull.tsx written", kind: "done", frame: cameraFrame + 74 },
                  ]}
                />
              </div>
            </CameraLayer>

            <CameraLayer z={-1560} x={-210} y={0}>
              <div style={{ width: 1640 }}>
                <WorkflowGraph
                  nodes={nodes}
                  edges={edges}
                  width={1640}
                  height={230}
                  delay={graphFrame}
                  stampFrame={stampFrame}
                />
              </div>
            </CameraLayer>
          </Camera>
        )}
      </Shot>

      {/* §4 — the roadmap. Steps are thrown in rather than faded up. */}
      <Shot from={742} to={975} exitFrames={14} style={{ ...COLUMN, gap: 40 }}>
        <Kicker index="04" label="What's coming" delay={744} />
        <Statement text={promiseHeadline} delay={promiseFrame} fontSize={78} maxWidth={930} />
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {steps.map((step, i) => (
            <Throw
              key={step.label}
              delay={stepsFrame + i * stepsStagger}
              from={{ x: -560, y: 0 }}
              spin={-3}
            >
              <StepList steps={[step]} animate={false} fontSize={44} startIndex={i} />
            </Throw>
          ))}
        </div>
      </Shot>

      <ChapterRail ticks={[250, 476, 742]} total={1013} from={70} to={966} />
    </AbsoluteFill>
  );
};
