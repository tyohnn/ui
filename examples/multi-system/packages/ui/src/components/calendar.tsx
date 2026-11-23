"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Calendar as CalendarPrimitive,
  CalendarDay as CalendarDayPrimitive,
  CalendarGrid as CalendarGridPrimitive,
  CalendarHeading as CalendarHeadingPrimitive,
  CalendarMonthSelect as CalendarMonthSelectPrimitive,
  CalendarNext as CalendarNextPrimitive,
  CalendarPrevious as CalendarPreviousPrimitive,
  CalendarWeekday as CalendarWeekdayPrimitive,
  CalendarYearSelect as CalendarYearSelectPrimitive,
  type CalendarDayState,
  type CalendarGridCell,
  type CalendarSelectState,
  type CalendarValue,
  type DateMatcher,
} from "@ui-sdk/react/calendar"
import { renderElement, type RenderProp } from "@ui-sdk/react/primitive"

import { buttonVariants, type Button } from "@acme/ui/components/button"
import { CalendarChevronDown, CalendarChevronLeft, CalendarChevronRight } from "@acme/ui/icons"
import { slot } from "@acme/ui/lib/slot"
import { locale as projectLocale, strings } from "@acme/ui/strings"

/*
 * react-day-picker 판의 props 를 그대로 받아 UI SDK 의 달력으로 옮긴다. 날짜는 Date 로 주고받고(UI SDK 는 "2026-01-20"
 * 같은 ISO 문자열이다), 그리는 마크업과 클래스는 react-day-picker 판과 같다(nav · 달마다 머리와 표 · 칸 안의 날짜 단추).
 * 그 판의 components · formatters 처럼 react-day-picker 의 부품을 갈아 끼우는 자리는 없다.
 */

/** 고를 수 없는 날. react-day-picker 의 Matcher 와 같은 모양이다 */
type Matcher =
  | boolean
  | Date
  | Date[]
  | { from?: Date; to?: Date }
  | { before: Date }
  | { after: Date }
  | { dayOfWeek: number | number[] }
  | ((date: Date) => boolean)

type DateRange = { from: Date | undefined; to?: Date | undefined }

type Selection =
  | { mode?: "single"; selected?: Date; onSelect?: (date: Date | undefined) => void }
  | { mode: "multiple"; selected?: Date[]; onSelect?: (dates: Date[]) => void }
  | { mode: "range"; selected?: DateRange; onSelect?: (range: DateRange | undefined) => void }

/** react-day-picker 판의 classNames 와 같은 이름. 주면 그 자리의 기본 클래스를 바꾼다 */
type ClassNames = Partial<
  Record<
    | "root" | "months" | "month" | "nav" | "button_previous" | "button_next" | "month_caption" | "dropdowns"
    | "dropdown_root" | "dropdown" | "caption_label" | "month_grid" | "weekdays" | "weekday" | "week"
    | "week_number_header" | "week_number" | "day" | "range_start" | "range_middle" | "range_end" | "today"
    | "outside" | "disabled" | "hidden",
    string
  >
>

type CalendarProps = Omit<React.ComponentProps<"div">, "onSelect" | "defaultValue" | "children"> &
  Selection & {
    render?: RenderProp<unknown>
    classNames?: ClassNames
    buttonVariant?: React.ComponentProps<typeof Button>["variant"]
    captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
    showOutsideDays?: boolean
    showWeekNumber?: boolean
    /** 같은 칸을 다시 눌러 지우지 못하게 한다(single) */
    required?: boolean
    month?: Date
    defaultMonth?: Date
    onMonthChange?: (month: Date) => void
    today?: Date
    disabled?: Matcher | Matcher[]
    /** 고를 수 있는 첫 달과 마지막 달. 연도 셀렉트의 범위도 된다 */
    startMonth?: Date
    endMonth?: Date
    numberOfMonths?: number
    /** 앞 · 뒤 단추가 보이는 달 수만큼 넘긴다 */
    pagedNavigation?: boolean
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    fixedWeeks?: boolean
    timeZone?: string
    /** BCP 47 태그. react-day-picker 의 locale 객체를 넘기면 그 code 를 쓴다 */
    locale?: string | { code?: string }
  }

const pad = (n: number) => String(n).padStart(2, "0")
const isoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const isoMonth = (date: Date) => isoDate(date).slice(0, 7)
const fromIso = (iso: string) =>
{
  const [year, month, day = 1] = iso.split("-").map(Number)
  return new Date(year, month - 1, day)
}
const addMonths = (month: string, by: number) =>
{
  const date = fromIso(month)
  return isoMonth(new Date(date.getFullYear(), date.getMonth() + by, 1))
}

function toMatcher(matcher: Exclude<Matcher, boolean | Date[]>): DateMatcher | undefined
{
  if (matcher instanceof Date) return isoDate(matcher)
  if (typeof matcher === "function") return (date) => matcher(fromIso(date))
  if ("dayOfWeek" in matcher) return { weekday: ([] as number[]).concat(matcher.dayOfWeek) }
  if ("before" in matcher) return { before: isoDate(matcher.before) }
  if ("after" in matcher) return { after: isoDate(matcher.after) }
  if (matcher.from && matcher.to) return { from: isoDate(matcher.from), to: isoDate(matcher.to) }
  return matcher.from ? isoDate(matcher.from) : undefined
}

function toMatchers(disabled: CalendarProps["disabled"]): DateMatcher[]
{
  const list = Array.isArray(disabled) ? disabled : disabled === undefined ? [] : [disabled]
  return list.flatMap((matcher): DateMatcher[] =>
  {
    if (typeof matcher === "boolean") return []
    if (Array.isArray(matcher)) return matcher.map(isoDate)
    const converted = toMatcher(matcher)
    return converted === undefined ? [] : [converted]
  })
}

function toValue(selection: Selection): CalendarValue
{
  if (selection.mode === "multiple") return (selection.selected ?? []).map(isoDate)
  if (selection.mode === "range")
  {
    const { from, to } = selection.selected ?? { from: undefined }
    return from ? [isoDate(from), isoDate(to ?? from)] : null
  }
  return selection.selected ? isoDate(selection.selected) : null
}

function emit(selection: Selection, value: CalendarValue)
{
  if (selection.mode === "multiple") selection.onSelect?.(Array.isArray(value) ? value.map(fromIso) : [])
  else if (selection.mode === "range")
    selection.onSelect?.(Array.isArray(value) ? { from: fromIso(value[0]), to: fromIso(value[1]) } : undefined)
  else selection.onSelect?.(typeof value === "string" ? fromIso(value) : undefined)
}

/**
 * 주 번호. react-day-picker 판(date-fns 의 getWeek)처럼 1월 minimalDays 일이 든 주가 그해의 첫 주다.
 * 주의 시작 요일은 달력이 그린 첫 열이다
 */
function weekNumber(iso: string, weekStartsOn: number, minimalDays: number)
{
  const startOfWeek = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() - weekStartsOn + 7) % 7))
  const start = startOfWeek(fromIso(iso))
  const first = (year: number) => startOfWeek(new Date(year, 0, minimalDays))
  let year = start.getFullYear() + 1
  while (start < first(year)) year--
  return Math.round((start.getTime() - first(year).getTime()) / (7 * 864e5)) + 1
}

function minimalDaysOf(locale: string)
{
  const info = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { minimalDays: number }
    weekInfo?: { minimalDays: number }
  }
  return (info.getWeekInfo?.() ?? info.weekInfo)?.minimalDays ?? 1
}

/** 이름(data-slot)을 달지 않고 그린다. react-day-picker 판의 표 · 칸 · 단추에는 이름이 없었다 */
const nameless =
  (tag: string, extra?: (state: never) => Record<string, unknown>) =>
  (attrs: Record<string, unknown>, state: unknown) =>
    renderElement(tag, { ...attrs, ...extra?.(state as never), "data-slot": undefined }, undefined, state)

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  showWeekNumber,
  required,
  month,
  defaultMonth,
  onMonthChange,
  today,
  disabled,
  startMonth,
  endMonth,
  numberOfMonths = 1,
  pagedNavigation,
  weekStartsOn,
  fixedWeeks,
  timeZone,
  locale: localeProp,
  render,
  ...rest
}: CalendarProps) {
  const { mode, selected, onSelect, ...props } = rest as typeof rest & Selection
  const selection = { mode, selected, onSelect } as Selection
  const locale = (typeof localeProp === "string" ? localeProp : localeProp?.code) ?? projectLocale
  const controlled = selected !== undefined || onSelect !== undefined
  const unavailable = toMatchers(disabled)
  const cls = (key: keyof ClassNames, base: string) => classNames?.[key] ?? base

  const monthName = (iso: string, format: "long" | "short", year: boolean) =>
    new Intl.DateTimeFormat(locale, { month: format, year: year ? "numeric" : undefined }).format(fromIso(iso))

  const chevron = "cn-rtl-flip size-4 rtl:rotate-180"
  const step = cn(buttonVariants({ variant: buttonVariant }), "size-(--cell-size) p-0 select-none aria-disabled:opacity-50")

  /** 연 · 월 셀렉트. 보이는 글자는 투명한 셀렉트 아래의 이름표이고, react-day-picker 판처럼 달은 짧은 이름이다 */
  const dropdown = (kind: "month" | "year") =>
  {
    const label = (state: CalendarSelectState) =>
      kind === "month" ? monthName(`2000-${pad(state.value)}`, "short", false) : String(state.value)
    const box: RenderProp<CalendarSelectState> = (attrs, state) => (
      <span data-disabled={String(state.disabled)} className={cls("dropdown_root", "cn-calendar-dropdown-root relative rounded-(--cell-radius)")}>
        <select {...(attrs as React.ComponentProps<"select">)} data-slot={undefined} />
        <span
          className={cls("caption_label", "cn-calendar-caption-label flex items-center gap-1 rounded-(--cell-radius) font-medium text-sm select-none [&>svg]:size-3.5 [&>svg]:text-muted-foreground")}
          aria-hidden="true"
        >
          {label(state)}
          <CalendarChevronDown className="size-4" />
        </span>
      </span>
    )
    const props = {
      render: box,
      "aria-label": kind === "month" ? strings.calendar.month : strings.calendar.year,
      className: cls("dropdown", "absolute inset-0 bg-popover opacity-0"),
      children: (state: CalendarSelectState) =>
        state.options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {kind === "month" ? monthName(`2000-${pad(option.value)}`, "short", false) : option.label}
          </option>
        )),
    }
    return kind === "month" ? <CalendarMonthSelectPrimitive {...props} /> : <CalendarYearSelectPrimitive {...props} />
  }

  const caption = (first: string, offset: number) =>
  {
    const label = monthName(addMonths(first, offset), "long", true)

    if (captionLayout === "label" || offset > 0)
    {
      const text = cls("caption_label", "cn-calendar-caption font-medium text-sm select-none")
      return offset === 0
        ? <CalendarHeadingPrimitive render={nameless("span")} className={text}>{label}</CalendarHeadingPrimitive>
        : <span className={text}>{label}</span>
    }

    const plain = (text: string) => (
      <span className={cls("caption_label", "cn-calendar-caption font-medium text-sm select-none")}>{text}</span>
    )
    const current = fromIso(first)

    return (
      <div className={cls("dropdowns", "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium")}>
        {captionLayout === "dropdown-years" ? plain(monthName(first, "short", false)) : dropdown("month")}
        {captionLayout === "dropdown-months" ? plain(String(current.getFullYear())) : dropdown("year")}
        <CalendarHeadingPrimitive render={nameless("span")} className="sr-only">{label}</CalendarHeadingPrimitive>
      </div>
    )
  }

  const dayClass = (state: CalendarDayState) =>
  {
    const range = mode === "range"
    return cn(
      cls(
        "day",
        cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center outline-none select-none [&:last-child[data-selected=true]_[data-slot=button]]:rounded-r-(--cell-radius)",
          showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_[data-slot=button]]:rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_[data-slot=button]]:rounded-l-(--cell-radius)"
        )
      ),
      range && state.rangeStart && cls("range_start", "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted"),
      range && state.inRange && !state.rangeStart && !state.rangeEnd && cls("range_middle", "rounded-none"),
      range && state.rangeEnd && cls("range_end", "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted"),
      state.today && cls("today", "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none"),
      state.outside && cls("outside", "text-muted-foreground aria-selected:text-muted-foreground"),
      state.disabled && cls("disabled", "text-muted-foreground opacity-50")
    )
  }

  /** 칸(td)이 포커스와 누름을 받는다. react-day-picker 판의 속성(data-day · data-selected="true" 등)도 함께 단다 */
  const dayCell = nameless("td", (state: CalendarDayState) => ({
    "data-day": state.date,
    "data-month": state.outside ? state.date.slice(0, 7) : undefined,
    "data-selected": state.selected ? "true" : undefined,
    "data-today": state.today ? "true" : undefined,
    "data-outside": state.outside ? "true" : undefined,
    "data-disabled": state.disabled ? "true" : undefined,
  }))

  const week = (cells: CalendarGridCell[], weekdays: number[], index: number) =>
  {
    const number = weekNumber(cells[0].date, weekdays[0], minimalDaysOf(locale))
    return (
      <tr key={index} className={cls("week", "mt-2 flex w-full")}>
        {showWeekNumber && (
          <td
            role="rowheader"
            scope="row"
            aria-label={strings.calendar.week(number)}
            className={cls("week_number", "cn-calendar-week-number text-muted-foreground select-none")}
          >
            <div className="flex size-(--cell-size) items-center justify-center text-center">{pad(number)}</div>
          </td>
        )}
        {cells.map((cell) =>
          cell.hidden ? (
            <td key={cell.date} className={cn(dayClass({ outside: true } as CalendarDayState), cls("hidden", "invisible"))} />
          ) : (
            <CalendarDayPrimitive key={cell.date} value={cell.date} render={dayCell} className={dayClass}>
              {(state: CalendarDayState) => <CalendarDayButton day={state} mode={mode} locale={locale} />}
            </CalendarDayPrimitive>
          )
        )}
      </tr>
    )
  }

  return (
    <CalendarPrimitive
      render={slot("calendar", render)}
      mode={mode ?? "single"}
      {...(controlled ? { value: toValue(selection) } : {})}
      onValueChange={(value) => emit(selection, value)}
      deselectable={mode === undefined || mode === "single" ? !required : undefined}
      month={month && isoMonth(month)}
      defaultMonth={defaultMonth && isoMonth(defaultMonth)}
      onMonthChange={onMonthChange && ((value) => onMonthChange(fromIso(value)))}
      today={today && isoDate(today)}
      disabled={disabled === true}
      unavailable={unavailable.length ? unavailable : undefined}
      min={startMonth && isoDate(new Date(startMonth.getFullYear(), startMonth.getMonth(), 1))}
      max={endMonth && isoDate(new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0))}
      months={numberOfMonths}
      pageBy={pagedNavigation ? "page" : "month"}
      weekStartsOn={weekStartsOn}
      fixedWeeks={fixedWeeks}
      showOutsideDays={showOutsideDays}
      timeZone={timeZone}
      locale={locale}
      lang={locale}
      data-week-numbers={showWeekNumber ? "true" : undefined}
      className={cn(
        cls("root", "w-fit"),
        "cn-calendar group/calendar bg-background in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        className
      )}
      {...props}
    >
      {(state: { month: string }) => (
        <div className={cls("months", "relative flex flex-col gap-4 md:flex-row")}>
          <nav aria-label={strings.calendar.nav} className={cls("nav", "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1")}>
            <CalendarPreviousPrimitive render={nameless("button")} aria-label={strings.calendar.previous} className={cls("button_previous", step)}>
              <CalendarChevronLeft className={chevron} aria-hidden="true" />
            </CalendarPreviousPrimitive>
            <CalendarNextPrimitive render={nameless("button")} aria-label={strings.calendar.next} className={cls("button_next", step)}>
              <CalendarChevronRight className={chevron} aria-hidden="true" />
            </CalendarNextPrimitive>
          </nav>
          {Array.from({ length: Math.max(1, numberOfMonths) }, (_, offset) => (
            <div key={offset} className={cls("month", "flex w-full flex-col gap-4")}>
              <div className={cls("month_caption", "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)")}>
                {caption(state.month, offset)}
              </div>
              <CalendarGridPrimitive offset={offset} render={nameless("table")} className={cls("month_grid", "w-full border-collapse")}>
                {(grid: { weekdays: number[]; weeks: CalendarGridCell[][] }) => (
                  <>
                    <thead>
                      <tr className={cls("weekdays", "flex")}>
                        {showWeekNumber && (
                          <th aria-label={strings.calendar.weekNumber} scope="col" className={cls("week_number_header", "w-(--cell-size) select-none")} />
                        )}
                        {grid.weekdays.map((weekday, index) => (
                          <CalendarWeekdayPrimitive
                            key={weekday}
                            index={index}
                            render={nameless("th")}
                            className={cls("weekday", "cn-calendar-weekday flex-1 rounded-(--cell-radius) font-normal text-muted-foreground select-none")}
                          >
                            {/* react-day-picker 판처럼 두 글자(Su · Mo)로 줄인다. 한국어는 한 글자 그대로다 */}
                            {(weekdayState: { label: string }) => Array.from(weekdayState.label).slice(0, 2).join("")}
                          </CalendarWeekdayPrimitive>
                        ))}
                      </tr>
                    </thead>
                    <tbody>{grid.weeks.map((cells, index) => week(cells, grid.weekdays, index))}</tbody>
                  </>
                )}
              </CalendarGridPrimitive>
            </div>
          ))}
        </div>
      )}
    </CalendarPrimitive>
  )
}

/**
 * 칸 안에 보이는 날짜 단추. 포커스와 누름은 칸(td)이 받으므로 이 요소는 버튼이 아니라 버튼 모양의 글자 자리다.
 * 3층 규칙과 클래스는 react-day-picker 판의 단추를 그대로 읽는다(data-slot="button" · data-selected-single · data-range-*)
 */
function CalendarDayButton({
  className,
  day,
  mode,
  locale = projectLocale,
  ...props
}: React.ComponentProps<"span"> & {
  day: CalendarDayState
  mode?: "single" | "multiple" | "range"
  locale?: string
}) {
  const range = mode === "range"

  return (
    <span
      data-slot="button"
      data-day={fromIso(day.date).toLocaleDateString(locale)}
      data-selected-single={day.selected && !range ? "true" : undefined}
      data-range-start={range ? String(day.rangeStart) : undefined}
      data-range-end={range ? String(day.rangeEnd) : undefined}
      data-range-middle={range ? String(day.inRange && !day.rangeStart && !day.rangeEnd) : undefined}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "cn-calendar-day-button relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-focus-visible/day:relative group-focus-visible/day:z-10 group-focus-visible/day:border-ring group-focus-visible/day:ring-[3px] group-focus-visible/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
        // react-day-picker 판은 고를 수 없는 날의 단추를 disabled 로 꺼서 칸의 흐림 위에 한 번 더 흐려졌다
        day.disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {day.label}
    </span>
  )
}

export { Calendar, CalendarDayButton }
