import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Render a handful of stills from one composition with a single bundle —
 * much faster than `npx remotion still` per frame, which re-bundles each time.
 *
 *   node scripts/stills.mjs <CompositionId> <outDir> <frame> [frame …]
 *   node scripts/stills.mjs --qa <CompositionId> <outDir> <frame> [frame …]
 *
 * With --qa the composition renders with `qa: true` and the layout checker's
 * reports (boxes outside their container, colliding siblings, off frame, under
 * the PiP) are printed per frame. A clean run prints "QA: clean".
 */

const args = process.argv.slice(2);
const qa = args[0] === "--qa";
const [id, outDir, ...frames] = qa ? args.slice(1) : args;
if (!id || !outDir || frames.length === 0) {
  console.error("Usage: node scripts/stills.mjs <CompositionId> <outDir> <frame> [frame …]");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// PROPS='{"turn":"ink"}' overrides props for a comparison.
const inputProps = { ...(qa ? { qa: true } : {}), ...(process.env.PROPS ? JSON.parse(process.env.PROPS) : {}) };
const composition = await selectComposition({ serveUrl, id, inputProps });
const issues = [];
for (const f of frames) {
  const output = path.join(outDir, `f${String(f).padStart(6, "0")}.png`);
  await renderStill({
    serveUrl,
    composition: { ...composition, props: { ...composition.props, ...inputProps } },
    inputProps,
    frame: Number(f),
    output,
    scale: 0.5,
    onBrowserLog: (log) => {
      if (log.text.startsWith("QA ")) issues.push(log.text.slice(3));
    },
  });
  if (!qa) console.log(output);
}
if (qa) {
  const seen = new Set();
  for (const i of issues) if (!seen.has(i)) (seen.add(i), console.log(i));
  console.log(issues.length ? `QA: ${seen.size} issue(s)` : "QA: clean");
}
