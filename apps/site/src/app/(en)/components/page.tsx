import { ComponentsPageView } from "@/views/components";
import { componentsMetadata } from "@/views/metadata";

export const metadata = componentsMetadata("en");

export default function ComponentsPage()
{
    return <ComponentsPageView locale="en" />;
}
