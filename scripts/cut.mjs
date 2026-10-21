import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

/**
 * Cut a raw recording into the A-roll the compositions play.
 *
 *   node scripts/cut.mjs <raw> <edl.json> [out=public/video/aroll.mp4] [--hlg]
 *
 * edl.json is a list of keepers in seconds, each inside a gap that
 * `python3 scripts/gaps.py <raw>` found:
 *   [{ "in": 2.4, "out": 8.1 }, { "in": 9.0, "out": 15.5 }]
 * Every IN/OUT is snapped to a frame. Each splice gets a 12 ms fade so it
 * doesn't click, then the voice is high-passed, lightly compressed and
 * levelled to -14 LUFS with two-pass (linear) loudnorm, one fixed gain for the
 * whole file so it doesn't pump. The picture is NOT graded: same pixels,
 * re-encoded, tagged BT.709.
 *
 * --hlg is for iPhone HDR footage (HLG / BT.2020). Chrome tone-maps a stream
 * that still carries those tags and the face comes out hot and orange, so the
 * pixels are re-expressed in BT.709 and the stream is retagged.
 *
 * Transcribe the output, not the raw file, so every frame number you write in a
 * composition is a real timestamp in the file it plays.
 */

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));
const [input, edlPath, out = "public/video/aroll.mp4"] = args.filter((a) => !a.startsWith("--"));
if (!input || !edlPath) {
  console.error("Usage: node scripts/cut.mjs <raw> <edl.json> [out] [--hlg]");
  process.exit(1);
}

const FPS = 30;
const FADE = 0.012;
const VOICE = "highpass=f=80:poles=2,acompressor=threshold=0.125:ratio=2.5:attack=12:release=180:knee=4";
const TARGET = "I=-14:TP=-1.5:LRA=11";
const HLG =
  "scale=in_color_matrix=bt2020:out_color_matrix=bt709:in_range=tv:out_range=tv,format=yuv420p," +
  "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv";
const grade = flags.includes("--hlg") ? HLG : "format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709";

const f = (n) => n.toFixed(6);
const edl = JSON.parse(readFileSync(edlPath, "utf8"))
  .map((c) => ({ in: Math.floor(c.in * FPS) / FPS, out: Math.ceil(c.out * FPS) / FPS }));

const parts = [];
const labels = [];
edl.forEach((c, i) => {
  const d = c.out - c.in;
  parts.push(`[0:v]trim=start=${f(c.in)}:end=${f(c.out)},setpts=PTS-STARTPTS[v${i}]`);
  parts.push(
    `[0:a]atrim=start=${f(c.in)}:end=${f(c.out)},asetpts=PTS-STARTPTS,` +
      `afade=t=in:st=0:d=${FADE},afade=t=out:st=${f(d - FADE)}:d=${FADE}[a${i}]`,
  );
  labels.push(`[v${i}][a${i}]`);
});
parts.push(`${labels.join("")}concat=n=${edl.length}:v=1:a=1[vc][ac]`);
parts.push(`[ac]${VOICE},aformat=channel_layouts=mono[aout]`);
parts.push(`[vc]${grade}[vout]`);

const run = (a) => execFileSync("ffmpeg", ["-v", "warning", "-stats", ...a], { stdio: "inherit" });
mkdirSync(path.dirname(out), { recursive: true });
const pre = `${out}.pre.mp4`;
run([
  "-i", input, "-filter_complex", parts.join(";"), "-map", "[vout]", "-map", "[aout]",
  "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-r", String(FPS), "-fps_mode", "cfr",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", "-y", pre,
]);

// Second pass: measure, then one linear gain for the whole voice.
const probe = spawnSync("ffmpeg", ["-hide_banner", "-i", pre, "-vn", "-af", `loudnorm=${TARGET}:print_format=json`, "-f", "null", "-"], { encoding: "utf8" }).stderr;
const m = JSON.parse(probe.slice(probe.lastIndexOf("{"), probe.lastIndexOf("}") + 1));
const lin = `loudnorm=${TARGET}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
run(["-i", pre, "-c:v", "copy", "-af", `${lin},aformat=channel_layouts=mono`, "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", "-y", out]);
rmSync(pre, { force: true });

let t = 0;
console.log("\nJoins in the cut (seconds, frame) — each one needs a camera move, a ground change or something crossing it:");
edl.forEach((c, i) => {
  if (i) console.log(`  ${t.toFixed(2)}s  f${Math.round(t * FPS)}`);
  t += c.out - c.in;
});
console.log(`Total ${t.toFixed(2)}s, ${Math.round(t * FPS)} frames → ${out}`);
