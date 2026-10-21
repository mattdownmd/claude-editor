# Video Motion Editor

A [Remotion](https://remotion.dev) template driven by [Claude Code](https://claude.com/claude-code):
record yourself talking, and Claude builds motion graphics timed to your own
words. Every animation cue comes from a word-level transcript timestamp — not
a guess, not a fixed stagger.

```
you say "Claude" at 5510ms → 5510 / 1000 × 30fps = frame 165
```

The land is that frame, 3 frames early so it doesn't read late.

## What's in here

This isn't a blank Remotion starter — it's a working system. Everything below
is committed to this repo:

```
CLAUDE.md            rules Claude Code reads every session — file layout, workflow order
STYLE.md             the design system: palette, type, motion rules, what to avoid
LICENSE              MIT

src/
  Root.tsx            registers every composition, editable in the Studio
  style.ts            colour, radius and shadow tokens — never hardcode a hex
  fonts.ts            the three loaded Google Fonts
  schemas.ts          shared zod types (timed words, steps, graph nodes...)
  data/               your transcripts land here — gitignored, regenerated per video

  components/
    ArollStage.tsx       the recording, reframed between full / docked / inset
    Shot.tsx             holds one section's graphics for a frame range
    TimedWords.tsx        Statement.tsx    kinetic type keyed to speech
    StrikeList.tsx        StepList.tsx     spoken negations / numbered steps
    Window.tsx  CodeWindow.tsx  TerminalWindow.tsx  BrowserWindow.tsx
    WorkflowGraph.tsx     a tool handoff drawn as a node canvas
    AmbientGround.tsx     the soft colour-washed background every shot sits on
    Kicker.tsx  ChapterRail.tsx  ToolChip.tsx

    motion/
      ShapeMorph.tsx  ToolMorph.tsx   one shape becoming another (@remotion/paths)
      Camera.tsx                     a 3D camera travelling through layered windows
      Throw.tsx                      overshoot + spin + motion-blur trail
      WordSwarm.tsx                  transcript words scattering in on a noise field
      shapes.ts                      the shared shape library everything morphs between

  compositions/
    IntroFull.tsx        worked example — see "Try it" below
    DesignSystem.tsx      MotionReel.tsx     reference boards, no setup needed
    CodeShot.tsx  TerminalShot.tsx  BrowserShot.tsx  WorkflowShot.tsx
                          drop-in 1920×1080 shots — change the props, get a new graphic

public/
  video/  audio/       your recordings go here — gitignored, folders kept via README
  logos/               empty on purpose — your brand assets go here

references/
  color palette.png    the palette this repo's STYLE.md was built from — swap for yours

scripts/
  transcribe.mjs        turns a recording into word-level timings
  gaps.py               finds the pauses, so cuts go in the gaps
  cut.mjs               cuts a recording from a list of keepers, levels the voice
  stills.mjs            preview stills, contact sheets, --qa layout check
  final.mjs             the colour-safe final render (see "Final render")
  track-cursor.py       finds the recorded mouse pointer in a screen recording
  erase-cursor.py       paints it out so the drawn Cursor can replace it
```

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Claude Code](https://claude.com/claude-code) — `npm install -g @anthropic-ai/claude-code`
- [ffmpeg](https://ffmpeg.org) on your PATH, for cutting and the final render (`brew install ffmpeg`)
- Python 3 with numpy, only for the cursor and gap tools (`pip3 install numpy`)

Transcription needs no install of its own: `npm run transcribe` downloads and
builds whisper.cpp itself the first time you run it (a few minutes; seconds
after that). It needs a C/C++ compiler and cmake (on a Mac: Xcode command line
tools).

Claude Code asks for your permission before it runs anything system-level —
installing a package, running an unfamiliar command — the same way it did
while this project was built. The one thing that installs itself silently is
whisper.cpp inside `npm run transcribe`, because that's a plain npm script,
not Claude; it only ever touches this project's own `whisper.cpp/` folder.

## Setup

```bash
git clone <this-repo-url>
cd video-motion-editor
npm install
npm run studio
```

## Try it right now

Before touching your own footage, open the Studio and click through the
sidebar — every one of these renders immediately, no setup:

- **`DesignSystem`** — the whole palette and type scale on one frame
- **`MotionReel`** — the four motion mechanics above, back to back
- **`CodeShot`**, **`TerminalShot`**, **`BrowserShot`**, **`WorkflowShot`** —
  the drop-in shot types, with sample content already in their props

**`IntroFull`** is the one exception — it's the finished intro from this
project's own build log, kept as a worked example of what the loop below
produces. Its props are one real recording's transcript, so it needs a file
at exactly `public/video/intro.mp4` to render; without one it errors in the
Studio. That's expected — it's a reference, not a starting point. Your actual
starting point is the loop below.

## The loop

1. **Record** a talking-head clip and drop it in `public/video/`.
2. **Transcribe** it:
   ```bash
   npm run transcribe -- public/video/your-clip.mp4
   ```
   Writes word-level timings to `src/data/your-clip.captions.json`.
3. **Prompt Claude Code.** Something like:
   > My recording is `public/video/your-clip.mp4`, the transcript is in
   > `src/data/your-clip.captions.json`. Pull a few stills with ffmpeg and
   > look at them first. Then read STYLE.md, split the transcript into
   > sections by idea, and build one composition covering the whole
   > recording — key every cue to a word timing.
4. **Preview** in the Studio — every prop is editable live in the sidebar.
5. **Render:**
   ```bash
   npx remotion render <CompositionId> out/<name>.mp4
   ```

## Cut it first

If the recording has pauses, filler words or retakes, cut it before anything
else, then transcribe the *cut* file:

```bash
npm run gaps -- public/video/raw.mp4                          # where the pauses are
npm run cut -- public/video/raw.mp4 edl.json                  # edl.json: [{"in": 2.4, "out": 8.1}, …]
npm run transcribe -- public/video/aroll.mp4
```

`cut.mjs` snaps to frames, fades each splice, high-passes and levels the voice
to -14 LUFS, and leaves the picture alone (add `--hlg` for iPhone HDR footage).
Claude Code does this for you; it's in `CLAUDE.md`.

## Check, then render

```bash
npm run stills -- --qa <CompositionId> out/qa 0 60 120    # layout check, prints "QA: clean" or the faults
npm run final -- <CompositionId> --audio public/video/aroll.mp4
```

Use `npm run final`, not `remotion render`, for anything with a face in it:
Remotion's own MP4 encode uses the SD colour matrix and skin plays back red.
`final` renders the frames and encodes them with ffmpeg as BT.709.
`--scale 1.3333333333333333` gives 1440p.

`LayoutCheckDemo` in the Studio shows the layout check on a small example.

## Start from nothing instead

You don't need this repo to start. Make a folder, put your reference images in
it, open an empty Claude Code session there and paste:

> Hey Claude, I want you to be my video editor. Set up a project in this folder that edits my videos for me, and make it reusable, because I'll use it for every video from now on, each in a fresh chat. So write down whatever you'll need to remember in the project.
>
> The images in this folder are motion graphics I found on Pinterest. They're my style references. Study them and turn them into a style guide: colors, fonts, layouts. They're still images, so you decide how things should move. Come up with animation that fits this style and feels premium, with nothing static. Build reusable parts from it, like title cards, charts and diagrams.
>
> Build it with Remotion. For each recording, transcribe it locally with a timestamp on every word, cut the pauses, filler words and bad takes without ever clipping a word, and build motion graphics timed to what I say. Zoom in smoothly when I name something on screen, and on screen recordings replace the shaky cursor with a clean one. The final colors should match my original footage.
>
> Check your own work by looking at the frames before you show me anything, and show me a draft first. Ask me before you install anything, and add my corrections to the style guide so they stick.

## Making it yours

Two things to change before your first real video:

- **`STYLE.md`** — swap the palette (`src/style.ts`), fonts (`src/fonts.ts`),
  and the "what to avoid" list for your own brand. This file is what keeps
  every video looking like it belongs to the same channel.
- **`public/logos/`** — empty on purpose. Drop in your own brand assets;
  generic marks (play buttons, terminals, arrows) are drawn in code and don't
  need a file.

Everything Claude builds after that gets added to `src/components/`, so it
compounds — your fifth video is faster to make than your first.

## License

MIT — see [LICENSE](LICENSE).

## Known limits

- `track-cursor.py` matches the macOS pointer by template at 1920x1080. It finds it in most frames of a typical screen recording, not all; check the hit rate (lines with `e` below 40) before relying on it, and expect to tune the templates for a different display scale.
- `IntroFull` needs a recording at `public/video/intro.mp4` and errors without one. Every other composition renders with no setup.
