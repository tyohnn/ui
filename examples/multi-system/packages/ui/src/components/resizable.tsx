"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Resizable as ResizablePrimitive,
  ResizableHandle as ResizableHandlePrimitive,
  ResizablePanel as ResizablePanelPrimitive,
} from "@ui-sdk/react/resizable"

import { slot } from "@acme/ui/lib/slot"

function ResizablePanelGroup({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive>) {
  return (
    <ResizablePrimitive
      render={slot("resizable-panel-group", render)}
      className={cn(
        "cn-resizable-panel-group flex h-full w-full aria-[orientation=vertical]:flex-col data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

/** react-resizable-panels 는 패널 안에 스크롤 상자를 한 겹 더 두었다. UI SDK 의 패널은 내용을 바로 담으므로 패널이 스스로 스크롤한다 */
function ResizablePanel({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ResizablePanelPrimitive>) {
  return (
    <ResizablePanelPrimitive
      render={slot("resizable-panel", render)}
      className={cn("overflow-auto", className)}
      {...props}
    />
  )
}

function ResizableHandle({
  withHandle,
  className,
  render,
  ...props
}: React.ComponentProps<typeof ResizableHandlePrimitive> & {
  withHandle?: boolean
}) {
  return (
    <ResizableHandlePrimitive
      render={slot("resizable-handle", render)}
      className={cn(
        "cn-resizable-handle relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="cn-resizable-handle-icon z-10 flex shrink-0" />
      )}
    </ResizableHandlePrimitive>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
