import type { Metadata } from "next";
import type { ReactNode } from "react";

// tyohnn:begin fonts
// Fonts of graphite (sans pretendard · heading inherit · mono system · hangulFallback pretendard), self-hosted by next/font.
import localFont from "next/font/local";

const fontPretendard = localFont({
    variable: "--font-sans-pretendard", display: "swap", adjustFontFallback: false,
    src: [
        { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2", weight: "400", style: "normal" },
        { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2", weight: "500", style: "normal" },
        { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2", weight: "600", style: "normal" },
        { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2", weight: "700", style: "normal" },
    ],
});

// defaultMode dark (`dark` must sit on <html>: layer-2 compositions resolve on :root) · font-sans · next/font variables.
const tyohnnHtmlClassName = ["dark", "font-sans", fontPretendard.variable].join(" ");
// tyohnn:end fonts

import "./globals.css";

export const metadata: Metadata = { title: "crm" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>)
{
    return (
        <html lang="ko" className={tyohnnHtmlClassName}>
            <body className="bg-background text-foreground antialiased">{children}</body>
        </html>
    );
}
