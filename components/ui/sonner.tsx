"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-white/70" />,
        info: <InfoIcon className="size-4 text-white/70" />,
        warning: <TriangleAlertIcon className="size-4 text-white/70" />,
        error: <OctagonXIcon className="size-4 text-white/70" />,
        loading: <Loader2Icon className="size-4 animate-spin text-white/60" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast w-[var(--width)] rounded-[var(--border-radius)] border border-[var(--normal-border)] bg-[var(--normal-bg)] text-[var(--normal-text)] shadow-lg/30 backdrop-blur-md px-3 py-2 text-sm leading-snug",
          title: "text-sm font-medium text-white/90",
          description: "text-xs text-white/60",
          actionButton:
            "h-7 rounded-md border border-white/10 bg-white/10 px-2 text-xs font-medium text-white/80 hover:bg-white/15",
          cancelButton:
            "h-7 rounded-md px-2 text-xs font-medium text-white/50 hover:text-white/70",
          closeButton:
            "text-white/50 hover:text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20",
        },
      }}
      style={
        {
          "--normal-bg": "rgba(0, 0, 0, 0.72)",
          "--normal-text": "rgba(255, 255, 255, 0.88)",
          "--normal-border": "rgba(255, 255, 255, 0.1)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
