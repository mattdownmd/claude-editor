# Animation style guide

The persistent style reference. Apply it to every animation request.

Colours are sampled from `references/color palette.png` — a muted sage, olive and
forest range with one warm cream note. The feel to aim for: a calm, expensive
product explainer. Interfaces float on a soft ground. Nothing shouts.

## Look and feel

- **Ground**: off-white `#EDEEE8`. Never pure white — white is only for a card
  that has to lift off the ground.
- **Ink**: near-black green `#091409` for primary type, `#4C524A` for secondary,
  `#909289` for anything inactive or struck through.
- **Accent**: forest `#3F4C33` on a light ground. On a dark panel the accent
  flips to cream `#EDEACE`. Same role, different surface — one emphasis per shot.
- **Ground**: never a flat fill. `AmbientGround` lays a few very soft colour
  washes over the base so the frame has air in it. They drift a few pixels
  across the composition — the only ambient motion allowed, and it reads as
  atmosphere rather than animation. Pass `drift={0}` to stop it dead.
- **Depth**: the canvas stays flat. Only **windows and cards** get a shadow, and
  it is always wide and very soft (`shadow.window`, `shadow.card`). A tight dark
  shadow reads as a sticker.
- **Corners**: generous. 26px on windows, 22px on cards, full pills on chips.
- **Bar**: it should look like a motion studio built it. Polished, deliberate,
  expensive.

Import every colour from `src/style.ts`. Never write a hex into a composition.
`DesignSystem` in the Studio shows every token with its name and value.

## Typography

Three faces, three jobs. Never mix the jobs up — the split is what makes the
frame read as designed rather than typed.

| Face | Job |
|---|---|
| **Newsreader** (serif) | Statement headlines. The one sentence a shot exists to deliver. |
| **Plus Jakarta Sans** | Interface type — labels, steps, sub-copy, anything inside a window. |
| **JetBrains Mono** | Anything literal — code, terminal output, file paths, kickers, data. |

- The serif is the brand voice: warm, confident, unhurried. Use `Statement`, set
  it large (70–92px), and let it hold the frame on its own.
- Emphasis inside a statement is **italic plus accent**, not bold. Bold serif at
  display size reads heavy and dated.
- Tight letter spacing (`-0.015em` serif, `-0.02em` sans), line height ~1.08.
- Maximum two type sizes visible at once.

If a viewer could type it, set it in mono. If you said it out loud, set it in
the serif. If it labels a control, set it in Jakarta.

## Composition

- Generous margins (140px). Content left-aligned unless the shot is a single
  centered stat.
- One idea per shot. If a shot needs two sentences to explain, split it.
- Prefer large simple visuals — one window, one number, one diagram — over dense
  layouts.

## Motion

- Spring-based, never linear easing.
- Elements enter with a short upward translate plus fade. Stagger related
  elements by 2–4 frames.
- Windows enter with a slight scale (0.955 → 1) as well as the translate. That
  small scale is what makes them read as arriving rather than sliding.
- Interfaces assemble line by line — never appear fully populated.
- Nothing moves for the sake of moving. If motion doesn't carry meaning, cut it.

## Ambition

Default to the harder move. A shot where things fade in and sit still is a
failure of nerve, not a style choice — most of what makes work look expensive is
that objects *transform* instead of appearing.

Before building any shot, ask: **can two of these elements be the same object?**
If a window becomes a button, or a card becomes a circle, morph it. Cutting from
one object to a different object is the last resort, not the first idea.

Rules that follow from that:

- **No naked fades.** Fade is a modifier on a move, never the move itself.
- **Never more than one thing arriving the same way.** If three elements enter,
  at least one should enter differently, or they read as a template.
- **Fast things smear.** Anything crossing more than ~300px uses `Throw` with
  its trail, or it looks weightless.
- **If a layout can be a camera move, make it a camera move.** Four shots cut
  together is worse than one continuous travel past four objects.
- **Derive motion from the recording where you can.** Scatter seeds, arrival
  order, density — pull them from the transcript rather than authoring them.
  `WordSwarm` is the reference for this.

### The mechanics

Named moves, in `src/components/motion/`. Ask for them by name. `MotionReel` in
the Studio plays all four back to back.

| Mechanic | What it does | Reach for it when |
|---|---|---|
| `ShapeMorph` | One outline travels into another. Real path interpolation, no cross-fade. | A shot would otherwise cut between two objects. |
| `WordSwarm` | Words scatter on a noise field, then fly home on the frame they are spoken. | A sentence is the subject and you want the transcript visible as motion. |
| `Camera` / `CameraLayer` | Layers hold still at fixed depths; the camera travels through them. | Several interfaces need showing in sequence. |
| `Throw` | Overshoot, spin and a motion-blur trail. | Anything entering from off-frame. |

Two gotchas worth knowing, both already handled inside the components: `Trail`
renders its children in an `AbsoluteFill`, so anything using it needs an
invisible copy to hold its place in the layout; and camera layers must be spread
in x and y, or the camera flies through a stack instead of past a scene.

## What to avoid

- Stock-template energy: sliding boxes, spinning icons, generic "tech"
  backgrounds.
- **Boxes with lines between them** as the answer to every process. A connector
  diagram is one option among many, not the default.
- Pure white or pure black anywhere.
- Text overlapping graphics, or anything composited over the presenter's face.
- More than three colours in a single shot.
- Captions that just repeat the headline.
- **Charts with invented numbers.** If the script has no data in it, use a
  diagram. A bar chart built from made-up figures is the fastest way to look
  like a template.

## Timing

Animations are cut from the recording's own transcript, not guessed.

1. `npm run transcribe -- <path/to/recording.mp4>` → per-word timings in `src/data/`.
2. Group words into **sections by idea**, not by fixed duration. A section ends
   where the point changes.
3. Convert to frames with `startMs / 1000 * fps`. One composition per section.

Text should land **~3 frames ahead of the spoken word**. Matching the audio
exactly reads as late. `TimedWords` handles this via its `leadFrames` prop.

## Components

Reusable primitives in `src/components/`. Prefer these over new one-off code.

| Component | Use it for |
|---|---|
| `AmbientGround` | The washed ground every shot sits on. Optional dotted grid. |
| `Statement` | A serif headline. Takes fixed timing, or transcript words to key to speech. |
| `Window` | The base floating panel — title bar, dots, dark or light. |
| `BrowserWindow` | A browser as a graphic object — `outline` on dark, `solid` on light. |
| `WorkflowGraph` | Cards wired together on a canvas, connectors drawing between them. |
| `CodeWindow` | A source file appearing line by line, syntax coloured. |
| `TerminalWindow` | Commands typing out, with output and completed steps. |
| `TimedWords` | Kinetic type where each word lands as it's spoken. |
| `StrikeList` | A spoken run of negations — items stack, then strike through on cue. |
| `StepList` | A numbered roadmap of what's coming. |
| `BarChart` | Real comparisons only — when the script states actual numbers. |
| `Callout` | A single stat or label that needs to sit apart from the text. |
| `AnimatedText` / `WordByWord` | Static-timed type when there's no transcript to key against. |
| `ArollStage` | The recording itself, keyframed between `full` / `right` / `pip`. |
| `Shot` | Holds one section's graphics for a frame range; handles entry and lift-off. |
| `ToolChip` / `ChipJoin` | A named tool as a pill with a drawn glyph. |
| `Kicker` | Section marker — accent rule, index, label. Names the beat, never the line. |
| `ChapterRail` | Hairline progress bar at the foot of the frame, ticked per section. |

All take a `delay` in frames and animate with `spring()` using the presets in
`src/style.ts`.

## Windows and interfaces

The house device. When the script mentions something you'd see on a screen, show
the screen — don't describe it with an icon.

- `CodeWindow` when the point is *what was written*.
- `TerminalWindow` when the point is *what you run*. Commands type out; output
  and results arrive whole.
- `BrowserWindow` when the point is *the web*. The `outline` treatment — hairline
  chrome on a solid deep ground, page area left empty — is the house look. It is
  a drawing of a browser, not a screenshot of one.
- `WorkflowGraph` when the script describes something being *handed from one tool
  to the next*. Cards on a dotted field with connectors drawing between them.
  Positions are explicit pixels, because a workflow diagram is a drawing and the
  placement is the design.

Key each line's `frame` to the word being spoken over it. A code window whose
lines land on the narration reads as evidence; one that dumps all at once reads
as a screenshot.

Ready-made shots: `CodeShot`, `TerminalShot`, `BrowserShot` and `WorkflowShot`
are full 1920×1080 compositions (kicker, statement, graphic) you can point at new
content without writing any layout.

## Icons and logos

- Generic marks — terminals, play buttons, arrows, checks — are **drawn in code**
  as stroked SVG on a 24px grid. They recolour with the palette and never look
  pasted on. See `ToolChip`.
- Real company logos need real files in `public/logos/`. That folder is empty on
  purpose — the two files that used to sit there were hand-drawn placeholders
  with the word "CLAUDE" set in Courier, and they are now in `_archive/logos/`.
  Add each brand's official file once; it is reused by every later video.
- The Claude Code and Remotion marks in `ToolMorph` are drawn in code, as a
  burst and a play triangle, so they can morph into one another. They are
  house marks, not the official logos — swap in real files if you need those.

## Cutting graphics against A-roll

The recording is never cross-dissolved and never slow-zoomed — it **reframes**,
one spring per move, on a section boundary. `ArollStage` owns three positions:

| Preset | Rect | Use it when |
|---|---|---|
| `full` | 1920×1080 | The hook, and the last line. Face only, nothing on top. |
| `right` | 620×780 at (1160, 150) | A column section — leaves 930px on the left for graphics. |
| `pip` | 360×202 at (1420, 800) | A graphic needs the full width but we still want eye contact. |

Graphics never overlap the recording: the column lives at x 140–1070, the
full-width band stops above y 780. Nothing is composited over the face.

## Mapping speech to visuals

| When the script is… | Reach for |
|---|---|
| Making a single claim | `TimedWords`, key nouns in accent |
| Naming what was written | `CodeWindow` |
| Naming what you run | `TerminalWindow` |
| Listing what's missing or wrong | `StrikeList` |
| Describing how something flows | `WorkflowGraph` |
| Promising what's coming | `StepList` |
| Stating a real number | `BarChart` or `Callout` |

## Typography loading

Type is loaded through `src/fonts.ts` (`@remotion/google-fonts`) rather than a
local font stack, so the Studio preview and the rendered MP4 are identical on any
machine. Import `displayFont` and `monoFont` from there — don't rely on
`font.display` in new components.
