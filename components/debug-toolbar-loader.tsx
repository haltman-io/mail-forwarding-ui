"use client";

import dynamic from "next/dynamic";

const Toolbar =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEBUG_UI === "true"
    ? dynamic(
        () =>
          import("@/components/debug-toolbar").then((m) => m.DebugToolbar),
        { ssr: false }
      )
    : null;

export function DebugToolbarLoader() {
  if (!Toolbar) return null;
  return <Toolbar />;
}
