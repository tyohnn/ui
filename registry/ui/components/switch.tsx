"use client"

import type * as React from "react"
import { Switch as SwitchPrimitive, SwitchThumb } from "@ui-sdk/react/switch"
import { cn } from "cn"

import { slot } from "@tyohnn/lib/slot"

function Switch({
  className,
  size = "default",
  render,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive
      data-size={size}
      className={cn(
        "cn-switch peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      render={slot("switch", render, "button")}
      {...props}
    >
      <SwitchThumb
        render={slot("switch-thumb", undefined, "span")}
        className="cn-switch-thumb pointer-events-none block ring-0 transition-transform"
      />
    </SwitchPrimitive>
  )
}

export { Switch }
