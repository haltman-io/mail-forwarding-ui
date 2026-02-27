"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Loader2,
  Copy
} from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--surface-elevated)] group-[.toaster]:text-[var(--text-primary)] group-[.toaster]:border-[var(--hairline-border)] group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4 font-sans data-[type=success]:border-emerald-500/20 data-[type=error]:border-rose-500/20 data-[type=warning]:border-amber-500/20 data-[type=info]:border-cyan-500/20",
          description: "group-[.toast]:text-[var(--text-muted)]",
          actionButton:
            "group-[.toast]:bg-[var(--text-primary)] group-[.toast]:text-[var(--surface-elevated)] font-medium",
          cancelButton:
            "group-[.toast]:bg-[var(--surface-pressed)] group-[.toast]:text-[var(--text-muted)] font-medium",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        info: <Info className="h-5 w-5 text-cyan-400" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
        error: <XCircle className="h-5 w-5 text-rose-400" />,
        loading: <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
