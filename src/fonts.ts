import { loadFont as loadSerif } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadSans } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Loading the real faces rather than relying on a local fallback keeps the
// Studio preview and the rendered MP4 identical on any machine.
const serif = loadSerif("normal", {
  weights: ["300", "400", "500", "600"],
  subsets: ["latin"],
});

const sans = loadSans("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const mono = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

/** Statement headlines — the brand voice. */
export const serifFont = serif.fontFamily;
/** Interface type: labels, steps, sub-copy. */
export const displayFont = sans.fontFamily;
/** Anything literal: code, commands, kickers, data. */
export const monoFont = mono.fontFamily;
