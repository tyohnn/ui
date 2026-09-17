// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-02/page.tsx, ported with tooling/preset/port-block.mjs
// (imports). The page shell — provider, sidebar, inset, sticky header with trigger, separator and breadcrumb — is upstream's
// markup and classes with the reference's breadcrumb labels; the body is the endpoint page (./api-reference).
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
import { API_REFERENCE_STYLE, ApiReference } from "./api-reference"

export function BlockApiReference() {
  return (
    <div data-template="block-api-reference">
      <NoMotion />
      <style>{API_REFERENCE_STYLE}</style>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Payments</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create a payment</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <ApiReference />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
