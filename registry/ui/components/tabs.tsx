"use client"

import type * as React from "react"
import {
  Tabs as TabsPrimitive,
  TabsList as TabsListPrimitive,
  TabsPanel as TabsPanelPrimitive,
  TabsTab as TabsTabPrimitive,
} from "@ui-sdk/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { flag, slot } from "@tyohnn/lib/slot"

function Tabs({
  className,
  orientation = "horizontal",
  activation = "manual",
  render,
  ...props
}: React.ComponentProps<typeof TabsPrimitive>) {
  return (
    <TabsPrimitive
      render={slot("tabs", render)}
      orientation={orientation}
      // 화살표는 포커스만 옮기고 Enter · Space 가 탭을 고른다(Base UI 시절과 같다). UI SDK 의 기본은 automatic 이다
      activation={activation}
      className={cn(
        "cn-tabs group/tabs flex data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "cn-tabs-list group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "cn-tabs-list-variant-default bg-muted",
        line: "cn-tabs-list-variant-line gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  render,
  ...props
}: React.ComponentProps<typeof TabsListPrimitive> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsListPrimitive
      render={slot("tabs-list", render)}
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  render,
  ...props
}: React.ComponentProps<typeof TabsTabPrimitive>) {
  return (
    <TabsTabPrimitive
      // UI SDK 의 고른 탭은 data-selected 다. shadcn 계약(data-active)으로 잇는다
      render={slot("tabs-trigger", render, "button", (state) => ({
        "data-active": flag(state.selected),
      }))}
      className={cn(
        "cn-tabs-trigger relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  render,
  ...props
}: React.ComponentProps<typeof TabsPanelPrimitive>) {
  return (
    <TabsPanelPrimitive
      render={slot("tabs-content", render)}
      className={cn("cn-tabs-content flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
