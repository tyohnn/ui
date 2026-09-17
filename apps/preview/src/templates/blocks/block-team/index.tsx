// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-16/page.tsx, ported with tooling/preset/port-block.mjs
// (imports). The page shell — the --header-height wrapper, provider as a column, sticky site header, sidebar below it
// and inset — is upstream's markup and classes; the body is the team page (./team). Upstream's wrapper div carries
// data-template and the template's styles here, so the root adds no box of its own to the layout.

import { AppSidebar } from "./app-sidebar"
import { SiteHeader } from "./site-header"
import { SidebarInset, SidebarProvider } from "@tyohnn/components/sidebar"

import { NO_MOTION } from "../../coverage/frame"
import { Team, TEAM_STYLE } from "./team"

export function BlockTeam() {
  return (
    <div data-template="block-team" className="[--header-height:calc(--spacing(14))]">
      <style>{NO_MOTION}</style>
      <style>{TEAM_STYLE}</style>
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <Team />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
