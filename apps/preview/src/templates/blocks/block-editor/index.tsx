// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-10/page.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). The page shell — provider, sidebar, inset, header with trigger, separator, breadcrumb and
// NavActions — is upstream's markup and classes with the document's title; the body is the document (./document).
// The root div carries data-template and the template's styles; it adds no box of its own to the layout.

import { AppSidebar } from "./app-sidebar"
import { NavActions } from "./nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@tyohnn/components/breadcrumb"
import { Separator } from "@tyohnn/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@tyohnn/components/sidebar"

import { NO_MOTION } from "../../coverage/frame"
import { Document, DOCUMENT_STYLE } from "./document"

export function BlockEditor() {
  return (
    <div data-template="block-editor">
      <style>{NO_MOTION}</style>
      <style>{DOCUMENT_STYLE}</style>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      Checkout Redesign — Project Brief
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto px-3">
              <NavActions />
            </div>
          </header>
          <Document />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
