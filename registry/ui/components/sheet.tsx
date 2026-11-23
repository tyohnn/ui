"use client"

import * as React from "react"
import {
  Dialog as SheetPrimitive,
  DialogBackdrop as SheetBackdrop,
  DialogClose as SheetClosePrimitive,
  DialogContent as SheetContentPrimitive,
  DialogDescription as SheetDescriptionPrimitive,
  DialogTitle as SheetTitlePrimitive,
  DialogTrigger as SheetTriggerPrimitive,
} from "@ui-sdk/react/dialog"
import { cn } from "cn"

import { Button } from "@tyohnn/components/button"
import { X } from "@tyohnn/icons"
import { flag, slot } from "@tyohnn/lib/slot"
import { strings } from "@tyohnn/strings"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive>) {
  return <SheetPrimitive {...props} />
}

function SheetTrigger({
  render,
  ...props
}: React.ComponentProps<typeof SheetTriggerPrimitive>) {
  return (
    <SheetTriggerPrimitive
      render={slot("sheet-trigger", render, "button", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
        // Base UI 는 다이얼로그를 여는 단추에도 aria-expanded 를 달았고, 단추 스타일이 그것을 읽어 열린 동안 눌린 모양을 낸다.
        "aria-expanded": state.open,
      }))}
      {...props}
    />
  )
}

function SheetClose({
  render,
  ...props
}: React.ComponentProps<typeof SheetClosePrimitive>) {
  return (
    <SheetClosePrimitive render={slot("sheet-close", render, "button")} {...props} />
  )
}

/** UI SDK 의 내용과 배경은 스스로 포털로 나간다. shadcn 의 계약을 지키려고 이름만 남긴다 */
function SheetPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function SheetOverlay({
  className,
  render,
  ...props
}: React.ComponentProps<typeof SheetBackdrop>) {
  return (
    <SheetBackdrop
      render={slot("sheet-overlay", render)}
      className={cn(
        "cn-sheet-overlay fixed inset-0 z-50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  render,
  ...props
}: Omit<React.ComponentProps<typeof SheetContentPrimitive>, "children"> & {
  children?: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetContentPrimitive
        render={slot("sheet-content", render)}
        data-side={side}
        className={cn(
          "cn-sheet-content data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem]",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetClose
            render={
              <Button
                variant="ghost"
                className="cn-sheet-close"
                size="icon-sm"
              />
            }
          >
            <X />
            <span className="sr-only">{strings.close}</span>
          </SheetClose>
        )}
      </SheetContentPrimitive>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("cn-sheet-header flex flex-col", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("cn-sheet-footer mt-auto flex flex-col", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  render,
  ...props
}: React.ComponentProps<typeof SheetTitlePrimitive>) {
  return (
    <SheetTitlePrimitive
      render={slot("sheet-title", render, "h2")}
      className={cn("cn-sheet-title cn-font-heading", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  render,
  ...props
}: React.ComponentProps<typeof SheetDescriptionPrimitive>) {
  return (
    <SheetDescriptionPrimitive
      render={slot("sheet-description", render, "p")}
      className={cn("cn-sheet-description", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
