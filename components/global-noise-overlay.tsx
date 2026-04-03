"use client";

import Noise from "@/components/Noise";

export function GlobalNoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2147483646] overflow-hidden"
    >
      <Noise
        patternSize={1024}
        patternScaleX={1}
        patternScaleY={1}
        patternRefreshInterval={2}
        patternAlpha={10}
      />
    </div>
  );
}
