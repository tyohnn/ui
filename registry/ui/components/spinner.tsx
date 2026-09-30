import { cn } from "cn"

import { Loader } from "@tyohnn/icons"
import { strings } from "@tyohnn/strings"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader
      data-slot="spinner"
      role="status"
      aria-label={strings.loading}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
