import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const WHISPER_PATH = path.join(process.cwd(), "whisper.cpp");
// 1.7.x or newer is required: token-level timestamps are passed as `--dtw`,
// which older builds (1.5.x) don't recognise — they exit printing their help text.
const WHISPER_VERSION = "1.7.4";
const MODEL = "small.en";

const input = process.argv[2];
if (!input) {
  console.error("Usage: npm run transcribe -- public/video/aroll.mp4");
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`File not found: ${input}`);
  process.exit(1);
}

await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
await downloadWhisperModel({ folder: WHISPER_PATH, model: MODEL });

// Must be absolute: whisper-cli is spawned from its own directory, so a
// relative path here resolves against the wrong cwd and is reported missing.
const wav = path.resolve("out", `${path.parse(input).name}.wav`);
mkdirSync("out", { recursive: true });
execSync(`npx remotion ffmpeg -i "${input}" -ar 16000 -ac 1 -y "${wav}"`, {
  stdio: "inherit",
});

const result = await transcribe({
  model: MODEL,
  whisperPath: WHISPER_PATH,
  whisperCppVersion: WHISPER_VERSION,
  inputPath: wav,
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({ whisperCppOutput: result });
const outFile = path.join("src", "data", `${path.parse(input).name}.captions.json`);
mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(captions, null, 2));

console.log(`\nWrote ${captions.length} captions to ${outFile}`);
