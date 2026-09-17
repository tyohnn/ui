import Link from "next/link";

import { BrandMark } from "@tyohnn/icons";

import { ModeToggle } from "./mode-toggle";

const NAV = [
    { href: "/", label: "Systems" },
    { href: "/compare", label: "Compare" },
    { href: "/docs", label: "Docs" },
];

export const SiteHeader = () => (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-12 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
                <BrandMark className="size-4" />
                tyohnn
            </Link>
            <nav className="flex items-center gap-1 text-sm">
                {NAV.map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="ml-auto">
                <ModeToggle />
            </div>
        </div>
    </header>
);
