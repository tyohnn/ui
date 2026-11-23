"use client"

import * as React from "react"
import {
  Popover as PopoverPrimitive,
  PopoverContent as PopoverContentPrimitive,
  PopoverDescription as PopoverDescriptionPrimitive,
  PopoverTitle as PopoverTitlePrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
} from "@ui-sdk/react/popover"
import { cn } from "cn"

import { sideOf, type ContractSide } from "@tyohnn/lib/popup"
import { flag, slot } from "@tyohnn/lib/slot"

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive>) {
  return <PopoverPrimitive {...props} />
}

function PopoverTrigger({
  render,
  ...props
}: React.ComponentProps<typeof PopoverTriggerPrimitive>) {
  return (
    <PopoverTriggerPrimitive
      render={slot("popover-trigger", render, "button", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
      }))}
      {...props}
    />
  )
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  render,
  ...props
}: Omit<React.ComponentProps<typeof PopoverContentPrimitive>, "side"> & {
  side?: ContractSide
}) {
  return (
    <PopoverContentPrimitive
      align={align}
      alignOffset={alignOffset}
      side={sideOf(side)}
      sideOffset={sideOffset}
      render={slot("popover-content", render)}
      className={cn(
        "cn-popover-content cn-popover-content-logical isolate z-50 w-72 origin-(--transform-origin) outline-hidden",
        className
      )}
      {...props}
    />
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("cn-popover-header", className)}
      {...props}
    />
  )
}

function PopoverTitle({
  className,
  render,
  ...props
}: React.ComponentProps<typeof PopoverTitlePrimitive>) {
  return (
    <PopoverTitlePrimitive
      render={slot("popover-title", render, "h2")}
      className={cn("cn-popover-title", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  render,
  ...props
}: React.ComponentProps<typeof PopoverDescriptionPrimitive>) {
  return (
    <PopoverDescriptionPrimitive
      render={slot("popover-description", render, "p")}
      className={cn("cn-popover-description", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
