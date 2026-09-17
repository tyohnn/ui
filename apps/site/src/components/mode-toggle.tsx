"use client";

import { useEffect, useState } from "react";

import { Button } from "@tyohnn/components/button";

/** Light/dark for the site itself: `.dark` on <html>, remembered per browser. The iframes keep their own mode. */
export const ModeToggle = () =>
{
    const [dark, setDark] = useState<boolean | null>(null);

    useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);

    const toggle = () =>
    {
        const next = !document.documentElement.classList.contains("dark");

        document.documentElement.classList.toggle("dark", next);
        try
        {
            localStorage.setItem("tyohnn-site-mode", next ? "dark" : "light");
        }
        catch
        {
            // storage blocked: the choice lasts for this page only
        }
        setDark(next);
    };

    return (
        <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle site colour mode">
            {dark === null ? "Mode" : dark ? "Light" : "Dark"}
        </Button>
    );
};
