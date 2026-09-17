// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-05/page.tsx, ported with tooling/preset/port-block.mjs
// (imports). The page shell — provider, sidebar, inset, bordered header with trigger, separator and breadcrumb — is
// upstream's markup and classes with the store's breadcrumb labels; the body is the orders page (./orders).
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
import { Orders, ORDERS_STYLE } from "./orders"

export function BlockOrders() {
  return (
    <div data-template="block-orders">
      <style>{NO_MOTION}</style>
      <style>{ORDERS_STYLE}</style>
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
                  <BreadcrumbLink href="#">Sales</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Orders</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <Orders />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
