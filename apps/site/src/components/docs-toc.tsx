"use client";

import { useEffect, useState } from "react";

/** The docs' "On this page" list, following the scroll position. */
export const DocsToc = ({ sections }: { sections: { id: string; label: string }[] }) =>
{
    const [current, setCurrent] = useState(sections[0]?.id);

    useEffect(() =>
    {
        const onScroll = () =>
        {
            const line = window.innerHeight / 3;
            let active = sections[0]?.id;

            for (const section of sections)
            {
                const node = document.getElementById(section.id);

                if (node && node.getBoundingClientRect().top <= line) active = section.id;
            }

            // At the bottom of the page the last section is current even when its top never reaches the line.
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) active = sections.at(-1)?.id ?? active;

            setCurrent(active);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, [sections]);

    return (
        <nav className="toc" aria-label="On this page">
            <div className="eyebrow">On this page</div>
            {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} aria-current={current === section.id ? "true" : undefined}>{section.label}</a>
            ))}
        </nav>
    );
};
