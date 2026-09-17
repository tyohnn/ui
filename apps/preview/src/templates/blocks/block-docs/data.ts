/** The docs page's fixed data: Fernway, a fictional durable-workflow SDK, and its installation guide. */

export const INSTALL_COMMANDS = [
    { id: "npm", label: "npm", command: "npm install @fernway/sdk@2.4.0" },
    { id: "pnpm", label: "pnpm", command: "pnpm add @fernway/sdk@2.4.0" },
    { id: "yarn", label: "yarn", command: "yarn add @fernway/sdk@2.4.0" },
] as const;

export const CONFIG_EXAMPLE = `import { defineConfig } from "@fernway/sdk/config";

export default defineConfig({
  project: "billing-jobs",
  region: "eu-central",
  workflowsDir: "./src/workflows",
  retries: { maxAttempts: 5, backoff: "exponential" },
});`;

export const ENV_EXAMPLE = `FERNWAY_PROJECT_KEY=fw_live_7Hq2kR9vXe
FERNWAY_SIGNING_SECRET=whsec_4mNcA81pZt
FERNWAY_DATABASE_URL=postgres://jobs@db.internal:5432/fernway`;

export const DOCTOR_EXAMPLE = `$ npx fernway doctor
✓ Config        fernway.config.ts (billing-jobs · eu-central)
✓ Credentials   project key valid, signing secret set
✓ Database      PostgreSQL 16.2 · 14 migrations applied
✓ Workflows     3 found in ./src/workflows
Ready in 412 ms`;

export const STEPS = [
    {
        title: "Create a config file",
        body: "Run the init command in your project root. It writes fernway.config.ts and adds a workflows folder next to your source.",
        code: "npx fernway init --project billing-jobs",
    },
    {
        title: "Add your credentials",
        body: "Copy the project key from Settings → API keys and put it in your environment. The SDK reads it at start-up.",
        code: null,
    },
    {
        title: "Run the local worker",
        body: "The dev worker watches the workflows folder, applies database migrations and reloads when a file changes.",
        code: "npx fernway dev --port 7420",
    },
    {
        title: "Trigger a test run",
        body: "Open the local dashboard at localhost:7420 and start the hello-world workflow, or call it from your code.",
        code: null,
    },
] as const;

export const OPTIONS = [
    { name: "project", type: "string", fallback: "—", required: true, description: "Project slug from the dashboard. Runs are grouped under it." },
    { name: "region", type: "\"eu-central\" | \"us-east\"", fallback: "\"us-east\"", required: false, description: "Where run history and payloads are stored." },
    { name: "workflowsDir", type: "string", fallback: "\"./workflows\"", required: false, description: "Folder scanned for exported workflow definitions." },
    { name: "retries.maxAttempts", type: "number", fallback: "3", required: false, description: "Attempts per step before the run is marked failed." },
    { name: "retries.backoff", type: "\"fixed\" | \"exponential\"", fallback: "\"fixed\"", required: false, description: "Delay strategy between attempts." },
    { name: "concurrency", type: "number", fallback: "10", required: false, description: "Steps a single worker executes at the same time." },
] as const;

export const TOC = [
    { id: "install", label: "Install the SDK", active: true },
    { id: "setup", label: "Set up your project", active: false },
    { id: "options", label: "Configuration options", active: false },
    { id: "env", label: "Environment variables", active: false, nested: true },
    { id: "verify", label: "Verify the installation", active: false },
    { id: "next", label: "Next steps", active: false },
];
