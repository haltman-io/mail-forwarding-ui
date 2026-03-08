"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "ui-focus-ring peer inline-flex h-[1.25rem] w-9 shrink-0 cursor-pointer items-center rounded-full border-none bg-[var(--surface-pressed)] outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-[var(--alias-accent)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[1.05rem] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] ring-0 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=checked]:translate-x-[calc(100%-1px)] data-[state=unchecked]:translate-x-[1px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
