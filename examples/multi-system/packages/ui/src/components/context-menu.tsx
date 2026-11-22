"use client"

import * as React from "react"
import {
  Menu as MenuPrimitive,
  MenuCheckboxItem as MenuCheckboxItemPrimitive,
  MenuContent as MenuContentPrimitive,
  MenuContextTrigger as MenuContextTriggerPrimitive,
  MenuGroup as MenuGroupPrimitive,
  MenuGroupLabel as MenuGroupLabelPrimitive,
  MenuItem as MenuItemPrimitive,
  MenuItemIndicator as MenuItemIndicatorPrimitive,
  MenuRadioGroup as MenuRadioGroupPrimitive,
  MenuRadioItem as MenuRadioItemPrimitive,
  MenuSeparator as MenuSeparatorPrimitive,
  MenuSub as MenuSubPrimitive,
  MenuSubTrigger as MenuSubTriggerPrimitive,
} from "@ui-sdk/react/menu"
import { renderElement } from "@ui-sdk/react/primitive"
import { cn } from "cn"

import { Check, ChevronRight } from "@acme/ui/icons"
import { sideOf, type ContractSide } from "@acme/ui/lib/popup"
import { flag, slot } from "@acme/ui/lib/slot"

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

function ContextMenu({ ...props }: React.ComponentProps<typeof MenuPrimitive>) {
  return <MenuPrimitive {...props} />
}

/** UI SDK 의 메뉴 내용은 스스로 포털로 나간다. shadcn 의 계약을 지키려고 이름만 남긴다 */
function ContextMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function ContextMenuTrigger({
  className,
  render,
  "data-slot": name = "context-menu-trigger",
  ...props
}: React.ComponentProps<typeof MenuContextTriggerPrimitive> & Named) {
  return (
    <MenuContextTriggerPrimitive
      render={slot(name, render, "div", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
        // Base UI 는 메뉴가 열린 동안 영역을 눌린 것으로 두었다.
        "data-pressed": flag(state.open),
      }))}
      className={cn("cn-context-menu-trigger select-none", className)}
      {...props}
    />
  )
}

function ContextMenuContent({
  align = "start",
  alignOffset = 4,
  side = "right",
  sideOffset = 0,
  className,
  render,
  "data-slot": name = "context-menu-content",
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
        "cn-context-menu-content cn-context-menu-content-logical cn-menu-target cn-menu-translucent isolate z-50 max-h-(--available-height) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuGroup({
  render,
  "data-slot": name = "context-menu-group",
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

function ContextMenuLabel({
  className,
  inset,
  render,
  "data-slot": name = "context-menu-label",
  ...props
}: React.ComponentProps<"div"> &
  Pick<React.ComponentProps<typeof MenuGroupLabelPrimitive>, "render"> & {
  inset?: boolean
} & Named) {
  const inGroup = React.useContext(InGroup)
  const shared = {
    "data-inset": inset,
    className: cn("cn-context-menu-label", className),
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

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  render,
  onClick,
  onSelect,
  "data-slot": name = "context-menu-item",
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
        "cn-context-menu-item group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof MenuSubPrimitive>) {
  return <MenuSubPrimitive {...props} />
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  render,
  "data-slot": name = "context-menu-sub-trigger",
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
        "cn-context-menu-sub-trigger flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="cn-rtl-flip ml-auto" />
    </MenuSubTriggerPrimitive>
  )
}

function ContextMenuSubContent({
  ...props
}: React.ComponentProps<typeof ContextMenuContent>) {
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      className="cn-context-menu-sub-content cn-menu-target cn-menu-translucent"
      side="right"
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  inset,
  value,
  render,
  "data-slot": name = "context-menu-checkbox-item",
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
        "cn-context-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span className="cn-context-menu-item-indicator pointer-events-none">
        <MenuItemIndicatorPrimitive render={unnamed}>
          <Check />
        </MenuItemIndicatorPrimitive>
      </span>
      {children}
    </MenuCheckboxItemPrimitive>
  )
}

function ContextMenuRadioGroup({
  render,
  "data-slot": name = "context-menu-radio-group",
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

function ContextMenuRadioItem({
  className,
  children,
  inset,
  render,
  "data-slot": name = "context-menu-radio-item",
  ...props
}: Plain<React.ComponentProps<typeof MenuRadioItemPrimitive>> & {
  inset?: boolean
} & Named) {
  return (
    <MenuRadioItemPrimitive
      render={slot(name, render)}
      data-inset={inset}
      className={cn(
        "cn-context-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span className="cn-context-menu-item-indicator pointer-events-none">
        <MenuItemIndicatorPrimitive render={unnamed}>
          <Check />
        </MenuItemIndicatorPrimitive>
      </span>
      {children}
    </MenuRadioItemPrimitive>
  )
}

function ContextMenuSeparator({
  className,
  render,
  "data-slot": name = "context-menu-separator",
  ...props
}: React.ComponentProps<typeof MenuSeparatorPrimitive> & Named) {
  return (
    <MenuSeparatorPrimitive
      render={slot(name, render, "div", () => ({
        // 3층 규칙이 Separator 와 같은 data-orientation 을 읽는다. 메뉴의 구분선은 늘 가로다.
        "data-orientation": "horizontal",
      }))}
      className={cn("cn-context-menu-separator", className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn("cn-context-menu-shortcut", className)}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
