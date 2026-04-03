import type { ReactNode } from "react";
import { PublicThemeBodyClass } from "@/components/public-theme-body-class";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicThemeBodyClass />
      {children}
    </>
  );
}
