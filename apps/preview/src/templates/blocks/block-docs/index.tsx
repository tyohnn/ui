// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-01/page.tsx, ported with tooling/preset/port-block.mjs
// (imports). The page shell — provider, sidebar, inset, header with trigger, separator and breadcrumb — is upstream's
// markup and classes with the docs' breadcrumb labels; the body is the docs page (./docs-page).
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

import { NO_MOTION } from "../../coverage/frame"
import { DOCS_STYLE, DocsPage } from "./docs-page"

export function BlockDocs() {
  return (
    <div data-template="block-docs">
      <style>{NO_MOTION}</style>
      <style>{DOCS_STYLE}</style>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Getting started</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Installation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <DocsPage />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
