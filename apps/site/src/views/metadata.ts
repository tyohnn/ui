import type { Metadata } from "next";

import { getMessages, type Locale } from "@/lib/i18n";

/** The title template, default description and favicon (the nav's brand mark, public/icon.svg) every page of a language inherits */
export const siteMetadata = (locale: Locale): Metadata =>
{
    const { site } = getMessages(locale);

    return { title: { default: site.title, template: site.titleTemplate }, description: site.description, icons: { icon: "/icon.svg" } };
};

export const componentsMetadata = (locale: Locale): Metadata => getMessages(locale).meta.components;

export const compareMetadata = (locale: Locale): Metadata =>
{
    const { meta, compare } = getMessages(locale);

    return { title: meta.compare.title, description: compare.metaDescription };
};

export const docsMetadata = (locale: Locale): Metadata => getMessages(locale).meta.docs;
