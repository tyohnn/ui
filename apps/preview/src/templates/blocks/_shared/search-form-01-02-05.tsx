// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-{01,02,05}/components/search-form.tsx, identical in those blocks.
// Ported with tooling/preset/port-block.mjs (imports, icons); `placeholder` is a prop defaulting to upstream's text. Markup and classes are upstream's.

"use client"

import { Label } from "@tyohnn/components/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@tyohnn/components/sidebar"
import { Search } from "@tyohnn/icons"

export function SearchForm({
  placeholder = "Search the docs...",
  ...props
}: React.ComponentProps<"form"> & { placeholder?: string }) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder={placeholder}
            className="pl-8"
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
