"use client"

import * as React from "react"
import {
  Command as CommandPrimitive,
  CommandEmpty as CommandEmptyPrimitive,
  CommandGroup as CommandGroupPrimitive,
  CommandGroupLabel as CommandGroupLabelPrimitive,
  CommandInput as CommandInputPrimitive,
  CommandItem as CommandItemPrimitive,
  CommandList as CommandListPrimitive,
  CommandSeparator as CommandSeparatorPrimitive,
  type SearchFilter,
} from "@ui-sdk/react/command"
import { cn } from "cn"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@tyohnn/components/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@tyohnn/components/input-group"
import { Check, Search } from "@tyohnn/icons"
import { flag, slot } from "@tyohnn/lib/slot"
import { strings } from "@tyohnn/strings"

/**
 * cmdk 의 filter 는 (항목의 값, 검색어, 키워드) 를 받아 점수를 돌려준다. UI SDK 는 항목 하나와 검색어를 받는다.
 * 함수는 cmdk 의 모양으로 받고, 이름("fuzzy" 등)과 false 는 UI SDK 에 그대로 넘긴다
 */
type CommandFilter =
  | Exclude<SearchFilter<string>, (...args: never[]) => unknown>
  | ((value: string, search: string, keywords?: string[]) => number | boolean)

const filterOf = (filter: CommandFilter | undefined, shouldFilter: boolean): SearchFilter<string> | undefined =>
  !shouldFilter
    ? false
    : typeof filter === "function"
      // cmdk 는 검색어가 비어 있으면 거르지 않는다. 빈 검색어에 0 을 돌려주는 filter 도 목록을 다 보여 준다
      ? (item, query) => query === "" || filter(item.label || item.value, query, item.keywords)
      : filter

function Command({
  className,
  filter,
  shouldFilter = true,
  loop = false,
  render,
  ...props
}: Omit<React.ComponentProps<typeof CommandPrimitive>, "filter"> & {
  filter?: CommandFilter
  /** false 면 거르지 않는다. 서버가 이미 거른 결과를 보여 줄 때다(cmdk 의 이름) */
  shouldFilter?: boolean
}) {
  return (
    <CommandPrimitive
      render={slot("command", render)}
      filter={filterOf(filter, shouldFilter)}
      // cmdk 는 끝에서 처음으로 돌아가지 않았다. UI SDK 의 기본은 돌아간다
      loop={loop}
      className={cn(
        "cn-command flex size-full flex-col overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = strings.command.title,
  description,
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  children: React.ReactNode
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <DialogContent
        className={cn(
          "cn-command-dialog top-1/3 translate-y-0 overflow-hidden p-0",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  render,
  ...props
}: React.ComponentProps<typeof CommandInputPrimitive>) {
  return (
    <div data-slot="command-input-wrapper" className="cn-command-input-wrapper">
      <InputGroup className="cn-command-input-group">
        <CommandInputPrimitive
          render={slot("command-input", render, "input")}
          // UI SDK 는 검색 칸에 이름을 요구한다. 호출부가 주지 않으면 기본 이름을 단다
          aria-label={strings.command.search}
          className={cn(
            "cn-command-input outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <Search className="cn-command-input-icon" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({
  className,
  render,
  ...props
}: React.ComponentProps<typeof CommandListPrimitive>) {
  return (
    <CommandListPrimitive
      render={slot("command-list", render)}
      className={cn(
        "cn-command-list overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

/** cmdk 처럼 맞는 항목이 있는 동안에는 요소째 그리지 않는다. UI SDK 는 내용만 비우고 여백이 있는 상자를 남긴다 */
function CommandEmpty({
  className,
  render,
  ...props
}: React.ComponentProps<typeof CommandEmptyPrimitive>) {
  const box = slot("command-empty", render)

  return (
    <CommandEmptyPrimitive
      // 그리지 않을 때 null 을 돌려준다. React 는 받아 주지만 render 의 타입은 요소만 적어 두었다
      render={((attrs, state) => (state.empty ? box(attrs, state) : null)) as typeof box}
      className={cn("cn-command-empty", className)}
      {...props}
    />
  )
}

/** cmdk 처럼 heading 을 받으면 그룹의 이름표(CommandGroupLabel)를 앞에 그린다 */
function CommandGroup({
  className,
  heading,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof CommandGroupPrimitive>, "children"> & {
  heading?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <CommandGroupPrimitive
      render={slot("command-group", render)}
      className={cn("cn-command-group", className)}
      {...props}
    >
      {heading != null && (
        <CommandGroupLabelPrimitive
          render={slot("command-group-heading")}
          className="cn-command-group-heading"
        >
          {heading}
        </CommandGroupLabelPrimitive>
      )}
      {children}
    </CommandGroupPrimitive>
  )
}

function CommandSeparator({
  className,
  render,
  ...props
}: React.ComponentProps<typeof CommandSeparatorPrimitive>) {
  return (
    <CommandSeparatorPrimitive
      render={slot("command-separator", render)}
      className={cn("cn-command-separator", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  value,
  label,
  onSelect,
  render,
  ...props
}: Omit<React.ComponentProps<typeof CommandItemPrimitive>, "children" | "onSelect"> & {
  children?: React.ReactNode
  /** cmdk 처럼 항목의 값을 받는다. 값이 없으면 label, 그것도 없으면 항목의 글자다 */
  onSelect?: (value: string) => void
}) {
  return (
    <CommandItemPrimitive
      render={slot("command-item", render, "div", (state) => ({
        // 3층 규칙은 cmdk 의 이름(data-selected)으로 강조를 읽는다. UI SDK 는 같은 상태를 highlighted 라 부른다
        "data-selected": flag(state.highlighted),
      }))}
      value={value}
      label={label}
      onSelect={
        onSelect &&
        ((event: Event) =>
          onSelect(
            value ??
              label ??
              (event.currentTarget instanceof HTMLElement ? event.currentTarget.textContent ?? "" : "")
          ))
      }
      className={cn(
        "cn-command-item group/command-item data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <Check
        className="cn-command-item-indicator ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
      />
    </CommandItemPrimitive>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("cn-command-shortcut", className)}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
