"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";

import { isTemplate, previewUrl, type Mode, type SystemInfo, type TemplateId } from "@/lib/site";

import { Segmented, TemplateSelect } from "./pickers";
import { ScaledFrame } from "./scaled-frame";

const NONE = "none";
const SLOTS = ["a", "b", "c"] as const;

const MODES = [
    { value: "default", label: "Default" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
] as const;

/** Two or three systems side by side on one template. The choice lives in the URL, so a comparison can be linked. */
export const CompareView = ({ systems }: { systems: SystemInfo[] }) =>
{
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const names = systems.map((system) => system.name);
    const pick = (key: string, fallback: string) =>
    {
        const value = params.get(key);

        return value && (names.includes(value) || (key === "c" && value === NONE)) ? value : fallback;
    };

    const chosen = { a: pick("a", names.includes("mira") ? "mira" : names[0]), b: pick("b", names.includes("vega") ? "vega" : names[1]), c: pick("c", NONE) };
    const template: TemplateId = isTemplate(params.get("template")) ? (params.get("template") as TemplateId) : "crm-dashboard";
    const modeParam = params.get("mode");
    const mode = modeParam === "light" || modeParam === "dark" ? modeParam : "default";

    const update = (key: string, value: string) =>
    {
        const next = new URLSearchParams(params.toString());

        next.set(key, value);
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    };

    const columns = SLOTS.map((slot) => chosen[slot]).filter((name) => name !== NONE).map((name) => systems.find((system) => system.name === name)!);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3" data-compare-controls="">
                {SLOTS.map((slot) => (
                    <label key={slot} className="flex flex-col gap-1 text-xs text-muted-foreground">
                        System {slot.toUpperCase()}
                        <Select
                            items={[...(slot === "c" ? [{ value: NONE, label: "None" }] : []), ...names.map((name) => ({ value: name, label: name }))]}
                            value={chosen[slot]}
                            onValueChange={(value) => value && update(slot, value as string)}
                        >
                            <SelectTrigger size="sm" aria-label={`System ${slot.toUpperCase()}`} data-slot-key={slot} className="min-w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {slot === "c" && <SelectItem value={NONE}>None</SelectItem>}
                                {names.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </label>
                ))}
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                    Template
                    <TemplateSelect value={template} onChange={(value) => update("template", value)} />
                </label>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    Mode
                    <Segmented label="Mode" value={mode} options={MODES} onChange={(value) => update("mode", value)} />
                </div>
            </div>

            <div className={columns.length === 3 ? "grid gap-4 lg:grid-cols-3" : "grid gap-4 md:grid-cols-2"} data-compare="">
                {columns.map((system, index) =>
                {
                    const shown: Mode = mode === "default" ? system.defaultMode : mode;

                    return (
                        <section key={`${index}-${system.name}`} data-column={system.name} className="flex min-w-0 flex-col gap-2">
                            <div className="flex items-baseline justify-between gap-2">
                                <Link href={`/systems/${system.name}`} className="text-sm font-semibold hover:underline">{system.name}</Link>
                                <span className="truncate text-xs text-muted-foreground">{system.mood}</span>
                            </div>
                            <ScaledFrame
                                src={previewUrl(system.name, template, shown)}
                                title={`${system.name} · ${template} · ${shown}`}
                                width={1200}
                                height={1500}
                                interactive
                                className="rounded-lg border"
                            />
                        </section>
                    );
                })}
            </div>
        </div>
    );
};
