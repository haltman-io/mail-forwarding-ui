"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, X } from "lucide-react";
import styles from "./donation.module.css";

const DISMISSED_KEY = "donate-corner-dismissed";
const DISMISSED_EVENT = "donate-shortcut-dismissed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(DISMISSED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(DISMISSED_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

function DonationShortcut() {
  const [bannerVisible, setBannerVisible] = React.useState(true);
  const [dismissedLocally, setDismissedLocally] = React.useState(false);
  const dismissed = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  React.useEffect(() => {
    const banners = new Map<Element, boolean>();
    const updateVisibility = () =>
      setBannerVisible([...banners.values()].some(Boolean));
    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          banners.set(entry.target, entry.isIntersecting);
        updateVisibility();
      },
      { threshold: 0, rootMargin: "-88px 0px 0px" },
    );

    const observeBanners = () => {
      const current = new Set(
        document.querySelectorAll("[data-donate-banner]"),
      );
      for (const banner of banners.keys()) {
        if (!current.has(banner)) {
          intersection.unobserve(banner);
          banners.delete(banner);
        }
      }
      for (const banner of current) {
        if (!banners.has(banner)) {
          banners.set(banner, true);
          intersection.observe(banner);
        }
      }
      updateVisibility();
    };

    // Observe banner mounts/removals without rebuilding observers on unrelated UI updates.
    const mutation = new MutationObserver((records) => {
      const hasBannerChange = records.some((record) =>
        [...record.addedNodes, ...record.removedNodes].some(
          (node) =>
            node instanceof Element &&
            (node.matches("[data-donate-banner]") ||
              node.querySelector("[data-donate-banner]")),
        ),
      );
      if (hasBannerChange) observeBanners();
    });
    mutation.observe(document.body, { childList: true, subtree: true });
    const frame = requestAnimationFrame(observeBanners);
    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      mutation.disconnect();
    };
  }, []);

  function dismiss() {
    setDismissedLocally(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      /* In-memory dismissal still works. */
    }
    window.dispatchEvent(new Event(DISMISSED_EVENT));
  }

  if (bannerVisible || dismissed || dismissedLocally) return null;
  return (
    <aside className={styles.corner} aria-label="Support the project">
      <Link href="/donate">
        <Heart size={14} aria-hidden="true" />
        <span>Keep it running</span>
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss donation shortcut"
      >
        <X size={13} aria-hidden="true" />
      </button>
    </aside>
  );
}

export function FloatingDonateButton() {
  const pathname = usePathname();
  if (
    pathname === "/donate" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login")
  )
    return null;
  return <DonationShortcut key={pathname} />;
}
