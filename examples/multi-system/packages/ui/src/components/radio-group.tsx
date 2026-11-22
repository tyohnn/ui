"use client"

import type * as React from "react"
import { Radio, RadioGroup as RadioGroupPrimitive, RadioIndicator } from "@ui-sdk/react/radio"
import { cn } from "cn"

import { slot } from "@acme/ui/lib/slot"

function RadioGroup({
  className,
  render,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive>) {
  return (
    <RadioGroupPrimitive
      className={cn("cn-radio-group w-full", className)}
      render={slot("radio-group", render)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  render,
  ...props
}: React.ComponentProps<typeof Radio>) {
  return (
    <Radio
      className={cn(
        "cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      render={slot("radio-group-item", render, "button")}
      {...props}
    >
      <RadioIndicator
        render={slot("radio-group-indicator", undefined, "span")}
        className="cn-radio-group-indicator"
      >
        <span className="cn-radio-group-indicator-icon" />
      </RadioIndicator>
    </Radio>
  )
}

export { RadioGroup, RadioGroupItem }
