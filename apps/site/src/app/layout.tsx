import type { Metadata } from "next";
import type { ReactNode } from "react";

// mira's sans, self-hosted (the layer-1 stack names "Inter" and "Inter Variable").
import "@fontsource-variable/inter";
import "./globals.css";

import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
    title: { default: "tyohnn — shadcn + Base UI + three CSS layers", template: "%s · tyohnn" },
    description: "One set of shadcn components on Base UI, nine design systems that change density, shape and depth — not only colour. Browse them live and install one with npx tyohnn init.",
};

// Before paint: the stored mode, else the OS preference. `dark` goes on <html> (DESIGN.md §7).
const MODE_SCRIPT = `try{var m=localStorage.getItem("tyohnn-site-mode");if(!m)m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.classList.toggle("dark",m==="dark")}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode })
{
    return (
        <html lang="en" className="font-sans" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
            </head>
            <body className="min-h-dvh bg-background text-foreground antialiased">
                <SiteHeader />
                <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 sm:px-6">{children}</main>
            </body>
        </html>
    );
}
