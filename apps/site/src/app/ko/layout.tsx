import type { ReactNode } from "react";

import { SiteDocument } from "@/components/site-document";
import { siteMetadata } from "@/views/metadata";

export const metadata = siteMetadata("ko");

export default function RootLayout({ children }: { children: ReactNode })
{
    return <SiteDocument locale="ko">{children}</SiteDocument>;
}
