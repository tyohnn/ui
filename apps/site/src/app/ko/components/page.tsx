import { ComponentsPageView } from "@/views/components";
import { componentsMetadata } from "@/views/metadata";

export const metadata = componentsMetadata("ko");

export default function ComponentsPage()
{
    return <ComponentsPageView locale="ko" />;
}
