"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { REPOSITORY } from "@/lib/site";

import { CopyCommand } from "./copy-command";

const NAV = [
    { href: "/#systems", label: "Systems", match: (path: string) => path === "/" || path.startsWith("/systems") },
    { href: "/components", label: "Components", match: (path: string) => path.startsWith("/components") },
    { href: "/compare", label: "Compare", match: (path: string) => path.startsWith("/compare") },
    { href: "/docs", label: "Docs", match: (path: string) => path.startsWith("/docs") },
];

export const BrandMark = () => (
    <span className="brand-mark" aria-hidden>
        {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
    </span>
);

export const SiteHeader = () =>
{
    const path = usePathname();

    return (
        <header className="nav wrap">
            <Link href="/" className="brand">
                <BrandMark />
                tyohnn
            </Link>
            <nav className="nav-links" aria-label="Site">
                {NAV.map((item) => (
                    <Link key={item.label} href={item.href} className={item.match(path) && path !== "/" ? "on" : undefined} aria-current={item.match(path) && path !== "/" ? "page" : undefined}>
                        {item.label}
                    </Link>
                ))}
                <a href={REPOSITORY}>GitHub</a>
            </nav>
            <div className="nav-right">
                <CopyCommand command="npx tyohnn init" />
            </div>
        </header>
    );
};

export const SiteFooter = () => (
    <footer className="footer">
        <Link href="/">tyohnn</Link>
        <Link href="/#systems">Systems</Link>
        <Link href="/components">Components</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/docs">Docs</Link>
        <span>shadcn · Base UI · MIT</span>
    </footer>
);
