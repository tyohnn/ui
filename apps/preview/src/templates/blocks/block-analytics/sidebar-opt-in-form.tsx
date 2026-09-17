// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-06/components/sidebar-opt-in-form.tsx, ported with tooling/preset/port-block.mjs
// (imports). Markup and classes are upstream's; the card's copy is the analytics digest's.

import { Button } from "@tyohnn/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tyohnn/components/card"
import { SidebarInput } from "@tyohnn/components/sidebar"

export function SidebarOptInForm() {
  return (
    <Card className="gap-2 py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Subscribe to weekly reports</CardTitle>
        <CardDescription>
          A Monday email with top pages, sources and goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <form>
          <div className="grid gap-2.5">
            <SidebarInput type="email" placeholder="Email" />
            <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none">
              Subscribe
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
