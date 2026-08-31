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

This isn't a blank Remotion starter — it's a working system:

- **`STYLE.md`** — a filled-in design system (palette, type, motion rules) that
  Claude reads before building anything. Replace the specifics with your own
  brand; keep the structure.
- **`CLAUDE.md`** — project rules for Claude Code: where files live, what
  order to work in.
- **`src/components/`** — reusable primitives: timed captions, code/terminal/
  browser windows, workflow diagrams, a docked-card A-roll stage that reframes
  instead of cutting.
- **`src/components/motion/`** — advanced motion mechanics: real shape
  morphing (`@remotion/paths`), a 3D camera that travels through layered
  windows, thrown elements with a motion-blur trail, and a word swarm driven
  by a noise field.
- **`DesignSystem`** and **`MotionReel`** compositions — open them in the
  Studio to see every token and every mechanic on one screen.

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Claude Code](https://claude.com/claude-code) — `npm install -g @anthropic-ai/claude-code`

That's it. **No separate ffmpeg or Whisper install** — Remotion ships its own
ffmpeg, and `npm run transcribe` downloads and builds whisper.cpp on first run.

## Setup

```bash
git clone <this-repo-url>
cd video-motion-editor
npm install
npm run studio
```

## The loop

1. **Record** a talking-head clip and drop it in `public/video/`.
2. **Transcribe** it:
   ```bash
   npm run transcribe -- public/video/your-clip.mp4
   ```
   Writes word-level timings to `src/data/your-clip.captions.json`. First run
   takes a few minutes while whisper.cpp builds; after that, seconds.
3. **Prompt Claude Code.** Something like:
   > My recording is `public/video/your-clip.mp4`, the transcript is in
   > `src/data/your-clip.captions.json`. Pull a few stills with ffmpeg and
   > look at them first. Then read STYLE.md, split the transcript into
   > sections by idea, and build one composition covering the whole
   > recording — key every cue to a word timing.
4. **Preview** in the Studio (`npm run studio`) — every prop is editable live
   in the sidebar.
5. **Render:**
   ```bash
   npx remotion render <CompositionId> out/<name>.mp4
   ```

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
