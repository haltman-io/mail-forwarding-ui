"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import Noise from "@/components/Noise";
import LetterGlitch from "@/components/LetterGlitch";

const STORAGE_KEY = "effects-enabled";

export function GlobalNoiseOverlay() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "false") setEnabled(false);
  }, []);

  const toggle = () => {
    setEnabled((prev) => {
      localStorage.setItem(STORAGE_KEY, String(!prev));
      return !prev;
    });
  };

  return (
    <>
      {enabled && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[-3] flex items-center justify-center overflow-hidden bg-black"
          >
            <LetterGlitch
              glitchColors={["#2b4539", "#125032", "#031806"]}
              glitchSpeed={50}
              centerVignette
              outerVignette
              smooth
            />
          </div>

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
        </>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={enabled ? "Disable effects" : "Enable effects"}
        title={enabled ? "Disable effects" : "Enable effects"}
        className="fixed bottom-4 right-4 z-[2147483647] flex h-8 w-8 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-muted)] backdrop-blur-[var(--glass-blur)] transition-all duration-200 hover:text-[var(--text-secondary)] hover:shadow-[0_0_12px_rgb(var(--alias-accent-rgb)_/_0.1)]"
      >
        <Sparkles
          className={`h-3.5 w-3.5 transition-opacity duration-200 ${enabled ? "opacity-100 text-[var(--alias-accent)]" : "opacity-40"}`}
        />
      </button>
    </>
  );
}
