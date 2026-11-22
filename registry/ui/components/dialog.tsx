"use client"

import * as React from "react"
import {
  Dialog as DialogPrimitive,
  DialogBackdrop,
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogTrigger as DialogTriggerPrimitive,
} from "@ui-sdk/react/dialog"
import { cn } from "cn"

import { Button } from "@tyohnn/components/button"
import { X } from "@tyohnn/icons"
import { flag, slot } from "@tyohnn/lib/slot"
import { strings } from "@tyohnn/strings"

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive>) {
  return <DialogPrimitive {...props} />
}

function DialogTrigger({
  render,
  ...props
}: React.ComponentProps<typeof DialogTriggerPrimitive>) {
  return (
    <DialogTriggerPrimitive
      render={slot("dialog-trigger", render, "button", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
        // Base UI 는 다이얼로그를 여는 단추에도 aria-expanded 를 달았고, 단추 스타일이 그것을 읽어 열린 동안 눌린 모양을 낸다.
        "aria-expanded": state.open,
      }))}
      {...props}
    />
  )
}

/** UI SDK 의 내용과 배경은 스스로 포털로 나간다. shadcn 의 계약을 지키려고 이름만 남긴다 */
function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function DialogClose({
  render,
  ...props
}: React.ComponentProps<typeof DialogClosePrimitive>) {
  return (
    <DialogClosePrimitive
      render={slot("dialog-close", render, "button")}
      {...props}
    />
  )
}

function DialogOverlay({
  className,
  render,
  ...props
}: React.ComponentProps<typeof DialogBackdrop>) {
  return (
    <DialogBackdrop
      render={slot("dialog-overlay", render)}
      className={cn("cn-dialog-overlay fixed inset-0 isolate z-50", className)}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  render,
  ...props
}: Omit<React.ComponentProps<typeof DialogContentPrimitive>, "children"> & {
  children?: React.ReactNode
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogContentPrimitive
        render={slot("dialog-content", render)}
        className={cn(
          "cn-dialog-content fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClose
            render={
              <Button
                variant="ghost"
                className="cn-dialog-close"
                size="icon-sm"
              />
            }
          >
            <X />
            <span className="sr-only">{strings.close}</span>
          </DialogClose>
        )}
      </DialogContentPrimitive>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("cn-dialog-header flex flex-col", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "cn-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClosePrimitive
          render={slot("button", <Button variant="outline" />, "button")}
        >
          {strings.close}
        </DialogClosePrimitive>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  render,
  ...props
}: React.ComponentProps<typeof DialogTitlePrimitive>) {
  return (
    <DialogTitlePrimitive
      render={slot("dialog-title", render, "h2")}
      className={cn("cn-dialog-title cn-font-heading", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  render,
  ...props
}: React.ComponentProps<typeof DialogDescriptionPrimitive>) {
  return (
    <DialogDescriptionPrimitive
      render={slot("dialog-description", render, "p")}
      className={cn("cn-dialog-description", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
