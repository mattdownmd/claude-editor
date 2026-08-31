import React from "react";
import { Composition } from "remotion";
import { IntroFull, introFullSchema } from "./compositions/IntroFull";
import { CodeShot, codeShotSchema } from "./compositions/CodeShot";
import { TerminalShot, terminalShotSchema } from "./compositions/TerminalShot";
import { DesignSystem } from "./compositions/DesignSystem";
import { MotionReel } from "./compositions/MotionReel";
import { BrowserShot, browserShotSchema } from "./compositions/BrowserShot";
import { WorkflowShot, workflowShotSchema } from "./compositions/WorkflowShot";
import { layout } from "./style";

/**
 * Every composition in the Studio.
 *
 *   IntroFull    the finished intro, cut against Intro.mp4's transcript
 *   DesignSystem the palette, type and parts on one frame — a reference board
 *   MotionReel   the four motion mechanics, back to back
 *   *Shot        drop-in 1920x1080 shots: point them at new content, no layout
 *
 * Superseded work lives in _archive/ with a note on why it left.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ---------- the system ---------- */}
      {/*
        Reference board. Every token with its hex, the type scale, and the
        parts that use them. Not for cutting into a video — for checking what
        something is called before writing a new shot.
      */}
      <Composition
        id="DesignSystem"
        component={DesignSystem}
        durationInFrames={60}
        fps={layout.fps}
        width={layout.width}
        height={layout.height}
      />
      {/* A source file as the subject of the shot. */}
      <Composition
        id="CodeShot"
        component={CodeShot}
        durationInFrames={180}
        fps={layout.fps}
        width={layout.width}
        height={layout.height}
        schema={codeShotSchema}
        defaultProps={{
          kickerIndex: "01",
          kickerLabel: "What you're watching",
          headline: "Every animation in this video",
          headlineFrame: 8,
          title: "IntroFull.tsx",
          windowFrame: 34,
          stagger: 9,
          fontSize: 27,
          lines: [
            { text: "const words = readCaptions(\"intro\");" },
            { text: "" },
            { text: "// every cue is a spoken word, not a guess" },
            { text: "<TimedWords words={words} leadFrames={3} />" },
          ],
        }}
      />
      {/* The commands themselves, typing out. */}
      <Composition
        id="TerminalShot"
        component={TerminalShot}
        durationInFrames={260}
        fps={layout.fps}
        width={layout.width}
        height={layout.height}
        schema={terminalShotSchema}
        defaultProps={{
          kickerIndex: "02",
          kickerLabel: "The loop",
          headline: "Three commands, every video",
          headlineFrame: 8,
          title: "zsh",
          windowFrame: 34,
          stagger: 34,
          fontSize: 27,
          lines: [
            { text: "npm run transcribe -- public/video/intro.mp4", kind: "command" as const },
            { text: "112 words timed", kind: "done" as const },
            { text: "claude", kind: "command" as const },
            { text: "IntroFull.tsx written", kind: "done" as const },
            { text: "npx remotion render IntroFull out/intro.mp4", kind: "command" as const },
          ],
        }}
      />

      {/*
        Reference reel for the four motion mechanics. Not a shot to cut in —
        watch it to see what a move looks like before asking for it by name.
      */}
      <Composition
        id="MotionReel"
        component={MotionReel}
        durationInFrames={700}
        fps={layout.fps}
        width={layout.width}
        height={layout.height}
      />

      {/* A browser as a graphic object, not a screenshot. */}
      <Composition
        id="BrowserShot"
        component={BrowserShot}
        durationInFrames={180}
        fps={layout.fps}
        width={layout.width}
        height={layout.height}
        schema={browserShotSchema}
        defaultProps={{
          kickerIndex: "03",
          kickerLabel: "The fix",
          headline: "Your editor is a prompt away",
          headlineFrame: 8,
          highlight: ["prompt"],
          url: "remotion.dev",
          tab: "Remotion",
          mode: "outline" as const,
          windowFrame: 30,
        }}
      />
      {/* The handoff between tools, drawn as a node canvas. */}
      <Composition
        id="WorkflowShot"
        component={WorkflowShot}
        durationInFrames={220}
        fps={layout.fps}
        width={layout.width}
        height={layout.height}
        schema={workflowShotSchema}
        defaultProps={{
          kickerIndex: "03",
          kickerLabel: "The fix",
          headline: "You talk. Everything after that is a handoff.",
          headlineFrame: 8,
          highlight: ["handoff."],
          graphFrame: 42,
          stagger: 20,
          nodes: [
            { id: "rec", label: "Recording", rows: ["intro.mp4", "33.8s"], x: 0, y: 56, w: 340, h: 172 },
            { id: "whisper", label: "Transcript", rows: ["112 words", "word-level ms"], x: 440, y: 56, w: 340, h: 172 },
            { id: "claude", label: "Claude Code", rows: ["reads STYLE.md", "writes the shots"], x: 880, y: 56, w: 360, h: 172 },
            { id: "out", label: "Rendered", rows: ["1920x1080", "audio intact"], x: 1340, y: 56, w: 300, h: 172, accent: true },
          ],
          edges: [
            { from: "rec", to: "whisper" },
            { from: "whisper", to: "claude" },
            { from: "claude", to: "out" },
          ],
        }}
      />

      {/* ---------- the finished intro ---------- */}
      {/*
        Intro.mp4 end to end (33.77s = 1013 frames) with every graphic cut in.
        Section frames live in the component; the props here are the content.
        Whisper mis-heard "Claude Code" as "clock code" and "Remotion" as
        "rem|otion" — the timings are its, the spellings are corrected.
      */}
      <Composition
        id="IntroFull"
        component={IntroFull}
        durationInFrames={1013}
        fps={layout.fps}
        width={layout.width}
        height={layout.height}
        schema={introFullSchema}
        defaultProps={{
          videoSrc: "video/intro.mp4",

          claimHeadline: "Every animation in this video",
          claimFrame: 92,
          claudeFrame: 162,
          remotionFrame: 207,

          constraints: [
            { text: "No editor", enterFrame: 258, strikeFrame: 292 },
            { text: "No motion designer", enterFrame: 306, strikeFrame: 350 },
            { text: "Never learned to edit", enterFrame: 375, strikeFrame: 452 },
          ],

          turnWords: [
            { text: "But", startMs: 15880, endMs: 16190 },
            { text: "nowadays", startMs: 16190, endMs: 17020 },
            { text: "you", startMs: 17020, endMs: 17330 },
            { text: "don't", startMs: 17330, endMs: 17830 },
            { text: "have", startMs: 17830, endMs: 18480 },
            { text: "to.", startMs: 18480, endMs: 19030 },
          ],
          turnHighlight: ["to."],
          cameraFrame: 556,
          graphFrame: 664,
          stampFrame: 706,
          nodes: [
            { id: "rec", label: "Recording", rows: ["intro.mp4", "just talk"], x: 0, y: 0, w: 350, h: 226, frame: 664 },
            { id: "claude", label: "Claude Code", rows: ["or Codex", "reads STYLE.md"], x: 448, y: 0, w: 372, h: 226, frame: 676 },
            { id: "remotion", label: "Remotion", rows: ["renders the shots"], x: 918, y: 0, w: 350, h: 226, frame: 688 },
            { id: "out", label: "Animations", rows: ["ready to cut"], x: 1366, y: 0, w: 300, h: 226, accent: true, frame: 700 },
          ],
          edges: [
            { from: "rec", to: "claude", frame: 674 },
            { from: "claude", to: "remotion", frame: 686 },
            { from: "remotion", to: "out", frame: 698 },
          ],

          promiseHeadline: "The step-by-step guide",
          promiseFrame: 752,
          stepsFrame: 846,
          stepsStagger: 20,
          steps: [
            { label: "Install Remotion", sub: "one prompt" },
            { label: "Write your style file", sub: "so every video matches" },
            { label: "Turn on plan mode", sub: "shift + tab" },
            { label: "Prompt, preview, render", sub: "then cut it in" },
          ],
        }}
      />

    </>
  );
};
