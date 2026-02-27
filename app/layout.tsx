import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import ThemeProvider from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { LightRays } from "@/components/ui/light-rays";

const uiSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const uiMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Free Mail Forwarding",
  description: "Privacy-first alias forwarding",
  alternates: {
    canonical: "https://forward.haltman.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${uiSans.variable} ${uiMono.variable} min-h-screen bg-background text-foreground font-sans antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
          <LightRays
            color="rgb(var(--alias-accent-rgb) / 0.25)"
            count={9}
            speed={18}
            blur={44}
            length="88vh"
            className="opacity-75"
            aria-hidden
          />
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,_rgb(var(--alias-accent-rgb)_/_0.15),_transparent_70%)] blur-[120px] opacity-70" />
          <div className="absolute inset-0 opacity-[0.035] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')] mix-blend-overlay" />
        </div>

        <ThemeProvider>
          {children}
          <a rel="me" href="https://infosec.exchange/@haltman" className="sr-only">
            Mastodon
          </a>
          <Toaster
            position="bottom-right"
            offset={{ bottom: "2rem", right: "2rem" }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
