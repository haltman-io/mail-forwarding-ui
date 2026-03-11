import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import ThemeProvider from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { DebugToolbarLoader } from "@/components/debug-toolbar-loader";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${uiSans.variable} ${uiMono.variable} min-h-screen bg-background text-foreground font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <a rel="me" href="https://infosec.exchange/@haltman" className="sr-only">
            Mastodon
          </a>
          <Toaster
            position="bottom-right"
            offset={{ bottom: "2rem", right: "2rem" }}
            closeButton
            duration={Infinity}
            swipeDirections={[]}
          />
          {DebugToolbarLoader && <DebugToolbarLoader />}
        </ThemeProvider>
      </body>
    </html>
  );
}
