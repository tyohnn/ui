import { CreatePageView } from "@/views/create";
import { createMetadata } from "@/views/metadata";

export const metadata = createMetadata("ko");

export default function CreatePage()
{
    return <CreatePageView locale="ko" />;
}
