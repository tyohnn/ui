"use client"

import * as React from "react"
import {
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuContent as NavigationMenuContentPrimitive,
  NavigationMenuIndicator as NavigationMenuIndicatorPrimitive,
  NavigationMenuItem as NavigationMenuItemPrimitive,
  NavigationMenuLink as NavigationMenuLinkPrimitive,
  NavigationMenuList as NavigationMenuListPrimitive,
  NavigationMenuTrigger as NavigationMenuTriggerPrimitive,
  NavigationMenuViewport as NavigationMenuViewportPrimitive,
} from "@ui-sdk/react/navigation-menu"
import { cva } from "class-variance-authority"
import { cn } from "cn"

import { ChevronDown } from "@tyohnn/icons"
import { flag, slot } from "@tyohnn/lib/slot"

type ViewportProps = React.ComponentProps<typeof NavigationMenuViewportPrimitive>

function NavigationMenu({
  align = "start",
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof NavigationMenuPrimitive>, "children"> &
  Pick<ViewportProps, "align"> & { children?: React.ReactNode }) {
  return (
    <NavigationMenuPrimitive
      render={slot("navigation-menu", render, "nav", (state) => ({
        // Base UI 는 판이 열린 동안 루트와 목록에 data-open 을 달았다. UI SDK 는 항목과 트리거에만 단다.
        "data-open": flag(state.open),
      }))}
      className={cn(
        "cn-navigation-menu group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      <NavigationMenuPositioner align={align} />
    </NavigationMenuPrimitive>
  )
}

function NavigationMenuList({
  className,
  render,
  ...props
}: React.ComponentProps<typeof NavigationMenuListPrimitive>) {
  return (
    <NavigationMenuListPrimitive
      render={slot("navigation-menu-list", render, "ul", (state) => ({
        "data-open": flag(state.open),
      }))}
      className={cn(
        "cn-navigation-menu-list group flex flex-1 list-none items-center justify-center",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  render,
  ...props
}: React.ComponentProps<typeof NavigationMenuItemPrimitive>) {
  return (
    <NavigationMenuItemPrimitive
      render={slot("navigation-menu-item", render, "li")}
      className={cn("cn-navigation-menu-item relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "cn-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none"
)

function NavigationMenuTrigger({
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof NavigationMenuTriggerPrimitive>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <NavigationMenuTriggerPrimitive
      render={slot("navigation-menu-trigger", render, "button", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
        // Base UI 는 판이 열린 동안 트리거를 눌린 것으로 두었다.
        "data-pressed": flag(state.open),
      }))}
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDown
        className="cn-navigation-menu-trigger-icon"
        aria-hidden="true"
      />
    </NavigationMenuTriggerPrimitive>
  )
}

function NavigationMenuContent({
  className,
  render,
  ...props
}: React.ComponentProps<typeof NavigationMenuContentPrimitive>) {
  return (
    <NavigationMenuContentPrimitive
      render={slot("navigation-menu-content", render)}
      className={cn(
        "cn-navigation-menu-content h-full w-auto transition-[opacity,transform,translate] duration-[0.35s] **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * Base UI 는 자리 잡이 · 팝업 · 뷰포트 세 겹이었다. UI SDK 의 뷰포트는 한 겹이고 열린 내용의 크기를
 * --viewport-width · --viewport-height 로 받아 스스로 자리를 잡는다. 세 겹의 이름을 한 판에 모아 3층 규칙이 그대로 붙는다.
 */
function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: ViewportProps) {
  return (
    <NavigationMenuViewportPrimitive
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      className={cn(
        "cn-navigation-menu-positioner cn-navigation-menu-popup isolate z-50 h-(--viewport-height) w-(--viewport-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden transition-[opacity,transform,width,height,scale,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)]",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuLink({
  className,
  active,
  current,
  render,
  ...props
}: React.ComponentProps<typeof NavigationMenuLinkPrimitive> & {
  /** shadcn 의 이름이다. UI SDK 는 같은 뜻을 current 로 받는다 */
  active?: boolean
}) {
  return (
    <NavigationMenuLinkPrimitive
      current={current ?? active}
      render={slot("navigation-menu-link", render, "a", (state) => ({
        // 3층 규칙이 읽는 Base UI 의 이름이다. UI SDK 는 같은 상태를 data-current 로 쓴다.
        "data-active": flag(state.current),
      }))}
      className={cn("cn-navigation-menu-link", className)}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof NavigationMenuIndicatorPrimitive>, "children">) {
  return (
    <NavigationMenuIndicatorPrimitive
      render={slot("navigation-menu-indicator", render)}
      className={cn(
        "cn-navigation-menu-indicator top-full z-1 flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="cn-navigation-menu-indicator-arrow relative top-[60%] h-2 w-2 rotate-45" />
    </NavigationMenuIndicatorPrimitive>
  )
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
}
