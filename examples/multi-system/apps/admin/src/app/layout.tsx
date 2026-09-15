import type { Metadata } from "next";
import type { ReactNode } from "react";

// tyohnn:begin fonts
// Fonts of foundation (sans inter · heading inherit · mono system · hangulFallback pretendard), self-hosted by next/font.
import { Inter } from "next/font/google";
import localFont from "next/font/local";

const fontInter = Inter({ variable: "--font-sans-inter", display: "swap", adjustFontFallback: false, subsets: ["latin"] });
const fontPretendard = localFont({
    variable: "--font-sans-pretendard", display: "swap", adjustFontFallback: false,
    src: [
        { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2", weight: "400", style: "normal" },
        { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2", weight: "500", style: "normal" },
        { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2", weight: "600", style: "normal" },
        { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2", weight: "700", style: "normal" },
    ],
});

// defaultMode light · font-sans · next/font variables.
const tyohnnHtmlClassName = ["font-sans", fontInter.variable, fontPretendard.variable].join(" ");
// tyohnn:end fonts

import "./globals.css";

export const metadata: Metadata = { title: "admin" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>)
{
    return (
        <html lang="ko" className={tyohnnHtmlClassName}>
            <body className="bg-background text-foreground antialiased">{children}</body>
        </html>
    );
}
