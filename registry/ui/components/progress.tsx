"use client"

import type * as React from "react"
import {
  Progress as ProgressPrimitive,
  ProgressIndicator as ProgressIndicatorPrimitive,
  ProgressLabel as ProgressLabelPrimitive,
  ProgressTrack as ProgressTrackPrimitive,
  ProgressValue as ProgressValuePrimitive,
} from "@ui-sdk/react/progress"
import { cn } from "cn"

import { slot } from "@tyohnn/lib/slot"

function Progress({
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ProgressPrimitive>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <ProgressPrimitive
      className={cn("cn-progress-root flex flex-wrap gap-3", className)}
      render={slot("progress", render)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive>
  )
}

function ProgressTrack({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ProgressTrackPrimitive>) {
  return (
    <ProgressTrackPrimitive
      className={cn(
        "cn-progress-track relative flex w-full items-center overflow-x-hidden",
        className
      )}
      render={slot("progress-track", render)}
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ProgressIndicatorPrimitive>) {
  return (
    <ProgressIndicatorPrimitive
      className={cn("cn-progress-indicator h-full transition-all", className)}
      render={slot("progress-indicator", render)}
      {...props}
    />
  )
}

function ProgressLabel({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ProgressLabelPrimitive>) {
  return (
    <ProgressLabelPrimitive
      className={cn("cn-progress-label", className)}
      render={slot("progress-label", render, "span")}
      {...props}
    />
  )
}

function ProgressValue({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ProgressValuePrimitive>) {
  return (
    <ProgressValuePrimitive
      className={cn("cn-progress-value", className)}
      render={slot("progress-value", render, "span")}
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
