// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-03/page.tsx, ported with tooling/preset/port-block.mjs
// (imports). The page shell — provider, sidebar, inset, header with trigger, separator and breadcrumb — is upstream's
// markup and classes with the help center's breadcrumb labels; the body is the help center home (./help-center).
// The root div carries data-template and the template's styles; it adds no box of its own to the layout.

import { AppSidebar } from "./app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@tyohnn/components/breadcrumb"
import { Separator } from "@tyohnn/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@tyohnn/components/sidebar"

import { NoMotion } from "../../coverage/frame"
import { HELP_CENTER_STYLE, HelpCenter } from "./help-center"

export function BlockHelpCenter() {
  return (
    <div data-template="block-help-center">
      <NoMotion />
      <style>{HELP_CENTER_STYLE}</style>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Help center
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Overview</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <HelpCenter />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
