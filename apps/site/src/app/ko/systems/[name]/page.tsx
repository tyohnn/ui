import type { Metadata } from "next";

import { SystemPageView, systemMetadata, systemParams } from "@/views/system";

export const dynamicParams = false;

export const generateStaticParams = systemParams;

type Props = { params: Promise<{ name: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => systemMetadata("ko", (await params).name);

export default async function SystemPage({ params }: Props)
{
    return <SystemPageView locale="ko" name={(await params).name} />;
}
