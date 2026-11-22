"use client"

import * as React from "react"
import {
  ScrollArea as ScrollAreaPrimitive,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"
import { cn } from "cn"

import { slot } from "@tyohnn/lib/slot"

function ScrollArea({
  className,
  children,
  render,
  // Base UI 는 내용이 넘치는 동안 막대를 늘 그렸다. UI SDK 의 기본은 가리킬 때만 보이는 hover 다.
  type = "auto",
  ...props
}: Omit<React.ComponentProps<typeof ScrollAreaPrimitive>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <ScrollAreaPrimitive
      type={type}
      render={slot("scroll-area", render)}
      className={cn("cn-scroll-area relative", className)}
      {...props}
    >
      <ScrollAreaViewport
        render={slot("scroll-area-viewport")}
        className="cn-scroll-area-viewport size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaViewport>
      <ScrollBar />
      <ScrollAreaCorner render={slot("scroll-area-corner")} />
    </ScrollAreaPrimitive>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  render,
  ...props
}: Omit<React.ComponentProps<typeof ScrollAreaScrollbar>, "children">) {
  return (
    <ScrollAreaScrollbar
      render={slot("scroll-area-scrollbar", render)}
      orientation={orientation}
      className={cn(
        "cn-scroll-area-scrollbar flex touch-none p-px transition-colors select-none",
        className
      )}
      {...props}
    >
      <ScrollAreaThumb
        render={slot("scroll-area-thumb")}
        className="cn-scroll-area-thumb relative flex-1 bg-border"
      />
    </ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
