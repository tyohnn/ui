import { cn } from "cn"

import { Loader } from "@tyohnn/icons"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader
  data-slot="spinner"
  role="status"
  aria-label="Loading"
  className={cn("size-4 animate-spin", className)}
/>
  )
}

export { Spinner }
