"use client";

import * as React from "react";
import FaultyTerminal from "@/components/FaultyTerminal";
import LetterGlitch from "@/components/LetterGlitch";
import Particles from "@/components/Particles";
import { getHostBackground, type HostBackgroundId } from "@/lib/host-backgrounds";

const ACTIVE_BODY_CLASS = "host-background-active";

function ReadsPhrackBackground() {
  return (
      <LetterGlitch
        glitchColors={["#2b4539","#125032","#031806"]}
        glitchSpeed={50}
        centerVignette
        outerVignette
        smooth
      />
  );
}

function ParticlesGreenBackground() {
  return (
    <Particles
      particleCount={480}
      particleSpread={10}
      speed={0.1}
      particleColors={["#008040", "#00ff00", "#008000"]}
      moveParticlesOnHover
      particleHoverFactor={1}
      alphaParticles
      particleBaseSize={100}
      sizeRandomness={1}
      cameraDistance={20}
      disableRotation={false}
    />
  );
}

function FaultyTerminalGreenBackground() {
  return (
    <FaultyTerminal
      scale={1.5}
      digitSize={1.2}
      scanlineIntensity={0.5}
      glitchAmount={1}
      flickerAmount={1}
      noiseAmp={1}
      chromaticAberration={0}
      dither={0}
      curvature={0.1}
      tint="#8cea82"
      mouseReact
      mouseStrength={0.5}
      brightness={0.6}
    />
  );
}

const hostBackgroundComponents: Record<HostBackgroundId, React.ComponentType> = {
  "faulty-terminal-green": FaultyTerminalGreenBackground,
  "reads-phrack": ReadsPhrackBackground,
  "particles-green": ParticlesGreenBackground,
};

export function HostBackground() {
  const [backgroundId, setBackgroundId] = React.useState<HostBackgroundId | null>(null);

  React.useLayoutEffect(() => {
    const matchedBackground = getHostBackground(window.location.hostname);
    const body = document.body;

    if (!matchedBackground) {
      body.classList.remove(ACTIVE_BODY_CLASS);
      delete body.dataset.hostBackground;
      setBackgroundId(null);
      return;
    }

    body.classList.add(ACTIVE_BODY_CLASS);
    body.dataset.hostBackground = matchedBackground.id;
    setBackgroundId(matchedBackground.id);

    return () => {
      body.classList.remove(ACTIVE_BODY_CLASS);
      delete body.dataset.hostBackground;
    };
  }, []);

  if (!backgroundId) {
    return null;
  }

  const BackgroundComponent = hostBackgroundComponents[backgroundId];

  return (
    <div
      aria-hidden="true"
      className="host-background-layer pointer-events-none fixed inset-0 z-[-3] flex items-center justify-center overflow-hidden bg-black"
    >
      <BackgroundComponent />
    </div>
  );
}
