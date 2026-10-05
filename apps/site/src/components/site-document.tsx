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
import "@/app/site.css";

import { getMessages, type Locale } from "@/lib/i18n";

import { LocaleProvider } from "./locale-provider";
import { SiteFooter, SiteHeader } from "./site-chrome";

/**
 * The document of one language. Each language is its own root layout (app/(en), app/ko), so each can declare its
 * own `lang` on the page the first byte arrives in.
 */
export const SiteDocument = ({ locale, children }: { locale: Locale; children: ReactNode }) => (
    <html lang={getMessages(locale).htmlLang}>
        <body>
            <LocaleProvider locale={locale}>
                <div className="page">
                    <SiteHeader />
                    <main className="wrap">{children}</main>
                    <div className="wrap">
                        <SiteFooter />
                    </div>
                </div>
            </LocaleProvider>
        </body>
    </html>
);
