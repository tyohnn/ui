import { FrostAlarm } from "@tyohnn/objects/frost-alarm";

/**
 * Every object in registry/objects, worn by the started system (`?template=objects`). An object keeps its material
 * whatever the system and takes its anchors from it (registry/objects/README.md), so comparing this page across two
 * systems shows exactly what the system decides. `?armed=1` opens the switches on.
 */
export const ObjectSheet = () =>
{
    const armed = new URLSearchParams(location.search).get("armed") === "1";

    return (
        <main className="flex min-h-screen items-center justify-center bg-background p-10">
            <FrostAlarm defaultArmed={armed} />
        </main>
    );
};
