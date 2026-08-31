# Video Motion Editor — Remotion animation workspace

A Remotion project for turning a talking-head recording into motion graphics — the animation timing is derived from the recording's own transcript, not guessed. See `README.md` for setup and `STYLE.md` for the design system.

## Always

- Read `STYLE.md` before building or editing any composition. It is the single source of truth for look and feel.
- Import design tokens from `src/style.ts` — never hardcode colors, font sizes, or spacing.
- Register every new composition in `src/Root.tsx` with a zod `schema` and `defaultProps` so it is editable in the Studio.

## Layout

```
src/
  index.ts            entry point (registerRoot)
  Root.tsx            composition registry
  style.ts            design tokens
  fonts.ts            loaded Google Fonts
  components/         reusable animation primitives
  components/motion/  advanced motion mechanics (morph, camera, throw, swarm)
  compositions/       one file per composition
  data/               generated caption JSON (gitignored, regenerated per video)
public/
  video/              source A-roll recordings
  audio/              source audio
scripts/transcribe.mjs  whisper.cpp transcription -> timed captions
out/                  rendered output
```

## Commands

- `npm run studio` — open the Remotion Studio for live preview
- `npm run transcribe -- public/video/aroll.mp4` — transcribe a recording to timed captions
- `npx remotion render <CompositionId> out/<name>.mp4` — render a composition

## Workflow

1. Drop the recording in `public/video/`.
2. Transcribe it to get word-level timings in `src/data/`.
3. Read the transcript, identify each distinct section, and build one composition per section.
4. Preview in the Studio, refine, then render.

Default canvas is 1920x1080 at 30fps.
