# Video Motion Editor — Remotion animation workspace

A Remotion project for turning a talking-head recording into motion graphics — the animation timing is derived from the recording's own transcript, not guessed. See `README.md` for setup and `STYLE.md` for the design system.

## Always

- Read `STYLE.md` before building or editing any composition. It is the single source of truth for look and feel. If the user has added reference images (`references/`, or any other folder they point you to: copy them into `references/`), study them and update `STYLE.md` from them first: colours, fonts, layouts, and how things should move (they are stills, so you decide the motion).
- Import design tokens from `src/style.ts` — never hardcode colors, font sizes, or spacing.
- Register every new composition in `src/Root.tsx` with a zod `schema` and `defaultProps` so it is editable in the Studio.
- **Never grade or colour-correct the user's face.** No filter, tint, grain or vignette over the talking head. It stays exactly as recorded.
- **Never make a final render without asking.** Show stills, a contact sheet and a draft first, then ask.
- **Check your own work before showing anything.** Run the layout check (below), then look at contact sheets of the stills yourself, a frame every ~2 seconds. Fix what you find.
- **Finals never use Remotion's own MP4 encode** — it writes the BT.601 matrix and skin plays back red. Use `npm run final` (below).
- Ask before installing anything.
- When the user corrects you, write the correction into `STYLE.md` so it sticks for every later video.

## Layout

```
src/
  index.ts            entry point (registerRoot)
  Root.tsx            composition registry
  style.ts            design tokens
  fonts.ts            loaded Google Fonts
  components/         reusable animation primitives (LayoutQA.tsx is the layout check)
  components/motion/  advanced motion mechanics (morph, camera, throw, swarm, Punch zoom, Cursor)
  compositions/       one file per composition
  data/               generated caption JSON (gitignored, regenerated per video)
public/
  video/              source and cut A-roll (gitignored)
  audio/              source audio (gitignored)
references/           the user's style references (their own, not committed)
scripts/
  transcribe.mjs      whisper.cpp transcription -> word-level timings
  gaps.py             where a recording is silent (cut in the gaps)
  cut.mjs             cut a recording from an EDL, level the voice to -14 LUFS
  stills.mjs          preview stills, contact sheets, and --qa for the layout check
  final.mjs           the colour-safe final render (JPEG frames + ffmpeg BT.709 encode)
  track-cursor.py     find the baked-in macOS pointer in a screen recording
  erase-cursor.py     paint it out, so the drawn Cursor can replace it
out/                  rendered output
```

## Commands

- `npm run studio` — open the Remotion Studio for live preview
- `npm run transcribe -- public/video/aroll.mp4` — word-level timings into `src/data/`
- `npm run gaps -- <recording>` — the pauses, from the sound level
- `npm run cut -- <raw> <edl.json> [out] [--hlg]` — cut it (default out `public/video/aroll.mp4`)
- `npm run stills -- [--qa] <Id> <outDir> <frames…>` — stills; `--qa` runs the layout check and prints `QA: clean` or the faults
- `npm run final -- <Id> [--scale 1.3333333333333333] [--audio public/video/aroll.mp4]` — the final render

## Workflow

1. Drop the recording in `public/video/`.
2. **Cut it first** (below), then transcribe the *cut* file, so every frame number is a real timestamp in the file that plays.
3. Read the transcript, identify each distinct section, and build one composition per section. Time every graphic to a word, never a guessed frame.
4. Preview stills and the Studio, run the layout check, look at the contact sheets, show a draft.
5. On a yes, render the final with `npm run final`.

Default canvas is 1920x1080 at 30fps.

## Cutting the raw take

A recording with false starts and retakes is cut *before* anything else happens to it. Don't leave any idea out; cut pauses, filler words, false starts and bad takes. When something is said twice, keep the **last** take.

1. `npm run gaps -- <raw>` finds every pause from a 10 ms RMS of the sound. Cut only in those gaps, never inside a phrase. Do not trust whisper's word times for cut points: they run 0.3–0.5 s late and it pins the first segment to 0.00 however long the run-up is. A stretch that looks like a stall is worth re-transcribing on its own, since a restarted sentence gets folded into one line and the false start disappears.
2. Write the keepers as `[{ "in": s, "out": s }, …]`, each IN/OUT inside a gap, in an `edl.json`.
3. `npm run cut -- <raw> edl.json` snaps to frames, fades every splice 12 ms, high-passes and lightly compresses the voice, and levels it to -14 LUFS with a two-pass linear loudnorm (one fixed gain, no pumping). The picture is not graded. Add `--hlg` for iPhone HDR footage: Chrome tone-maps HLG-tagged video hot, so the pixels are re-expressed in BT.709 and retagged.
4. Transcribe the cut file.

The joins that survive are the thing to design around: each one needs a camera move, a ground change, or something crossing the frame on top of it, or the viewer sees the jump.

## Zoom-ins and the cursor

- Zoom in when the narration names something on screen: `components/motion/Punch.tsx`. One smooth move, ease in and out, never a bounce or wobble, and only onto the thing that was named, ending on it. A zoom onto nothing in particular looks random.
- On screen recordings the real pointer looks shaky. `scripts/track-cursor.py` finds it in every frame, `scripts/erase-cursor.py` paints it out, and `components/motion/Cursor.tsx` draws a clean one that glides to each stop and dips on click.

## The layout check

`components/LayoutQA.tsx`: tag the boxes that matter with `qa("name", { group, in, bleed, pip })`, mount `<LayoutQA />` once, give the composition root `data-qa-root`. `npm run stills -- --qa <Id> out/qa <frames…>` then reports a box outside its container, two boxes in a group touching, a box off the frame, or a box under the talking head. `LayoutCheckDemo` is a worked example (set `broken: true` to see it fail). Until it prints `QA: clean`, the layout is not done.

## Colour on the final render

`npm run final` renders JPEG frames with Remotion and encodes them with ffmpeg using an explicit BT.709 matrix, TV range, tagged bt709 — plain `remotion render` converts with the BT.601 matrix and skin plays back red. `--scale 1.3333333333333333` gives 2560x1440 (4/3 exactly; a shorter value yields 1439.99 and fails). Before handing a final over, compare the face's colour against the source.
