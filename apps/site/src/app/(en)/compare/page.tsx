import { ComparePageView } from "@/views/compare";
import { compareMetadata } from "@/views/metadata";

export const metadata = compareMetadata("en");

export default function ComparePage()
{
    return <ComparePageView locale="en" />;
}
