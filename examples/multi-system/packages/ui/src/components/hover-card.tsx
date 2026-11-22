"use client"

import * as React from "react"
import {
  HoverCard as HoverCardPrimitive,
  HoverCardContent as HoverCardContentPrimitive,
  HoverCardTrigger as HoverCardTriggerPrimitive,
} from "@ui-sdk/react/hover-card"
import { cn } from "cn"

import { sideOf, type ContractSide } from "@acme/ui/lib/popup"
import { flag, slot } from "@acme/ui/lib/slot"

function HoverCard({ ...props }: React.ComponentProps<typeof HoverCardPrimitive>) {
  return <HoverCardPrimitive {...props} />
}

function HoverCardTrigger({
  render,
  ...props
}: React.ComponentProps<typeof HoverCardTriggerPrimitive>) {
  return (
    <HoverCardTriggerPrimitive
      render={slot("hover-card-trigger", render, "a", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
      }))}
      {...props}
    />
  )
}

function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 4,
  render,
  ...props
}: Omit<React.ComponentProps<typeof HoverCardContentPrimitive>, "side"> & {
  side?: ContractSide
}) {
  return (
    <HoverCardContentPrimitive
      align={align}
      alignOffset={alignOffset}
      side={sideOf(side)}
      sideOffset={sideOffset}
      render={slot("hover-card-content", render)}
      className={cn(
        "cn-hover-card-content cn-hover-card-content-logical isolate z-50 origin-(--transform-origin) outline-hidden",
        className
      )}
      {...props}
    />
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
