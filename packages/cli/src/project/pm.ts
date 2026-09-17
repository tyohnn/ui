// Runs the project's package manager.

import { spawn } from "node:child_process";

import { CliError, log } from "../lib/log.js";
import type { PackageManager } from "./detect.js";

/** The dependency range that points at a workspace package */
export const workspaceRange = (pm: PackageManager): string => (pm === "npm" ? "*" : "workspace:*");

export const install = (root: string, pm: PackageManager): Promise<void> =>
    new Promise((resolve, reject) =>
    {
        log.step(`Installing dependencies with ${pm}…`);

        const child = spawn(pm, ["install"], { cwd: root, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32", env: { ...process.env, npm_config_fund: "false", npm_config_audit: "false" } });
        const output: string[] = [];
        const collect = (chunk: Buffer) => output.push(chunk.toString());

        child.stdout.on("data", collect);
        child.stderr.on("data", collect);
        child.on("error", (error) => reject(new CliError(`could not run ${pm}: ${error.message}`, `Install ${pm}, or pass --no-install and install the dependencies yourself.`)));
        child.on("close", (code) =>
        {
            if (code === 0) return resolve();

            const tail = output.join("").trimEnd().split("\n").slice(-15).join("\n");

            reject(new CliError(`${pm} install failed (exit ${code}):\n${tail}`, `Fix the error above and run \`${pm} install\`, then run the tyohnn command again.`));
        });
    });
