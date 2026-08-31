# Animation style guide

The persistent style reference. Apply it to every animation request.

Colours are sampled from the reference film in `references/` — Anthropic's clay
and a warm parchment cream. The feel to aim for: a calm, expensive product
explainer. Interfaces float as pale cards on a flat ground, a cursor does the
clicking, and the camera punches in when a detail matters. Nothing shouts.

The clay is Anthropic's own brand colour. That reads as deliberate on a channel
about Claude Code; shift the hue in `src/style.ts` if you want it to be yours.

## Look and feel

- **Two grounds, both flat**: parchment `#E9DED1` and clay `#DE8162`. No
  gradient, no texture, no drift — all the depth in the frame comes from cards
  floating above a solid colour. Atmosphere on the ground is what made the
  earlier version of this project look like a template.
- **The ground change is the section break.** `Ground` cuts between tones in six
  frames. Use it once, on the turn of the script — cream for the setup and the
  problem, clay for the fix and the payoff. That single cut does more structural
  work than any transition.
- **Ink**: warm near-black `#1A1312` on cream, `#FFF6F2` on clay. `#6B5B52` for
  secondary, `#A2907F` for anything inactive or struck through.
- **Accent**: `#C2603F` on cream. On clay the accent flips to `#FFF6F2`. Same
  role, different surface — one emphasis per shot.
- **Windows are pale, not dark.** A dark panel on the clay goes muddy. Use
  `tone="light"` on `CodeWindow` and `TerminalWindow`; the dark tone is for a
  cream ground only.
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
| `Cursor` | A macOS pointing hand that travels on a spring and dips on click. | Any interface shot. This is what makes a screen read as *used* rather than screenshotted. |
| `Punch` | Scales the frame around a focal point — a zoom onto a detail. | The narration names one thing on screen. Hold the wide view for a beat first. |
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
| `Ground` | The flat ground, and the cut between cream and clay. |
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

## Interfaces, the reference way

Three rules, all taken from the reference film:

- **Put a cursor on it.** An interface with no pointer is a screenshot. `Cursor`
  travels on a spring and dips when it clicks — both matter; a linear cursor
  reads as a diagram and a click with no dip reads as a ripple effect.
- **Let windows bleed off the frame.** A card that sits fully inside the frame
  with margin all round reads as a slide. The reference crops almost every
  window against an edge.
- **Punch in when the narration names something.** Put `Cursor` *inside* the
  `Punch`, not outside it — a real screen recording magnifies its pointer along
  with everything else. And clear whatever is no longer the subject rather than
  leaving it half-cropped at the frame edge.

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
