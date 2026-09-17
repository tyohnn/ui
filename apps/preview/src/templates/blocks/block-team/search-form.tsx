// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-16/components/search-form.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; the placeholder is the team admin's.

"use client"

import { Label } from "@tyohnn/components/label"
import { SidebarInput } from "@tyohnn/components/sidebar"
import { Search } from "@tyohnn/icons"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Search people..."
          className="h-8 pl-7"
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  )
}
