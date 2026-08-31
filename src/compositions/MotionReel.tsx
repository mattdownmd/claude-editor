import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AmbientGround } from "../components/AmbientGround";
import { Camera, CameraLayer } from "../components/motion/Camera";
import { ShapeMorph } from "../components/motion/ShapeMorph";
import { WordSwarm } from "../components/motion/WordSwarm";
import { Throw } from "../components/motion/Throw";
import { circle, playTriangle, square, windowShape } from "../components/motion/shapes";
import { CodeWindow } from "../components/CodeWindow";
import { TerminalWindow } from "../components/TerminalWindow";
import { BrowserWindow } from "../components/BrowserWindow";
import { StepList } from "../components/StepList";
import { Kicker } from "../components/Kicker";
import { theme, layout } from "../style";

const Section: React.FC<{
  index: string;
  label: string;
  children: React.ReactNode;
}> = ({ index, label, children }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: layout.margin, top: layout.margin }}>
      <Kicker index={index} label={label} delay={2} />
    </div>
    <AbsoluteFill
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

const SWARM_WORDS = [
  { text: "Every", startMs: 40, endMs: 400 },
  { text: "animation", startMs: 400, endMs: 1130 },
  { text: "you're", startMs: 1130, endMs: 1610 },
  { text: "seeing", startMs: 1610, endMs: 2090 },
  { text: "right", startMs: 2090, endMs: 2490 },
  { text: "now", startMs: 2490, endMs: 2840 },
  { text: "was", startMs: 2840, endMs: 3400 },
  { text: "created", startMs: 3400, endMs: 4100 },
  { text: "by", startMs: 4100, endMs: 4400 },
  { text: "Claude", startMs: 4400, endMs: 4900 },
  { text: "Code.", startMs: 4900, endMs: 5600 },
];

/**
 * Four mechanics, one after another. This is a reference reel, not a shot —
 * each section exists so you can see what the move actually looks like before
 * asking for it by name.
 */
export const MotionReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <AmbientGround tone="light" drift={24} durationInFrames={700} />

      {/* 01 — morph. One outline travelling, never a cross-fade. */}
      <Sequence durationInFrames={130}>
        <Section index="01" label="Morph">
          <ShapeMorph
            size={420}
            duration={24}
            keys={[
              { d: windowShape(178), frame: 0, fill: theme.deep },
              { d: square(150), frame: 30, fill: theme.accent },
              { d: circle(150), frame: 62, fill: theme.accent },
              { d: playTriangle(140), frame: 94, fill: theme.deep },
            ]}
          />
        </Section>
      </Sequence>

      {/* 02 — swarm. Scatter seeded per word, arrival from the transcript. */}
      <Sequence from={130} durationInFrames={260}>
        <Section index="02" label="Word swarm">
          <div style={{ width: 1400 }}>
            <WordSwarm
              words={SWARM_WORDS}
              fontSize={86}
              maxWidth={1400}
              highlight={["Claude", "Code."]}
            />
          </div>
        </Section>
      </Sequence>

      {/* 03 — camera. The layers hold still; the camera travels through them. */}
      <Sequence from={390} durationInFrames={180}>
        <Section index="03" label="Camera">
          <Camera
            perspective={1900}
            moveDuration={54}
            marks={[
              { frame: 0, z: -120, x: 0, y: 0 },
              { frame: 46, z: 780, x: 300, y: 130 },
              { frame: 104, z: 1700, x: -280, y: -110 },
            ]}
          >
            <CameraLayer z={0} x={0} y={0}>
              <div style={{ width: 1120 }}>
                <CodeWindow
                  title="IntroFull.tsx"
                  delay={0}
                  fontSize={26}
                  lines={[
                    { text: "const words = readCaptions(\"intro\");", frame: 0 },
                    { text: "// each cue is a spoken word", frame: 0 },
                  ]}
                />
              </div>
            </CameraLayer>
            <CameraLayer z={-900} x={300} y={130}>
              <div style={{ width: 1120 }}>
                <TerminalWindow
                  title="zsh"
                  delay={0}
                  fontSize={26}
                  lines={[
                    { text: "npx remotion render IntroFull", kind: "command", frame: 30 },
                    { text: "1013 frames", kind: "done", frame: 62 },
                  ]}
                />
              </div>
            </CameraLayer>
            <CameraLayer z={-1820} x={-280} y={-110}>
              <div style={{ width: 1120 }}>
                <BrowserWindow
                  url="remotion.dev"
                  tab="Remotion"
                  mode="solid"
                  delay={70}
                  bodyHeight={220}
                />
              </div>
            </CameraLayer>
          </Camera>
        </Section>
      </Sequence>

      {/* 04 — throw. Overshoot, spin and a trail: weight, not a slide. */}
      <Sequence from={570} durationInFrames={130}>
        <Section index="04" label="Throw">
          <div style={{ width: 1100, display: "flex", flexDirection: "column", gap: 30 }}>
            {[
              { label: "Install Remotion", sub: "one prompt" },
              { label: "Write your style file", sub: "so every video matches" },
              { label: "Turn on plan mode", sub: "shift + tab" },
              { label: "Prompt, preview, render", sub: "then cut it in" },
            ].map((step, i) => (
              <Throw key={step.label} delay={6 + i * 9} from={{ x: -620, y: 0 }} spin={-4}>
                <StepList steps={[step]} animate={false} fontSize={46} startIndex={i} />
              </Throw>
            ))}
          </div>
        </Section>
      </Sequence>
    </AbsoluteFill>
  );
};
