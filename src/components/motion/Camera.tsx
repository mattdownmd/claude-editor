import React from "react";
import { AbsoluteFill, interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { spring } from "../../style";

/** Lets a layer know where the camera currently is, so it can fade as it is passed. */
const CameraZ = React.createContext(0);

export type CameraMark = {
  frame: number;
  /** Positive pushes the camera forward, into the scene. */
  z: number;
  x?: number;
  y?: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A scene with real depth and a camera that moves through it.
 *
 * Layers sit at fixed Z distances and never animate themselves — the camera
 * travels past them. That is the difference between four shots cut together and
 * one continuous move: nothing fades, the viewer simply arrives somewhere new.
 */
export const Camera: React.FC<{
  children: React.ReactNode;
  marks: CameraMark[];
  perspective?: number;
  /** Frames a camera move takes to settle. */
  moveDuration?: number;
}> = ({ children, marks, perspective = 1600, moveDuration = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let idx = 0;
  for (let i = 0; i < marks.length; i++) {
    if (frame >= marks[i].frame) idx = i;
  }

  const to = marks[idx];
  const from = idx === 0 ? to : marks[idx - 1];
  const t =
    idx === 0
      ? 1
      : remotionSpring({
          frame: frame - to.frame,
          fps,
          config: spring.gentle,
          durationInFrames: moveDuration,
        });

  const z = lerp(from.z, to.z, t);
  const x = lerp(from.x ?? 0, to.x ?? 0, t);
  const y = lerp(from.y ?? 0, to.y ?? 0, t);

  return (
    <CameraZ.Provider value={z}>
      <AbsoluteFill style={{ perspective, perspectiveOrigin: "50% 50%", overflow: "hidden" }}>
        <AbsoluteFill
          style={{
            transformStyle: "preserve-3d",
            transform: `translate3d(${-x}px, ${-y}px, ${z}px)`,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </CameraZ.Provider>
  );
};

/**
 * One plane in the scene. Give it a Z and leave it alone — the camera does the
 * moving. Layers further away should be larger, since perspective shrinks them.
 */
export const CameraLayer: React.FC<{
  z: number;
  /** Offset within the scene. Spread layers out or the camera flies through a stack. */
  x?: number;
  y?: number;
  children: React.ReactNode;
  /**
   * Fade in as the layer comes into range and out as the camera passes through
   * it. Without this a passed layer stays in front of the lens at enormous
   * scale and blocks everything behind it.
   */
  fadeThrough?: boolean;
  style?: React.CSSProperties;
}> = ({ z, x = 0, y = 0, children, fadeThrough = true, style }) => {
  const cameraZ = React.useContext(CameraZ);
  const effective = z + cameraZ;

  const opacity = fadeThrough
    ? interpolate(effective, [-2300, -1700, -120, 160], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill
      style={{
        ...style,
        transformStyle: "preserve-3d",
        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
