import { getSystems } from "@/lib/registry";

export default function Home()
{
    const systems = getSystems();

    return <p className="py-10 text-sm">{systems.length} systems</p>;
}
