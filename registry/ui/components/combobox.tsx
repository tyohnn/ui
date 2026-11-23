"use client"

import * as React from "react"
import {
  Combobox as ComboboxPrimitive,
  ComboboxChip as ComboboxChipPrimitive,
  ComboboxChipRemove as ComboboxChipRemovePrimitive,
  ComboboxChips as ComboboxChipsPrimitive,
  ComboboxClear as ComboboxClearPrimitive,
  ComboboxContent as ComboboxContentPrimitive,
  ComboboxEmpty as ComboboxEmptyPrimitive,
  ComboboxGroup as ComboboxGroupPrimitive,
  ComboboxGroupLabel as ComboboxGroupLabelPrimitive,
  ComboboxInput as ComboboxInputPrimitive,
  ComboboxItem as ComboboxItemPrimitive,
  ComboboxItemIndicator as ComboboxItemIndicatorPrimitive,
  ComboboxList as ComboboxListPrimitive,
  ComboboxSeparator as ComboboxSeparatorPrimitive,
  ComboboxTrigger as ComboboxTriggerPrimitive,
  ComboboxValue as ComboboxValuePrimitive,
  type ComboboxContentState,
  type ComboboxProps,
  type ListData,
} from "@ui-sdk/react/combobox"
import { cn } from "cn"

import { Button } from "@tyohnn/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@tyohnn/components/input-group"
import { Check, ChevronDown, X } from "@tyohnn/icons"
import { flag, slot } from "@tyohnn/lib/slot"
import { claimContent, sideOf, type ContractSide } from "@tyohnn/lib/popup"
import { strings } from "@tyohnn/strings"

/** Base UI 는 items 를 값 → 이름의 객체로도 받았다. UI SDK 는 { value, label } 의 목록을 받는다 */
type ComboboxItems<T> = ListData<T> | Record<string, string>

/** 하나 · 여럿 · 실행 중에 정해짐의 세 갈래를 갈래마다 지켜 items 만 바꾼다(그냥 Omit 하면 onValueChange 가 값의 타입을 잃는다) */
type WithItems<Props, Items> = Props extends unknown ? Omit<Props, "items"> & { items?: Items } : never

const listOf = <T,>(items: ComboboxItems<T> | undefined): ListData<T> | undefined =>
  items === undefined || Array.isArray(items)
    ? items
    : (Object.entries(items).map(([value, label]) => ({ value, label })) as ListData<T>)

function Combobox<T = string, Multiple extends boolean | undefined = false>({
  items,
  children,
  ...props
}: WithItems<ComboboxProps<T, Multiple>, ComboboxItems<T>>) {
  // UI SDK 의 Combobox 는 multiple 에 따라 값의 모양이 갈린다. 받은 그대로 넘기므로 넓은 타입으로 부른다
  const Root = ComboboxPrimitive as unknown as React.ComponentType<ComboboxProps<T, Multiple>>

  return <Root {...({ ...props, items: listOf(items) } as ComboboxProps<T, Multiple>)}>
      {claimContent(children, ComboboxContent, ComboboxContentPrimitive)}
    </Root>
}

/** Base UI 처럼 children 함수는 고른 값(여럿이면 목록)을 받는다 */
function ComboboxValue({
  children,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxValuePrimitive>, "children"> & {
  children?: React.ReactNode | ((value: never) => React.ReactNode)
}) {
  return (
    <ComboboxValuePrimitive {...props}>
      {typeof children === "function"
        ? (state) => (children as (value: unknown) => React.ReactNode)(state.value)
        : children}
    </ComboboxValuePrimitive>
  )
}

function ComboboxTrigger({
  className,
  children,
  render,
  "data-slot": dataSlot = "combobox-trigger",
  ...props
}: Omit<React.ComponentProps<typeof ComboboxTriggerPrimitive>, "children"> & {
  children?: React.ReactNode
  "data-slot"?: string
}) {
  return (
    <ComboboxTriggerPrimitive
      // 입력칸 묶음 안의 단추로 그릴 때는 그 묶음이 준 이름(input-group-button)을 쓴다
      render={slot(dataSlot, render, "button", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
        "data-pressed": flag(state.open),
      }))}
      className={cn("cn-combobox-trigger", className)}
      {...props}
    >
      {children}
      <ChevronDown className="cn-combobox-trigger-icon pointer-events-none" />
    </ComboboxTriggerPrimitive>
  )
}

function ComboboxClear({ className, render, ...props }: React.ComponentProps<typeof ComboboxClearPrimitive>) {
  return (
    <ComboboxClearPrimitive
      // Base UI 처럼 Tab 은 입력칸에만 닿는다. 지우기는 누르거나 입력칸에서 글을 지운다
      tabIndex={-1}
      render={slot("combobox-clear", render ?? <InputGroupButton variant="ghost" size="icon-xs" />, "button")}
      className={cn("cn-combobox-clear", className)}
      {...props}
    >
      <X className="cn-combobox-clear-icon pointer-events-none" />
    </ComboboxClearPrimitive>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxInputPrimitive>, "children"> & {
  children?: React.ReactNode
  showTrigger?: boolean
  showClear?: boolean
}) {
  return (
    <InputGroup className={cn("cn-combobox-input w-auto", className)}>
      <ComboboxInputPrimitive
        // 입력칸 묶음의 칸(input-group-control)이다. UI SDK 가 쓰는 combobox-input 을 그 이름으로 다시 쓴다
        render={slot("input-group-control", render ?? <InputGroupInput />, "input", (state) => ({
          "data-popup-open": flag(state.open),
          "data-pressed": flag(state.open),
        }))}
        disabled={disabled}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            render={<ComboboxTrigger />}
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

/** Base UI 의 anchor 는 ref 도 받았다. UI SDK 는 요소를 받으므로 붙은 뒤의 요소로 바꿔 넘긴다 */
function useAnchorElement(anchor: React.RefObject<HTMLElement | null> | HTMLElement | null | undefined) {
  const [element, setElement] = React.useState<HTMLElement | null>(null)
  const ref = anchor && "current" in anchor ? anchor : undefined

  React.useLayoutEffect(() => {
    if (ref) setElement(ref.current)
  }, [ref])

  return ref ? element : (anchor as HTMLElement | null | undefined)
}

/**
 * Base UI 는 자리 잡이 · 팝업 두 겹이었다. UI SDK 의 내용은 한 겹이라 두 겹의 이름과 모양을 한 판에 모은다.
 */
function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxContentPrimitive>, "side" | "anchor"> & {
  side?: ContractSide
  anchor?: React.RefObject<HTMLElement | null> | HTMLElement | null
}) {
  const anchorElement = useAnchorElement(anchor)

  return (
    <ComboboxContentPrimitive
      render={slot("combobox-content", render, "div", () => ({
        "data-chips": String(!!anchor),
      }))}
      side={sideOf(side)}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      anchor={anchorElement ?? undefined}
      className={cn(
        "cn-combobox-content cn-combobox-content-logical cn-menu-target cn-menu-translucent group/combobox-content relative isolate z-50 max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) data-[chips=true]:min-w-(--anchor-width)",
        className
      )}
      {...props}
    />
  )
}

/** 목록의 항목만 펼친다(묶음과 구분선 데이터는 건너뛴다). Base UI 의 children 함수는 항목 하나씩을 받았다 */
const itemsOf = (items: ListData<unknown>) =>
  items.filter((item) => !(typeof item === "object" && item !== null && "type" in item))

function ComboboxList({
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxListPrimitive>, "children"> & {
  children?: React.ReactNode | ((item: never, index: number) => React.ReactNode)
}) {
  return (
    <ComboboxListPrimitive
      render={slot("combobox-list", render)}
      className={cn(
        "cn-combobox-list overflow-y-auto overscroll-contain",
        className
      )}
      {...props}
    >
      {typeof children === "function"
        ? (state: ComboboxContentState) =>
            itemsOf(state.items).map((item, index) =>
              (children as (item: unknown, index: number) => React.ReactNode)(item, index)
            )
        : children}
    </ComboboxListPrimitive>
  )
}

function ComboboxItem({
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxItemPrimitive>, "children"> & { children?: React.ReactNode }) {
  return (
    <ComboboxItemPrimitive
      render={slot("combobox-item", render)}
      className={cn(
        "cn-combobox-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxItemIndicatorPrimitive className="cn-combobox-item-indicator">
        <Check
          className="cn-combobox-item-indicator-icon pointer-events-none"
        />
      </ComboboxItemIndicatorPrimitive>
    </ComboboxItemPrimitive>
  )
}

function ComboboxGroup({ className, render, ...props }: React.ComponentProps<typeof ComboboxGroupPrimitive>) {
  return (
    <ComboboxGroupPrimitive
      render={slot("combobox-group", render)}
      className={cn("cn-combobox-group", className)}
      {...props}
    />
  )
}

function ComboboxLabel({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ComboboxGroupLabelPrimitive>) {
  return (
    <ComboboxGroupLabelPrimitive
      render={slot("combobox-label", render)}
      className={cn("cn-combobox-label", className)}
      {...props}
    />
  )
}

/** Base UI 의 Collection 은 묶음 안의 항목을 children 함수로 펼쳤다. UI SDK 는 항목을 그대로 둔다 */
function ComboboxCollection({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function ComboboxEmpty({ className, render, ...props }: React.ComponentProps<typeof ComboboxEmptyPrimitive>) {
  return (
    <ComboboxEmptyPrimitive
      render={slot("combobox-empty", render)}
      className={cn("cn-combobox-empty", className)}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ComboboxSeparatorPrimitive>) {
  return (
    <ComboboxSeparatorPrimitive
      render={slot("combobox-separator", render)}
      className={cn("cn-combobox-separator", className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ComboboxChipsPrimitive>) {
  return (
    <ComboboxChipsPrimitive
      render={slot("combobox-chips", render)}
      className={cn("cn-combobox-chips", className)}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  children,
  value,
  showRemove = true,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxChipPrimitive>, "value" | "children"> & {
  /** UI SDK 는 칩이 어느 값인지 받는다. 없으면 글자 children 을 값으로 쓴다(Base UI 판의 호출부) */
  value?: unknown
  children?: React.ReactNode
  showRemove?: boolean
}) {
  return (
    <ComboboxChipPrimitive
      value={value ?? children}
      render={slot("combobox-chip", render)}
      className={cn(
        "cn-combobox-chip has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxChipRemovePrimitive
          render={slot("combobox-chip-remove", <Button variant="ghost" size="icon-xs" />, "button")}
          className="cn-combobox-chip-remove"
          aria-label={strings.combobox.removeChip}
        >
          <X className="cn-combobox-chip-indicator-icon pointer-events-none" />
        </ComboboxChipRemovePrimitive>
      )}
    </ComboboxChipPrimitive>
  )
}

function ComboboxChipsInput({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ComboboxInputPrimitive>) {
  return (
    <ComboboxInputPrimitive
      render={slot("combobox-chip-input", render, "input", (state) => ({
        "data-popup-open": flag(state.open),
        "data-pressed": flag(state.open),
      }))}
      className={cn(
        "cn-combobox-chip-input min-w-16 flex-1 outline-none",
        className
      )}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
