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

      {/* ---------- worked example ---------- */}
      {/*
        This is the finished intro from this project's own build log, kept as
        a worked example — the props below are one real recording's transcript,
        cut end to end (33.77s = 1013 frames). It needs a video at exactly
        public/video/intro.mp4 to render, which this repo does NOT ship (see
        public/video/README.md) — on a fresh clone this composition errors in
        the Studio until you add one. Every composition above this one needs
        no setup at all and works immediately.

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

          // "because Claude Code or Codex can do this for you" — f554 onward.
          interfaceFrame: 556,
          punchFrame: 640,
          releaseFrame: 700,
          // Content lands with its window. An empty pane, even for a few
          // frames, reads as a loading state.
          codeLines: [
            { text: "// every cue is a spoken word", frame: 556 },
            { text: "<TimedWords words={words} />", frame: 564 },
          ],
          terminalLines: [
            { text: "npx remotion render IntroFull", kind: "command" as const, frame: 584 },
            { text: "1013 frames, 33.8s", kind: "done" as const, frame: 632 },
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
