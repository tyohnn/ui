"use client"

import * as React from "react"
import {
  AlertDialog as AlertDialogPrimitive,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent as AlertDialogContentPrimitive,
  AlertDialogDescription as AlertDialogDescriptionPrimitive,
  AlertDialogTitle as AlertDialogTitlePrimitive,
  AlertDialogTrigger as AlertDialogTriggerPrimitive,
} from "@ui-sdk/react/alert-dialog"
import { cn } from "cn"

import { Button } from "@tyohnn/components/button"
import { flag, slot } from "@tyohnn/lib/slot"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive>) {
  return <AlertDialogPrimitive {...props} />
}

function AlertDialogTrigger({
  render,
  ...props
}: React.ComponentProps<typeof AlertDialogTriggerPrimitive>) {
  return (
    <AlertDialogTriggerPrimitive
      render={slot("alert-dialog-trigger", render, "button", (state) => ({
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
function AlertDialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function AlertDialogOverlay({
  className,
  render,
  ...props
}: React.ComponentProps<typeof AlertDialogBackdrop>) {
  return (
    <AlertDialogBackdrop
      render={slot("alert-dialog-overlay", render)}
      className={cn(
        "cn-alert-dialog-overlay fixed inset-0 isolate z-50",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  size = "default",
  render,
  ...props
}: React.ComponentProps<typeof AlertDialogContentPrimitive> & {
  size?: "default" | "sm"
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogContentPrimitive
        render={slot("alert-dialog-content", render)}
        data-size={size}
        className={cn(
          "cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("cn-alert-dialog-header", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "cn-alert-dialog-footer flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn("cn-alert-dialog-media", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  render,
  ...props
}: React.ComponentProps<typeof AlertDialogTitlePrimitive>) {
  return (
    <AlertDialogTitlePrimitive
      render={slot("alert-dialog-title", render, "h2")}
      className={cn("cn-alert-dialog-title cn-font-heading", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  render,
  ...props
}: React.ComponentProps<typeof AlertDialogDescriptionPrimitive>) {
  return (
    <AlertDialogDescriptionPrimitive
      render={slot("alert-dialog-description", render, "p")}
      className={cn("cn-alert-dialog-description", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="alert-dialog-action"
      className={cn("cn-alert-dialog-action", className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogClose> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <AlertDialogClose
      className={cn("cn-alert-dialog-cancel", className)}
      render={slot(
        "alert-dialog-cancel",
        <Button variant={variant} size={size} />,
        "button"
      )}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
