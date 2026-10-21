import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

/**
 * The final render. Use this, not `npx remotion render … out.mp4`, for anything
 * with a face in it.
 *
 *   node scripts/final.mjs <CompositionId> [--scale 1.3333333333333333] [--audio public/video/aroll.mp4]
 *                          [--frames 0-29] [--out out/<id>.mp4]
 *
 * Remotion's own MP4 encode converts the browser's RGB frames to YUV with the
 * BT.601 (SD) matrix and tags the file bt470bg / full range. QuickTime and
 * YouTube read any HD file as BT.709, so skin plays back pushed red.
 * `--color-space=bt709` changes the tag, not the maths. So Remotion renders the
 * frames only (JPEG, q95) and ffmpeg does the YUV conversion with an explicit
 * BT.709 matrix, TV range, and tags it bt709.
 *
 * --scale 1.3333333333333333 renders 1920x1080 as 2560x1440 (4/3 exactly: a
 * shorter value gives 1439.99 and Remotion refuses it). --audio takes the sound
 * from a file (the cut A-roll). --frames renders a range, handy for a test.
 * Afterwards: compare the face's colour with the source before you hand it over.
 */

const argv = process.argv.slice(2);
const id = argv[0];
if (!id || id.startsWith("--")) {
  console.error("Usage: node scripts/final.mjs <CompositionId> [--scale N] [--audio file] [--frames a-b] [--out file]");
  process.exit(1);
}
const opt = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : undefined);
const scale = opt("--scale") ?? "1";
const audio = opt("--audio");
const frames = opt("--frames");
const out = path.resolve(opt("--out") ?? `out/${id}.mp4`);
const dir = path.resolve(`out/${id}-frames`);

rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
mkdirSync(path.dirname(out), { recursive: true });
execFileSync(
  "npx",
  ["remotion", "render", id, dir, "--sequence", "--image-format=jpeg", "--jpeg-quality=95", `--scale=${scale}`, ...(frames ? [`--frames=${frames}`] : []), "--log=error"],
  { stdio: "inherit" },
);

// Remotion pads the frame number to the width of the last frame (element-00 for a
// 30-frame comp, element-0000 for a long one), so read the pattern off the files.
const files = readdirSync(dir).filter((n) => /^element-\d+\.jpeg$/.test(n)).sort();
const pad = files[0].match(/\d+/)[0].length;
const start = Number(files[0].match(/\d+/)[0]);
const audioIn = audio && existsSync(audio) ? ["-i", path.resolve(audio), "-map", "0:v", "-map", "1:a", "-c:a", "copy", "-shortest"] : ["-map", "0:v", "-an"];
execFileSync(
  "ffmpeg",
  [
    "-v", "warning", "-stats",
    "-framerate", "30", "-start_number", String(start), "-i", path.join(dir, `element-%0${pad}d.jpeg`),
    ...audioIn,
    "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
    "-c:v", "libx264", "-preset", "slow", "-crf", "14",
    "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
    "-movflags", "+faststart", "-y", out,
  ],
  { stdio: "inherit" },
);
rmSync(dir, { recursive: true, force: true });
console.log(`\nWrote ${out}`);
