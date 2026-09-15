// Type-level completeness: every library exports every semantic name as an icon component.
// (tooling/validate-system checks the same set by name.)
import type * as hugeicons from "./libraries/hugeicons";
import type * as lucide from "./libraries/lucide";
import type * as phosphor from "./libraries/phosphor";
import type * as radix from "./libraries/radix";
import type * as remixicon from "./libraries/remixicon";
import type * as tabler from "./libraries/tabler";
import type { IconComponent, IconName } from "./names";

type Complete<Library extends Record<IconName, IconComponent>> = Library;

export type IconLibraries = {
    hugeicons: Complete<typeof hugeicons>;
    lucide: Complete<typeof lucide>;
    phosphor: Complete<typeof phosphor>;
    radix: Complete<typeof radix>;
    remixicon: Complete<typeof remixicon>;
    tabler: Complete<typeof tabler>;
};
