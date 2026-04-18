"use client";

import { useSyncExternalStore } from "react";
import { Sparkles } from "lucide-react";
import Noise from "@/components/Noise";
import LetterGlitch from "@/components/LetterGlitch";

const STORAGE_KEY = "effects-enabled";
const STORAGE_EVENT = "effects-enabled-change";

function subscribe(onStoreChange: () => void) {
  const handleChange = (event: Event) => {
    if (event instanceof StorageEvent && event.key !== STORAGE_KEY) {
      return;
    }

    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(STORAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) !== "false";
}

function getServerSnapshot() {
  return true;
}

export function GlobalNoiseOverlay() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mobileLabel = enabled ? "Disable effects" : "Enable effects";
  const desktopLabel = enabled ? "Disable all effects" : "Enable all effects";

  const toggle = () => {
    window.localStorage.setItem(STORAGE_KEY, String(!enabled));
    window.dispatchEvent(new Event(STORAGE_EVENT));
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
        aria-label={desktopLabel}
        title={desktopLabel}
        className="fixed bottom-4 right-4 z-[2147483647] inline-flex min-h-11 max-w-[calc(100vw-2rem)] items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-[11px] font-medium whitespace-nowrap text-[var(--text-muted)] shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)] transition-all duration-200 hover:text-[var(--text-secondary)] hover:shadow-[0_0_12px_rgb(var(--alias-accent-rgb)_/_0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] sm:bottom-6 sm:right-6 sm:px-4 sm:text-xs"
      >
        <span className="sm:hidden">{mobileLabel}</span>
        <span className="hidden sm:inline">{desktopLabel}</span>
        <Sparkles
          className={`h-3.5 w-3.5 shrink-0 transition-opacity duration-200 ${enabled ? "opacity-100 text-[var(--alias-accent)]" : "opacity-40"}`}
        />
      </button>
    </>
  );
}
