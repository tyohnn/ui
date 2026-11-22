"use client"

import * as React from "react"
import {
  MenuCheckboxItem as MenuCheckboxItemPrimitive,
  MenuItemIndicator as MenuItemIndicatorPrimitive,
  MenuRadioItem as MenuRadioItemPrimitive,
} from "@ui-sdk/react/menu"
import { Menubar as MenubarPrimitive } from "@ui-sdk/react/menubar"
import { renderElement } from "@ui-sdk/react/primitive"
import { cn } from "cn"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@acme/ui/components/dropdown-menu"
import { Check } from "@acme/ui/icons"
import { slot } from "@acme/ui/lib/slot"

/** 자식을 상태 함수로 받지 않는다. shadcn 의 항목은 글자와 표시를 그대로 늘어놓는다 */
type Plain<T> = Omit<T, "children"> & { children?: React.ReactNode }

/** 체크 표시는 shadcn 이 감싼 span 안에 이름 없이 들어간다. UI SDK 가 붙이는 data-slot 을 지운다 */
const unnamed = (props: Record<string, unknown>, state: unknown) =>
  renderElement("span", { ...props, "data-slot": undefined }, undefined, state)

function Menubar({
  className,
  render,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive>) {
  return (
    <MenubarPrimitive
      render={slot("menubar", render)}
      className={cn("cn-menubar flex items-center", className)}
      {...props}
    />
  )
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPortal>) {
  return <DropdownMenuPortal {...props} />
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenuTrigger
      data-slot="menubar-trigger"
      className={cn(
        "cn-menubar-trigger flex items-center outline-hidden select-none",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "cn-menubar-content cn-menubar-content-logical cn-menu-target cn-menu-translucent",
        className
      )}
      {...props}
    />
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn("cn-menubar-item group/menubar-item", className)}
      {...props}
    />
  )
}

function MenubarCheckboxItem({
  className,
  children,
  inset,
  value,
  render,
  ...props
}: Plain<Omit<React.ComponentProps<typeof MenuCheckboxItemPrimitive>, "value">> & {
  value?: string
  inset?: boolean
}) {
  // UI SDK 는 체크 항목을 값으로 가리킨다. shadcn 은 값 없이 쓰므로 없으면 하나 만든다.
  const fallback = React.useId()

  return (
    <MenuCheckboxItemPrimitive
      value={value ?? fallback}
      render={slot("menubar-checkbox-item", render)}
      data-inset={inset}
      className={cn(
        "cn-menubar-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span className="cn-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center">
        <MenuItemIndicatorPrimitive render={unnamed}>
          <Check />
        </MenuItemIndicatorPrimitive>
      </span>
      {children}
    </MenuCheckboxItemPrimitive>
  )
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarRadioItem({
  className,
  children,
  inset,
  render,
  ...props
}: Plain<React.ComponentProps<typeof MenuRadioItemPrimitive>> & {
  inset?: boolean
}) {
  return (
    <MenuRadioItemPrimitive
      render={slot("menubar-radio-item", render)}
      data-inset={inset}
      className={cn(
        "cn-menubar-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span className="cn-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center">
        <MenuItemIndicatorPrimitive render={unnamed}>
          <Check />
        </MenuItemIndicatorPrimitive>
      </span>
      {children}
    </MenuRadioItemPrimitive>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuLabel
      data-slot="menubar-label"
      data-inset={inset}
      className={cn("cn-menubar-label", className)}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      data-slot="menubar-separator"
      className={cn("cn-menubar-separator -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuShortcut>) {
  return (
    <DropdownMenuShortcut
      data-slot="menubar-shortcut"
      className={cn("cn-menubar-shortcut ml-auto", className)}
      {...props}
    />
  )
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuSubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn("cn-menubar-sub-trigger", className)}
      {...props}
    />
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  return (
    <DropdownMenuSubContent
      data-slot="menubar-sub-content"
      className={cn(
        "cn-menubar-sub-content cn-menu-target cn-menu-translucent",
        className
      )}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
