"use client"

import type * as React from "react"
import { Checkbox as CheckboxPrimitive, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { cn } from "cn"

import { Check } from "@acme/ui/icons"
import { slot } from "@acme/ui/lib/slot"

type CheckboxPrimitiveProps = React.ComponentProps<typeof CheckboxPrimitive>
type ChangeDetails = Parameters<NonNullable<CheckboxPrimitiveProps["onCheckedChange"]>>[1]

/**
 * 계약은 Base UI 처럼 checked 를 참 · 거짓으로 받고 중간 상태를 `indeterminate` 로 따로 받는다.
 * UI SDK 는 중간 상태를 checked="indeterminate" 한 값으로 받으므로 여기서 둘을 합친다.
 */
function Checkbox({
  className,
  render,
  checked,
  defaultChecked,
  indeterminate,
  onCheckedChange,
  ...props
}: Omit<CheckboxPrimitiveProps, "checked" | "defaultChecked" | "onCheckedChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean, details: ChangeDetails) => void
}) {
  return (
    <CheckboxPrimitive
      className={cn(
        "cn-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      render={slot("checkbox", render, "button")}
      checked={indeterminate ? "indeterminate" : checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(next, details) => onCheckedChange?.(next === true, details)}
      {...props}
    >
      <CheckboxIndicator
        render={slot("checkbox-indicator", undefined, "span")}
        className="cn-checkbox-indicator grid place-content-center text-current transition-none"
      >
        <Check />
      </CheckboxIndicator>
    </CheckboxPrimitive>
  )
}

export { Checkbox }
