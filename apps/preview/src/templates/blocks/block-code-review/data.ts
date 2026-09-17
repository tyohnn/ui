/** The code review's fixed data: a fictional billing service (Ledgerline) and its team. "Today" is 2026-01-14. */

export const PULL_REQUEST = {
    number: 482,
    title: "Retry failed invoice webhooks with exponential backoff",
    source: "feat/webhook-retry",
    target: "main",
    author: "Kenji Watanabe",
    commits: 4,
    opened: "Jan 13, 16:05",
};

export const REVIEWERS = [
    { initials: "RD", name: "Rosa Delgado", state: "Changes requested" },
    { initials: "AM", name: "Amara Mensah", state: "Approved" },
    { initials: "LB", name: "Lukas Brandt", state: "Pending" },
] as const;

export const CHECKS = [
    { name: "build / node 22", state: "pass", time: "1m 48s" },
    { name: "test / unit", state: "pass", time: "2m 12s" },
    { name: "test / integration", state: "pass", time: "6m 03s" },
    { name: "lint", state: "pass", time: "41s" },
    { name: "coverage ≥ 85%", state: "fail", time: "83.4%" },
    { name: "deploy preview", state: "running", time: "queued 2m" },
] as const;

export const LABELS = ["billing", "webhooks", "reliability"] as const;

export type DiffLine =
    | { kind: "hunk"; text: string }
    | { kind: "context" | "add" | "del"; old?: number; new?: number; text: string; thread?: boolean };

export const BACKOFF_DIFF: DiffLine[] = [
    { kind: "hunk", text: "@@ -1,14 +1,21 @@" },
    { kind: "context", old: 1, new: 1, text: "import { logger } from \"../../lib/logger\";" },
    { kind: "del", old: 2, text: "import { sleep } from \"../../lib/sleep\";" },
    { kind: "add", new: 2, text: "import type { RetryPolicy } from \"./policy\";" },
    { kind: "context", old: 3, new: 3, text: "" },
    { kind: "del", old: 4, text: "const RETRY_DELAY_MS = 30_000;" },
    { kind: "add", new: 4, text: "const BASE_DELAY_MS = 2_000;" },
    { kind: "add", new: 5, text: "const MAX_DELAY_MS = 15 * 60_000;" },
    { kind: "context", old: 5, new: 6, text: "" },
    { kind: "del", old: 6, text: "export async function retry(event: WebhookEvent) {" },
    { kind: "del", old: 7, text: "  await sleep(RETRY_DELAY_MS);" },
    { kind: "del", old: 8, text: "  return deliver(event);" },
    { kind: "del", old: 9, text: "}" },
    { kind: "add", new: 7, text: "export function nextDelay(attempt: number, policy: RetryPolicy): number {" },
    { kind: "add", new: 8, text: "  const exponential = BASE_DELAY_MS * 2 ** (attempt - 1);" },
    { kind: "add", new: 9, text: "  const capped = Math.min(exponential, policy.maxDelayMs ?? MAX_DELAY_MS);" },
    { kind: "add", new: 10, text: "  // Full jitter keeps retries from arriving in waves." },
    { kind: "add", new: 11, text: "  return Math.round(capped * policy.jitter(attempt));", thread: true },
    { kind: "add", new: 12, text: "}" },
    { kind: "context", old: 10, new: 13, text: "" },
    { kind: "add", new: 14, text: "export function shouldRetry(status: number, attempt: number, policy: RetryPolicy) {" },
    { kind: "add", new: 15, text: "  if (attempt >= policy.maxAttempts) return false;" },
    { kind: "add", new: 16, text: "  return status === 429 || status >= 500;" },
    { kind: "add", new: 17, text: "}" },
    { kind: "context", old: 11, new: 18, text: "" },
    { kind: "context", old: 12, new: 19, text: "export function describe(attempt: number): string {" },
    { kind: "del", old: 13, text: "  return `retry in ${RETRY_DELAY_MS / 1000}s`;" },
    { kind: "add", new: 20, text: "  return `attempt ${attempt} of ${DEFAULT_POLICY.maxAttempts}`;" },
    { kind: "context", old: 14, new: 21, text: "}" },
];

export const HANDLER_DIFF: DiffLine[] = [
    { kind: "hunk", text: "@@ -38,9 +38,16 @@ export async function handleDelivery(event: WebhookEvent)" },
    { kind: "context", old: 38, new: 38, text: "  const response = await post(endpoint.url, signed);" },
    { kind: "context", old: 39, new: 39, text: "  if (response.ok) return markDelivered(event);" },
    { kind: "del", old: 40, text: "  logger.warn(\"webhook failed\", { id: event.id });" },
    { kind: "del", old: 41, text: "  return retry(event);" },
    { kind: "add", new: 40, text: "  const attempt = event.attempt + 1;" },
    { kind: "add", new: 41, text: "  if (!shouldRetry(response.status, attempt, endpoint.policy)) {" },
    { kind: "add", new: 42, text: "    return moveToDeadLetter(event, response.status);" },
    { kind: "add", new: 43, text: "  }" },
    { kind: "add", new: 44, text: "  const delay = nextDelay(attempt, endpoint.policy);" },
    { kind: "add", new: 45, text: "  logger.warn(\"webhook failed\", { id: event.id, attempt, delay });" },
    { kind: "add", new: 46, text: "  return schedule(event, { attempt, delay });" },
    { kind: "context", old: 42, new: 47, text: "}" },
];

export const THREAD = [
    {
        initials: "RD",
        name: "Rosa Delgado",
        when: "Jan 14, 09:22",
        body: "jitter(attempt) returns 0–1, so the first retry can fire almost at once and hit the same 503. Should we floor it at half the delay (equal jitter)?",
    },
    {
        initials: "KW",
        name: "Kenji Watanabe",
        when: "Jan 14, 10:05",
        body: "Good catch. Switching to equal jitter and adding a test for attempt 1 — pushing in a minute.",
    },
] as const;
