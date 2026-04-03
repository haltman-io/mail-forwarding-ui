"use client"

import type { ReactNode } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Loader2,
} from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

function ToastIconShell({
  children,
  tone,
}: {
  children: ReactNode
  tone: "emerald" | "cyan" | "amber" | "rose" | "neutral"
}) {
  const toneClasses = {
    emerald:
      "border border-[rgb(var(--alias-accent-rgb)_/_0.12)] bg-[rgb(var(--alias-accent-rgb)_/_0.08)] shadow-[0_0_12px_rgb(var(--alias-accent-rgb)_/_0.06)] text-[var(--neu-green)]",
    cyan:
      "border border-[rgba(34,211,238,0.14)] bg-[rgba(34,211,238,0.09)] shadow-[0_0_12px_rgba(34,211,238,0.06)] text-cyan-400",
    amber:
      "border border-[rgba(251,191,36,0.14)] bg-[rgba(251,191,36,0.09)] shadow-[0_0_12px_rgba(251,191,36,0.06)] text-amber-400",
    rose:
      "border border-[rgba(251,113,133,0.14)] bg-[rgba(251,113,133,0.09)] shadow-[0_0_12px_rgba(251,113,133,0.06)] text-rose-400",
    neutral:
      "border border-[var(--glass-border)] bg-[rgba(255,255,255,0.04)] shadow-[0_0_12px_rgba(255,255,255,0.04)] text-[var(--text-muted)]",
  } satisfies Record<string, string>

  return (
    <span
      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

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
            "group toast !items-start !gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_30px_-14px_rgba(0,0,0,0.5)] backdrop-blur-[var(--glass-blur)] [backdrop-filter:blur(var(--glass-blur))_saturate(1.3)]",
          content: "relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-0.5 pt-0.5",
          title: "text-sm leading-5 font-semibold tracking-tight text-[var(--text-primary)]",
          description: "text-[13px] leading-5 text-[var(--text-muted)]",
          icon: "relative z-10 !m-0 !h-10 !w-10 shrink-0 self-start [&>svg]:!m-0",
          closeButton:
            "z-20 border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-muted)] transition-colors hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)]",
          actionButton:
            "relative z-10 rounded-full border border-[rgb(var(--alias-accent-rgb)_/_0.14)] bg-[rgb(var(--alias-accent-rgb)_/_0.08)] px-3 py-2 font-medium text-[var(--neu-green)] transition-colors hover:border-[rgb(var(--alias-accent-rgb)_/_0.20)] hover:bg-[rgb(var(--alias-accent-rgb)_/_0.11)]",
          cancelButton:
            "relative z-10 rounded-full border border-[var(--glass-border)] bg-[rgba(255,255,255,0.04)] px-3 py-2 font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--hover-state)]",
        },
      }}
      icons={{
        success: (
          <ToastIconShell tone="emerald">
            <CheckCircle2 className="h-[18px] w-[18px] opacity-80" />
          </ToastIconShell>
        ),
        info: (
          <ToastIconShell tone="cyan">
            <Info className="h-[18px] w-[18px] opacity-80" />
          </ToastIconShell>
        ),
        warning: (
          <ToastIconShell tone="amber">
            <AlertTriangle className="h-[18px] w-[18px] opacity-80" />
          </ToastIconShell>
        ),
        error: (
          <ToastIconShell tone="rose">
            <XCircle className="h-[18px] w-[18px] opacity-80" />
          </ToastIconShell>
        ),
        loading: (
          <ToastIconShell tone="neutral">
            <Loader2 className="h-[18px] w-[18px] animate-spin opacity-80" />
          </ToastIconShell>
        ),
      }}
      {...props}
    />
  )
}

export { Toaster }
