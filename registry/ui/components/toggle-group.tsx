"use client"

import * as React from "react"
import {
  Toggle as TogglePrimitive,
  ToggleGroup as ToggleGroupPrimitive,
} from "@ui-sdk/react/toggle"
import { type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { toggleVariants } from "@tyohnn/components/toggle"
import { slot } from "@tyohnn/lib/slot"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  style,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ToggleGroupPrimitive>, "children"> &
  VariantProps<typeof toggleVariants> & {
    children?: React.ReactNode
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  return (
    <ToggleGroupPrimitive
      render={slot("toggle-group", render)}
      orientation={orientation}
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ ...({ "--gap": spacing } as React.CSSProperties), ...style }}
      className={cn(
        "cn-toggle-group group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  render,
  ...props
}: React.ComponentProps<typeof TogglePrimitive> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
      render={slot("toggle-group-item", render, "button")}
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }
