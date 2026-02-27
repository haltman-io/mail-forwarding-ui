import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "ui-focus-ring ui-smooth ui-surface-pressed file:text-foreground placeholder:text-[var(--text-muted)] selection:bg-primary selection:text-primary-foreground h-9 w-full min-w-0 rounded-lg px-3 py-1 text-base text-[var(--text-primary)] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-[color:color-mix(in_oklch,var(--hairline-border)_58%,white_42%)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_1px_rgba(220,38,38,0.4)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
