"use client"

import * as React from "react"
import {
  Select as SelectPrimitive,
  SelectContent as SelectContentPrimitive,
  SelectGroup as SelectGroupPrimitive,
  SelectGroupLabel as SelectGroupLabelPrimitive,
  SelectItem as SelectItemPrimitive,
  SelectItemIndicator as SelectItemIndicatorPrimitive,
  SelectItemText as SelectItemTextPrimitive,
  SelectSeparator as SelectSeparatorPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
  type ListData,
  type SelectProps as SelectPrimitiveProps,
} from "@ui-sdk/react/select"
import { cn } from "cn"

import { Check, SelectIndicator } from "@tyohnn/icons"
import { flag, slot } from "@tyohnn/lib/slot"
import { claimContent, sideOf, type ContractSide } from "@tyohnn/lib/popup"

/** Base UI 는 items 를 값 → 이름의 객체로도 받았다. UI SDK 는 { value, label } 의 목록을 받는다 */
type SelectItems<T> = ListData<T> | Record<string, string>

/** 하나 · 여럿 · 실행 중에 정해짐의 세 갈래를 갈래마다 지켜 items 만 바꾼다(그냥 Omit 하면 onValueChange 가 값의 타입을 잃는다) */
type WithItems<Props, Items> = Props extends unknown ? Omit<Props, "items"> & { items?: Items } : never

const listOf = <T,>(items: SelectItems<T> | undefined): ListData<T> | undefined =>
  items === undefined || Array.isArray(items)
    ? items
    : (Object.entries(items).map(([value, label]) => ({ value, label })) as ListData<T>)

function Select<T = string, Multiple extends boolean | undefined = false>({
  items,
  children,
  ...props
}: WithItems<SelectPrimitiveProps<T, Multiple>, SelectItems<T>>) {
  // UI SDK 의 Select 는 multiple 에 따라 값의 모양이 갈린다. 받은 그대로 넘기므로 넓은 타입으로 부른다
  const Root = SelectPrimitive as unknown as React.ComponentType<SelectPrimitiveProps<T, Multiple>>

  return <Root {...({ ...props, items: listOf(items) } as SelectPrimitiveProps<T, Multiple>)}>
      {claimContent(children, SelectContent, SelectContentPrimitive)}
    </Root>
}

function SelectGroup({ className, render, ...props }: React.ComponentProps<typeof SelectGroupPrimitive>) {
  return (
    <SelectGroupPrimitive
      render={slot("select-group", render)}
      className={cn("cn-select-group", className)}
      {...props}
    />
  )
}

function SelectValue({ className, render, ...props }: React.ComponentProps<typeof SelectValuePrimitive>) {
  return (
    <SelectValuePrimitive
      render={slot("select-value", render, "span")}
      className={cn("cn-select-value", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof SelectTriggerPrimitive>, "children"> & {
  size?: "sm" | "default"
  children?: React.ReactNode
}) {
  return (
    <SelectTriggerPrimitive
      render={slot("select-trigger", render, "button", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
        "data-pressed": flag(state.open),
      }))}
      data-size={size}
      className={cn(
        "cn-select-trigger flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <SelectIndicator
        className="cn-select-trigger-icon pointer-events-none"
        aria-hidden="true"
      />
    </SelectTriggerPrimitive>
  )
}

/**
 * Base UI 는 자리 잡이 · 팝업 · 목록 세 겹이었다. UI SDK 의 내용은 한 겹이고 스스로 목록(listbox)이다.
 * 위아래 스크롤 화살표는 UI SDK 에 없다. 목록은 그대로 스크롤한다.
 */
function SelectContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  render,
  ...props
}: Omit<React.ComponentProps<typeof SelectContentPrimitive>, "side"> & {
  side?: ContractSide
}) {
  return (
    <SelectContentPrimitive
      render={slot("select-content", render, "div", () => ({
        "data-align-trigger": String(alignItemWithTrigger),
      }))}
      side={sideOf(side)}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      alignItemWithTrigger={alignItemWithTrigger}
      className={cn(
        "cn-select-content cn-select-content-logical cn-menu-target cn-menu-translucent relative isolate z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto data-[align-trigger=true]:animate-none",
        className
      )}
      {...props}
    />
  )
}

function SelectLabel({
  className,
  render,
  ...props
}: React.ComponentProps<typeof SelectGroupLabelPrimitive>) {
  return (
    <SelectGroupLabelPrimitive
      render={slot("select-label", render)}
      className={cn("cn-select-label", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof SelectItemPrimitive>, "children"> & { children?: React.ReactNode }) {
  return (
    <SelectItemPrimitive
      render={slot("select-item", render)}
      className={cn(
        "cn-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <SelectItemTextPrimitive className="cn-select-item-text shrink-0 whitespace-nowrap">
        {children}
      </SelectItemTextPrimitive>
      <SelectItemIndicatorPrimitive className="cn-select-item-indicator">
        <Check className="cn-select-item-indicator-icon pointer-events-none" />
      </SelectItemIndicatorPrimitive>
    </SelectItemPrimitive>
  )
}

function SelectSeparator({
  className,
  render,
  ...props
}: React.ComponentProps<typeof SelectSeparatorPrimitive>) {
  return (
    <SelectSeparatorPrimitive
      render={slot("select-separator", render)}
      className={cn("cn-select-separator pointer-events-none", className)}
      {...props}
    />
  )
}

/** UI SDK 의 목록에는 스크롤 화살표가 없다. Base UI 판의 조합이 그대로 컴파일되도록 이름만 남기고 그리지 않는다 */
function SelectScrollUpButton(_props: React.ComponentProps<"div">) {
  return null
}

function SelectScrollDownButton(_props: React.ComponentProps<"div">) {
  return null
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
