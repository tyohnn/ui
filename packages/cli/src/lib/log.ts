// Output. Messages are short; failures say what went wrong and how to fix it.

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: string) => (text: string) => (useColor ? `[${code}m${text}[0m` : text);

export const color = {
    dim: paint("2"),
    bold: paint("1"),
    red: paint("31"),
    green: paint("32"),
    yellow: paint("33"),
    cyan: paint("36"),
};

/** An expected failure: printed as `error: <message>` plus a hint, exit code 1, no stack */
export class CliError extends Error
{
    constructor(message: string, readonly hint?: string)
    {
        super(message);
    }
}

let quiet = false;

export const setQuiet = (value: boolean) =>
{
    quiet = value;
};

export const log = {
    info: (message: string) => !quiet && console.log(message),
    step: (message: string) => !quiet && console.log(`${color.cyan("›")} ${message}`),
    success: (message: string) => !quiet && console.log(`${color.green("✓")} ${message}`),
    warn: (message: string) => console.log(`${color.yellow("!")} ${message}`),
    note: (message: string) => !quiet && console.log(`  ${color.dim(message)}`),
    error: (message: string) => console.error(`${color.red("error:")} ${message}`),
};

/** Collects what a command changed so the summary stays one line per area */
export class Changes
{
    private readonly written = new Map<string, number>();
    private readonly removed = new Map<string, number>();
    readonly notes: string[] = [];
    readonly warnings: string[] = [];

    private static area(path: string): string
    {
        const parts = path.split("/");
        const deep = parts.findIndex((part) => ["components", "hooks", "lib", "icons", "systems", "styles", "tyohnn"].includes(part));

        return deep === -1 ? path : parts.slice(0, Math.min(parts.length - 1, deep + 2)).join("/");
    }

    wrote(path: string)
    {
        const area = Changes.area(path);

        this.written.set(area, (this.written.get(area) ?? 0) + 1);
    }

    removedFile(path: string)
    {
        const area = Changes.area(path);

        this.removed.set(area, (this.removed.get(area) ?? 0) + 1);
    }

    note(message: string)
    {
        if (!this.notes.includes(message)) this.notes.push(message);
    }

    warn(message: string)
    {
        if (!this.warnings.includes(message)) this.warnings.push(message);
    }

    get count(): number
    {
        return [...this.written.values(), ...this.removed.values()].reduce((sum, value) => sum + value, 0);
    }

    print()
    {
        const rows = [
            ...[...this.written].map(([area, count]) => ({ area, text: `${color.green("wrote  ")} ${String(count).padStart(3)}  ${area}` })),
            ...[...this.removed].map(([area, count]) => ({ area, text: `${color.red("removed")} ${String(count).padStart(3)}  ${area}` })),
        ].sort((a, b) => a.area.localeCompare(b.area));

        if (rows.length === 0) log.info(`  ${color.dim("no file changes")}`);
        rows.forEach((row) => log.info(`  ${row.text}`));
        this.notes.forEach((message) => log.note(message));
        this.warnings.forEach((message) => log.warn(message));
    }
}
