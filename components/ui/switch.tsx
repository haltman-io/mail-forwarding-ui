"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "ui-focus-ring ui-smooth peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-[color:var(--hairline-border)] bg-[var(--surface-pressed)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(255,255,255,0.05)] outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[color:color-mix(in_oklch,var(--alias-accent)_40%,white_60%)] data-[state=checked]:bg-[linear-gradient(180deg,color-mix(in_oklch,var(--alias-accent)_90%,transparent)_0%,color-mix(in_oklch,var(--alias-accent)_70%,transparent)_100%)] data-[state=checked]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_0_12px_var(--accent-glow),inset_0_-1px_0_color-mix(in_oklch,white_20%,transparent)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-[linear-gradient(180deg,var(--text-primary)_0%,color-mix(in_oklch,var(--text-primary)_85%,black_15%)_100%)] shadow-[0_2px_6px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.2)] ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
