"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { localeHref, otherLocale, splitPathname } from "@/lib/i18n";
import { REPOSITORY } from "@/lib/site";

import { CopyCommand } from "./copy-command";
import { useLocale } from "./locale-provider";

export const BrandMark = () => (
    <span className="brand-mark" aria-hidden>
        {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
    </span>
);

/**
 * The other language's version of the page being read. The other language lives under another root layout, so
 * this is a plain link (a full load), and the query and hash (a comparison, a theme) are carried over on click.
 */
const LanguageSwitch = () =>
{
    const { locale, t } = useLocale();
    const pathname = usePathname();
    const target = otherLocale(locale);
    const href = localeHref(target, splitPathname(pathname).path);

    return (
        <a
            href={href}
            lang={t.chrome.language.otherLang}
            hrefLang={t.chrome.language.otherLang}
            className="lang-switch"
            title={t.chrome.language.label}
            onClick={(event) =>
            {
                event.preventDefault();
                window.location.assign(`${href}${window.location.search}${window.location.hash}`);
            }}
        >
            {t.chrome.language.other}
        </a>
    );
};

export const SiteHeader = () =>
{
    const { t, href } = useLocale();
    const { path } = splitPathname(usePathname());
    const { nav } = t.chrome;
    const items = [
        { href: "/#systems", label: nav.systems, match: path === "/" || path.startsWith("/systems") },
        { href: "/components", label: nav.components, match: path.startsWith("/components") },
        { href: "/compare", label: nav.compare, match: path.startsWith("/compare") },
        { href: "/docs", label: nav.docs, match: path.startsWith("/docs") },
    ];

    return (
        <header className="nav wrap">
            <Link href={href("/")} className="brand">
                <BrandMark />
                tyohnn
            </Link>
            <nav className="nav-links" aria-label={t.chrome.navLabel}>
                {items.map((item) => (
                    <Link key={item.href} href={href(item.href)} className={item.match && path !== "/" ? "on" : undefined} aria-current={item.match && path !== "/" ? "page" : undefined}>
                        {item.label}
                    </Link>
                ))}
                <a href={REPOSITORY}>{nav.github}</a>
            </nav>
            <div className="nav-right">
                <LanguageSwitch />
                <CopyCommand command="npx tyohnn@latest init" />
            </div>
        </header>
    );
};

export const SiteFooter = () =>
{
    const { t, href } = useLocale();
    const { nav } = t.chrome;

    return (
        <footer className="footer">
            <Link href={href("/")}>tyohnn</Link>
            <Link href={href("/#systems")}>{nav.systems}</Link>
            <Link href={href("/components")}>{nav.components}</Link>
            <Link href={href("/compare")}>{nav.compare}</Link>
            <Link href={href("/docs")}>{nav.docs}</Link>
            <span>{t.chrome.footerNote}</span>
        </footer>
    );
};
