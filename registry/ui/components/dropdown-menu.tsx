"use client"

import * as React from "react"
import {
  Menu as MenuPrimitive,
  MenuCheckboxItem as MenuCheckboxItemPrimitive,
  MenuContent as MenuContentPrimitive,
  MenuGroup as MenuGroupPrimitive,
  MenuGroupLabel as MenuGroupLabelPrimitive,
  MenuItem as MenuItemPrimitive,
  MenuItemIndicator as MenuItemIndicatorPrimitive,
  MenuRadioGroup as MenuRadioGroupPrimitive,
  MenuRadioItem as MenuRadioItemPrimitive,
  MenuSeparator as MenuSeparatorPrimitive,
  MenuSub as MenuSubPrimitive,
  MenuSubTrigger as MenuSubTriggerPrimitive,
  MenuTrigger as MenuTriggerPrimitive,
} from "@ui-sdk/react/menu"
import { renderElement } from "@ui-sdk/react/primitive"
import { cn } from "cn"

import { Check, ChevronRight } from "@tyohnn/icons"
import { sideOf, type ContractSide } from "@tyohnn/lib/popup"
import { flag, slot } from "@tyohnn/lib/slot"

/** 묶음 이름표는 묶음 안에서만 UI SDK 의 이름표가 된다. 묶음 밖의 이름표는 글자만 보여 준다 */
const InGroup = React.createContext(false)

/** 체크 표시는 shadcn 이 감싼 span 안에 이름 없이 들어간다. UI SDK 가 붙이는 data-slot 을 지운다 */
const unnamed = (props: Record<string, unknown>, state: unknown) =>
  renderElement("span", { ...props, "data-slot": undefined }, undefined, state)

/** 자식을 상태 함수로 받지 않는다. shadcn 의 항목은 아이콘 · 글자 · 표시를 그대로 늘어놓는다 */
type Plain<T> = Omit<T, "children"> & { children?: React.ReactNode }

/** 메뉴바처럼 이 부분들을 감싸 쓰는 쪽이 자기 이름(data-slot)을 넘길 수 있다 */
type Named = { "data-slot"?: string }

type ItemSelect = NonNullable<
  React.ComponentProps<typeof MenuItemPrimitive>["onSelect"]
>

/**
 * shadcn 은 항목을 고를 때 onClick 을 건다. Base UI 는 키보드로 고를 때도 click 을 내보냈지만 UI SDK 는 onSelect 만 부른다.
 * 그래서 onClick 을 onSelect 로 옮겨 마우스와 키보드에서 한 번씩만 불리게 한다.
 */
function selectHandler(
  onClick: React.MouseEventHandler<HTMLDivElement> | undefined,
  onSelect: ItemSelect | undefined
): ItemSelect | undefined {
  if (!onClick) return onSelect
  return (event) => {
    onClick(event as unknown as React.MouseEvent<HTMLDivElement>)
    return onSelect?.(event)
  }
}

function DropdownMenu({ ...props }: React.ComponentProps<typeof MenuPrimitive>) {
  return <MenuPrimitive {...props} />
}

/** UI SDK 의 메뉴 내용은 스스로 포털로 나간다. shadcn 의 계약을 지키려고 이름만 남긴다 */
function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuTrigger({
  render,
  "data-slot": name = "dropdown-menu-trigger",
  ...props
}: React.ComponentProps<typeof MenuTriggerPrimitive> & Named) {
  return (
    <MenuTriggerPrimitive
      render={slot(name, render, "button", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
        // Base UI 는 메뉴가 열린 동안 단추를 눌린 것으로 두었고, 단추 스타일이 data-pressed 를 읽는다.
        "data-pressed": flag(state.open),
      }))}
      {...props}
    />
  )
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  render,
  "data-slot": name = "dropdown-menu-content",
  ...props
}: Omit<React.ComponentProps<typeof MenuContentPrimitive>, "side"> & {
  side?: ContractSide
  "data-slot"?: string
}) {
  return (
    <MenuContentPrimitive
      render={slot(name, render)}
      align={align}
      alignOffset={alignOffset}
      side={sideOf(side)}
      sideOffset={sideOffset}
      className={cn(
        "cn-dropdown-menu-content cn-dropdown-menu-content-logical cn-menu-target cn-menu-translucent isolate z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuGroup({
  render,
  "data-slot": name = "dropdown-menu-group",
  ...props
}: React.ComponentProps<typeof MenuGroupPrimitive> & Named) {
  return (
    <InGroup.Provider value={true}>
      <MenuGroupPrimitive
        render={slot(name, render)}
        {...props}
      />
    </InGroup.Provider>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  render,
  "data-slot": name = "dropdown-menu-label",
  ...props
}: React.ComponentProps<"div"> &
  Pick<React.ComponentProps<typeof MenuGroupLabelPrimitive>, "render"> & {
  inset?: boolean
} & Named) {
  const inGroup = React.useContext(InGroup)
  const shared = {
    "data-inset": inset,
    className: cn("cn-dropdown-menu-label", className),
    ...props,
  }

  if (!inGroup) {
    return <div data-slot={name} {...shared} />
  }

  return (
    <MenuGroupLabelPrimitive
      render={slot(name, render)}
      {...shared}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  render,
  onClick,
  onSelect,
  "data-slot": name = "dropdown-menu-item",
  ...props
}: React.ComponentProps<typeof MenuItemPrimitive> & {
  inset?: boolean
  variant?: "default" | "destructive"
} & Named) {
  return (
    <MenuItemPrimitive
      render={slot(name, render)}
      data-inset={inset}
      data-variant={variant}
      onSelect={selectHandler(onClick, onSelect)}
      className={cn(
        "cn-dropdown-menu-item group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof MenuSubPrimitive>) {
  return <MenuSubPrimitive {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  render,
  "data-slot": name = "dropdown-menu-sub-trigger",
  ...props
}: Plain<React.ComponentProps<typeof MenuSubTriggerPrimitive>> & {
  inset?: boolean
} & Named) {
  return (
    <MenuSubTriggerPrimitive
      render={slot(name, render, "div", (state) => ({
        "data-popup-open": flag(state.open),
      }))}
      data-inset={inset}
      className={cn(
        "cn-dropdown-menu-sub-trigger flex cursor-default items-center outline-hidden select-none data-popup-open:bg-accent data-popup-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="cn-rtl-flip ml-auto" />
    </MenuSubTriggerPrimitive>
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "cn-dropdown-menu-sub-content cn-menu-target cn-menu-translucent w-auto",
        className
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  inset,
  value,
  render,
  "data-slot": name = "dropdown-menu-checkbox-item",
  ...props
}: Plain<Omit<React.ComponentProps<typeof MenuCheckboxItemPrimitive>, "value">> & {
  value?: string
  inset?: boolean
} & Named) {
  // UI SDK 는 체크 항목을 값으로 가리킨다. shadcn 은 값 없이 쓰므로 없으면 하나 만든다.
  const fallback = React.useId()

  return (
    <MenuCheckboxItemPrimitive
      value={value ?? fallback}
      render={slot(name, render)}
      data-inset={inset}
      className={cn(
        "cn-dropdown-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span
        className="cn-dropdown-menu-item-indicator pointer-events-none"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuItemIndicatorPrimitive render={unnamed}>
          <Check />
        </MenuItemIndicatorPrimitive>
      </span>
      {children}
    </MenuCheckboxItemPrimitive>
  )
}

function DropdownMenuRadioGroup({
  render,
  "data-slot": name = "dropdown-menu-radio-group",
  ...props
}: React.ComponentProps<typeof MenuRadioGroupPrimitive> & Named) {
  return (
    <InGroup.Provider value={true}>
      <MenuRadioGroupPrimitive
        render={slot(name, render)}
        {...props}
      />
    </InGroup.Provider>
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  render,
  "data-slot": name = "dropdown-menu-radio-item",
  ...props
}: Plain<React.ComponentProps<typeof MenuRadioItemPrimitive>> & {
  inset?: boolean
} & Named) {
  return (
    <MenuRadioItemPrimitive
      render={slot(name, render)}
      data-inset={inset}
      className={cn(
        "cn-dropdown-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span
        className="cn-dropdown-menu-item-indicator pointer-events-none"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuItemIndicatorPrimitive render={unnamed}>
          <Check />
        </MenuItemIndicatorPrimitive>
      </span>
      {children}
    </MenuRadioItemPrimitive>
  )
}

function DropdownMenuSeparator({
  className,
  render,
  "data-slot": name = "dropdown-menu-separator",
  ...props
}: React.ComponentProps<typeof MenuSeparatorPrimitive> & Named) {
  return (
    <MenuSeparatorPrimitive
      render={slot(name, render, "div", () => ({
        // 3층 규칙이 Separator 와 같은 data-orientation 을 읽는다. 메뉴의 구분선은 늘 가로다.
        "data-orientation": "horizontal",
      }))}
      className={cn("cn-dropdown-menu-separator", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("cn-dropdown-menu-shortcut", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
