"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@ui-sdk/react/input"
import { cn } from "cn"

import { slot } from "@acme/ui/lib/slot"

/** shadcn 의 입력칸은 숫자 값도 받는다. UI SDK 는 글자 값을 받으므로 글자로 바꿔 넘긴다 */
const text = (value: React.ComponentProps<"input">["value"]) =>
  value === undefined || value === null ? undefined : String(value)

function Input({
  className,
  type,
  value,
  defaultValue,
  "data-slot": dataSlot = "input",
  ...props
}: React.ComponentProps<"input"> & { "data-slot"?: string }) {
  return (
    <InputPrimitive
      type={type}
      value={text(value)}
      defaultValue={text(defaultValue)}
      // 입력칸 묶음과 사이드바는 data-slot 으로 자기 이름(input-group-control 등)을 붙인다
      render={slot(dataSlot, undefined, "input")}
      className={cn(
        "cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
