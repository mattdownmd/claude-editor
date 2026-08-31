import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Ground, GroundMark } from "../components/Ground";
import { ArollStage } from "../components/ArollStage";
import { ChapterRail } from "../components/ChapterRail";
import { CodeWindow } from "../components/CodeWindow";
import { TerminalWindow } from "../components/TerminalWindow";
import { Kicker } from "../components/Kicker";
import { Shot } from "../components/Shot";
import { Statement } from "../components/Statement";
import { StrikeList } from "../components/StrikeList";
import { StepList } from "../components/StepList";
import { Cursor } from "../components/motion/Cursor";
import { Punch } from "../components/motion/Punch";
import { ToolMorph } from "../components/motion/ToolMorph";
import { Throw } from "../components/motion/Throw";
import { timedWordSchema, strikeItemSchema, stepSchema } from "../schemas";
import { codeLineSchema } from "./CodeShot";
import { terminalLineSchema } from "./TerminalShot";
import { theme, layout } from "../style";

export const introFullSchema = z.object({
  videoSrc: z.string(),

  // §1 — the claim
  claimHeadline: z.string(),
  claimFrame: z.number(),
  claudeFrame: z.number(),
  remotionFrame: z.number(),

  // §2 — the problem
  constraints: z.array(strikeItemSchema),

  // §3 — the fix, full frame on clay, driven by a cursor
  turnWords: z.array(timedWordSchema),
  turnHighlight: z.array(z.string()),
  codeLines: z.array(codeLineSchema),
  terminalLines: z.array(terminalLineSchema),
  interfaceFrame: z.number(),
  punchFrame: z.number(),
  releaseFrame: z.number(),

  // §4 — what's coming
  promiseHeadline: z.string(),
  promiseFrame: z.number(),
  stepsFrame: z.number(),
  stepsStagger: z.number(),
  steps: z.array(stepSchema),
});

/**
 * The ground changes once, on the turn of the script. Cream carries the setup
 * and the problem; clay carries the fix and the promise. That single cut does
 * more structural work than any transition — the viewer knows the subject
 * changed before a word lands.
 */
const GROUND: GroundMark[] = [
  { frame: 0, tone: "cream" },
  { frame: 476, tone: "clay" },
];

/** The graphics column beside the docked card. Top-aligned so the kicker holds still. */
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
 * The complete intro, cut against Intro.mp4's own transcript, in the language
 * of the reference film: flat grounds, interfaces floating as cards, a visible
 * cursor doing the clicking, and a punch-in when a detail matters.
 *
 *   §1  f78  – f250   "…created by Claude Code using Remotion."   cream, docked
 *   §2  f250 – f476   "no editor / no motion designer"            cream, docked
 *   §3  f476 – f742   "but nowadays you don't have to"            CLAY, full frame
 *   §4  f742 – f975   "the step-by-step guide"                    clay, docked
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
  codeLines,
  terminalLines,
  interfaceFrame,
  punchFrame,
  releaseFrame,
  promiseHeadline,
  promiseFrame,
  stepsFrame,
  stepsStagger,
  steps,
}) => {
  const frame = useCurrentFrame();

  // Once the punch commits to the terminal the editor stops being the subject.
  // Letting it hang half-cropped at the top edge reads as a mistake, not a crop.
  const editorOut = interpolate(frame, [punchFrame - 6, punchFrame + 14], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Comes back only once the punch has actually released. Fading it in while
  // still zoomed puts a 1.5x ghost of the code across the kicker.
  const editorBack = interpolate(frame, [releaseFrame + 14, releaseFrame + 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The turn line clears as the interface arrives.
  const turnOut = interpolate(frame, [interfaceFrame - 16, interfaceFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Ground marks={GROUND} />

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

      {/* §3 — the turn. Ground goes clay, the card leaves, and the tools do the
          talking: a real interface, a cursor working it, and a punch onto the
          line that matters. */}
      <Shot from={476} to={742} exitFrames={14} style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", left: layout.margin, top: layout.margin }}>
          <Kicker index="03" label="The fix" delay={478} tone="clay" />
        </div>

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
            color={theme.onClay}
            highlight={turnHighlight}
            accentColor={theme.deep}
            italicHighlight
          />
        </div>

        {frame >= interfaceFrame - 8 && (
          <Punch
            moveDuration={30}
            marks={[
              { frame: interfaceFrame, scale: 1, x: 960, y: 540 },
              // Onto the terminal's result line, not the frame centre. 1.5 is
              // as far as this can go before the editor above it stops being
              // readable and starts reading as a broken crop.
              { frame: punchFrame, scale: 1.5, x: 1130, y: 790 },
              { frame: releaseFrame, scale: 1, x: 960, y: 540 },
            ]}
          >
            <AbsoluteFill>
              {/* Light windows, not dark. The reference floats app UI as pale
                  cards on the clay — a dark panel on this ground goes muddy. */}
              <div
                style={{
                  position: "absolute",
                  left: 200,
                  top: 200,
                  width: 1180,
                  opacity: Math.max(editorOut, editorBack),
                }}
              >
                <CodeWindow
                  title="IntroFull.tsx"
                  delay={interfaceFrame}
                  fontSize={28}
                  tone="light"
                  lines={codeLines}
                />
              </div>

              <div style={{ position: "absolute", left: 540, top: 656, width: 1180 }}>
                <TerminalWindow
                  title="zsh"
                  delay={interfaceFrame + 28}
                  fontSize={28}
                  tone="light"
                  lines={terminalLines}
                />
              </div>

              {/* Inside the punch on purpose: a real screen recording magnifies
                  its cursor along with everything else. */}
              <Cursor
                from={interfaceFrame + 8}
                to={releaseFrame + 26}
                size={54}
                travel={20}
                stops={[
                  { frame: interfaceFrame + 8, x: 1500, y: 420 },
                  { frame: interfaceFrame + 22, x: 1080, y: 330, click: true },
                  { frame: interfaceFrame + 52, x: 900, y: 742, click: true },
                  { frame: punchFrame + 26, x: 1180, y: 800 },
                ]}
              />
            </AbsoluteFill>
          </Punch>
        )}

      </Shot>

      {/* §4 — the roadmap. Steps are thrown in rather than faded up. */}
      <Shot from={742} to={975} exitFrames={14} style={{ ...COLUMN, gap: 40 }}>
        <Kicker index="04" label="What's coming" delay={744} tone="clay" />
        <Statement
          text={promiseHeadline}
          delay={promiseFrame}
          fontSize={78}
          maxWidth={930}
          color={theme.onClay}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {steps.map((step, i) => (
            <Throw
              key={step.label}
              delay={stepsFrame + i * stepsStagger}
              from={{ x: -560, y: 0 }}
              spin={-3}
            >
              <StepList
                steps={[step]}
                animate={false}
                fontSize={44}
                startIndex={i}
                tone="clay"
              />
            </Throw>
          ))}
        </div>
      </Shot>

      <ChapterRail ticks={[250, 476, 742]} total={1013} from={70} to={966} clayFrom={476} />
    </AbsoluteFill>
  );
};
