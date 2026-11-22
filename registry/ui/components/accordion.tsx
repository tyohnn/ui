import type * as React from "react"
import {
  Accordion as AccordionPrimitive,
  AccordionHeader,
  AccordionItem as AccordionItemPrimitive,
  AccordionPanel,
  AccordionTrigger as AccordionTriggerPrimitive,
} from "@ui-sdk/react/accordion"
import { cn } from "cn"

import { ChevronDown, ChevronUp } from "@tyohnn/icons"
import { flag, slot } from "@tyohnn/lib/slot"

/** Base UI 의 계약은 아코디언의 부분마다 data-orientation=vertical 을 단다. UI SDK 의 아코디언은 세로뿐이라 적지 않는다 */
const vertical = () => ({ "data-orientation": "vertical" })

function Accordion({
  className,
  render,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive>) {
  return (
    <AccordionPrimitive
      className={cn("cn-accordion flex w-full flex-col", className)}
      render={slot("accordion", render, "div", vertical)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  render,
  ...props
}: React.ComponentProps<typeof AccordionItemPrimitive>) {
  return (
    <AccordionItemPrimitive
      className={cn("cn-accordion-item", className)}
      render={slot("accordion-item", render, "div", vertical)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof AccordionTriggerPrimitive>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <AccordionHeader className="flex">
      <AccordionTriggerPrimitive
        className={cn(
          "cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className
        )}
        render={slot("accordion-trigger", render, "button", (state) => ({
          // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
          "data-panel-open": flag(state.open),
          "data-orientation": "vertical",
        }))}
        {...props}
      >
        {children}
        <ChevronDown
          data-slot="accordion-trigger-icon"
          className="cn-accordion-trigger-icon pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUp
          data-slot="accordion-trigger-icon"
          className="cn-accordion-trigger-icon pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionTriggerPrimitive>
    </AccordionHeader>
  )
}

function AccordionContent({
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof AccordionPanel>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <AccordionPanel
      className="cn-accordion-content overflow-hidden"
      render={slot("accordion-content", render, "div", vertical)}
      {...props}
    >
      <div
        className={cn(
          "cn-accordion-content-inner h-(--accordion-panel-height) data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPanel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
