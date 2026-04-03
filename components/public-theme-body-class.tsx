"use client";

import { useLayoutEffect } from "react";

const PUBLIC_THEME_BODY_CLASS = "public-theme-active";

export function PublicThemeBodyClass() {
  useLayoutEffect(() => {
    document.body.classList.add(PUBLIC_THEME_BODY_CLASS);

    return () => {
      document.body.classList.remove(PUBLIC_THEME_BODY_CLASS);
    };
  }, []);

  return null;
}
