import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "ui-focus-ring file:text-foreground placeholder:text-[var(--text-muted)] selection:bg-[var(--alias-accent)]/20 selection:text-[var(--text-primary)] h-10 w-full min-w-0 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.18)] px-3 py-2 text-[15px] text-[var(--text-primary)] outline-none shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-[rgba(255,255,255,0.08)] focus:border-[rgba(48,209,88,0.30)] focus:shadow-[0_0_0_2px_var(--focus-ring)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 md:text-sm",
        "aria-invalid:border-[var(--destructive)]/50 aria-invalid:shadow-[0_0_0_3px_rgba(255,69,58,0.2)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
