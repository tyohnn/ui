import { DocsView } from "@/views/docs";
import { docsMetadata } from "@/views/metadata";

export const metadata = docsMetadata("en");

export default function DocsPage()
{
    return <DocsView locale="en" />;
}
