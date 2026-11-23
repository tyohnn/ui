"use client"

import * as React from "react"
import {
  Drawer as DrawerPrimitive,
  DrawerBackdrop,
  DrawerClose as DrawerClosePrimitive,
  DrawerContent as DrawerContentPrimitive,
  DrawerDescription as DrawerDescriptionPrimitive,
  DrawerTitle as DrawerTitlePrimitive,
  DrawerTrigger as DrawerTriggerPrimitive,
} from "@ui-sdk/react/drawer"
import { cn } from "cn"

import { flag, slot } from "@acme/ui/lib/slot"

type SwipeDirection = "down" | "up" | "left" | "right"

type DrawerContextProps = {
  hasSnapPoints: boolean
  modal: React.ComponentProps<typeof DrawerPrimitive>["modal"]
  showSwipeHandle: boolean
  swipeDirection: SwipeDirection
}

const DrawerContext = React.createContext<DrawerContextProps | null>(null)

function useDrawer() {
  const context = React.useContext(DrawerContext)

  if (!context) {
    throw new Error("useDrawer must be used within a Drawer.")
  }

  return context
}

/** shadcn 의 swipeDirection 은 닫히려고 미는 쪽이고, UI SDK 의 side 는 서랍이 붙은 가장자리다. 둘은 같은 자리를 가리킨다 */
const sideOf = {
  down: "bottom",
  up: "top",
  left: "left",
  right: "right",
} as const

function Drawer({
  modal = true,
  showSwipeHandle = false,
  snapPoints,
  swipeDirection = "down",
  ...props
}: Omit<React.ComponentProps<typeof DrawerPrimitive>, "side"> & {
  showSwipeHandle?: boolean
  swipeDirection?: SwipeDirection
}) {
  const hasSnapPoints = snapPoints != null && snapPoints.length > 0
  const contextValue = React.useMemo(
    () => ({ hasSnapPoints, modal, showSwipeHandle, swipeDirection }),
    [hasSnapPoints, modal, showSwipeHandle, swipeDirection]
  )

  return (
    <DrawerContext.Provider value={contextValue}>
      <DrawerPrimitive
        modal={modal}
        snapPoints={snapPoints}
        side={sideOf[swipeDirection]}
        {...props}
      />
    </DrawerContext.Provider>
  )
}

function DrawerTrigger({
  render,
  ...props
}: React.ComponentProps<typeof DrawerTriggerPrimitive>) {
  return (
    <DrawerTriggerPrimitive
      render={slot("drawer-trigger", render, "button", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
        // Base UI 는 서랍을 여는 단추에도 aria-expanded 를 달았고, 단추 스타일이 그것을 읽어 열린 동안 눌린 모양을 낸다.
        "aria-expanded": state.open,
      }))}
      {...props}
    />
  )
}

/** UI SDK 의 내용과 배경은 스스로 포털로 나간다. shadcn 의 계약을 지키려고 이름만 남긴다 */
function DrawerPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function DrawerClose({
  render,
  ...props
}: React.ComponentProps<typeof DrawerClosePrimitive>) {
  return (
    <DrawerClosePrimitive
      render={slot("drawer-close", render, "button")}
      {...props}
    />
  )
}

function DrawerOverlay({
  className,
  render,
  ...props
}: React.ComponentProps<typeof DrawerBackdrop>) {
  return (
    <DrawerBackdrop
      // 어둡기는 UI SDK 가 끄는 만큼 인라인 opacity 로 쓴다. 쉬는 자리에서는 1 이다.
      render={slot("drawer-overlay", render)}
      className={cn(
        "cn-drawer-overlay fixed inset-0 z-50 min-h-dvh select-none supports-[-webkit-touch-callout:none]:absolute",
        className
      )}
      {...props}
    />
  )
}

function DrawerSwipeHandle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-swipe-handle"
      aria-hidden="true"
      className={cn(
        "cn-drawer-swipe-handle relative z-10 flex shrink-0 cursor-grab transition-opacity duration-200 group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:order-last active:cursor-grabbing",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  render,
  // Base UI 의 서랍은 열릴 때 안의 단추가 아니라 판 자체에 초점을 둔다. 끌어 올린 판에서 단추가 먼저 빛나지 않게 그 동작을 잇는다.
  initialFocus = "content",
  ...props
}: Omit<React.ComponentProps<typeof DrawerContentPrimitive>, "children"> & {
  children?: React.ReactNode
}) {
  const { hasSnapPoints, modal, showSwipeHandle, swipeDirection } = useDrawer()
  const swipeAxis =
    swipeDirection === "down" || swipeDirection === "up" ? "y" : "x"

  return (
    <DrawerPortal>
      {modal === true && <DrawerOverlay />}
      <DrawerContentPrimitive
        initialFocus={initialFocus}
        render={slot("drawer-popup", render, "div", (state) => ({
          // 3층 규칙이 읽는 Base UI 의 이름이다. UI SDK 는 붙은 가장자리를 data-side 로 쓴다.
          "data-swipe-direction": swipeDirection,
          "data-swipe-axis": swipeAxis,
          "data-snap-points": flag(hasSnapPoints),
          "data-swiping": flag(state.dragging),
          "data-nested-drawer-open": flag(state.nestedOpen),
        }))}
        className={cn(
          // Base. 움직임(열고 닫기 · 끌기 · 스냅)은 UI SDK 가 translate 로 직접 그린다.
          "cn-drawer-popup group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) flex-col transition-[height,opacity,filter,scale] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none select-none [interpolate-size:allow-keywords]",
          // Nested. 위에 서랍이 하나 열릴 때마다 UI SDK 가 --drawer-stack 을 하나씩 올린다.
          "scale-[max(0,calc(1-var(--drawer-stack,0)*0.05))] data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95 data-swiping:duration-0",
          // Bleed.
          "after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--color-popover)) data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full [--bleed:3rem]",
          // Sizing.
          "[--drawer-content-height:var(--drawer-height,auto)] data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem]",
          // Axis.
          "data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:flex-row",
          // Direction.
          "data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right",
          className
        )}
        {...props}
      >
        {showSwipeHandle && <DrawerSwipeHandle />}
        <div
          data-slot="drawer-content"
          className="cn-drawer-content-base flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] select-text group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-swiping/drawer-popup:select-none"
        >
          {children}
        </div>
      </DrawerContentPrimitive>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "cn-drawer-header-base flex shrink-0 flex-col group-data-[swipe-axis=y]/drawer-popup:text-center",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "cn-drawer-footer-base mt-auto flex shrink-0 flex-col",
        className
      )}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  render,
  ...props
}: React.ComponentProps<typeof DrawerTitlePrimitive>) {
  return (
    <DrawerTitlePrimitive
      render={slot("drawer-title", render, "h2")}
      className={cn("cn-drawer-title cn-font-heading", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  render,
  ...props
}: React.ComponentProps<typeof DrawerDescriptionPrimitive>) {
  return (
    <DrawerDescriptionPrimitive
      render={slot("drawer-description", render, "p")}
      className={cn("cn-drawer-description text-balance", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerSwipeHandle,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
