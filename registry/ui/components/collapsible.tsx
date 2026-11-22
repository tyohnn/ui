"use client"

import type * as React from "react"
import {
  Collapsible as CollapsiblePrimitive,
  CollapsiblePanel,
  CollapsibleTrigger as CollapsibleTriggerPrimitive,
} from "@ui-sdk/react/collapsible"

import { flag, slot } from "@tyohnn/lib/slot"

function Collapsible({
  render,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive>) {
  return <CollapsiblePrimitive render={slot("collapsible", render)} {...props} />
}

function CollapsibleTrigger({
  render,
  ...props
}: React.ComponentProps<typeof CollapsibleTriggerPrimitive>) {
  return (
    <CollapsibleTriggerPrimitive
      render={slot("collapsible-trigger", render, "button", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-panel-open": flag(state.open),
      }))}
      {...props}
    />
  )
}

function CollapsibleContent({
  render,
  ...props
}: React.ComponentProps<typeof CollapsiblePanel>) {
  return (
    <CollapsiblePanel render={slot("collapsible-content", render)} {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
