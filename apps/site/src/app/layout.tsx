import type { Metadata } from "next";
import type { ReactNode } from "react";

// Self-hosted fonts (src/lib/site-fonts.ts): the site's own, then the faces system names are set in.
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/figtree";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/noto-sans";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/source-serif-4";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./site.css";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = {
    title: { default: "tyohnn — same screen, every system", template: "%s · tyohnn" },
    description: "One set of shadcn components on Base UI, restyled by three CSS layers. Browse every design system live and install one with npx tyohnn init.",
};

export default function RootLayout({ children }: { children: ReactNode })
{
    return (
        <html lang="en">
            <body>
                <div className="page">
                    <SiteHeader />
                    <main className="wrap">{children}</main>
                    <div className="wrap">
                        <SiteFooter />
                    </div>
                </div>
            </body>
        </html>
    );
}
