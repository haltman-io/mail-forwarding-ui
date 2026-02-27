"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "ui-focus-ring ui-smooth peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-[color:var(--hairline-border)] bg-[var(--surface-pressed)] shadow-[inset_0_1px_0_var(--inner-highlight),0_8px_16px_-14px_rgba(0,0,0,0.76)] outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[color:color-mix(in_oklch,var(--hairline-border)_44%,white_56%)] data-[state=checked]:bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-[color:var(--text-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.45)] ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
