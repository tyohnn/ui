/** The playground's fixed data: fictional models, files and prompts (Halcyon Labs is not a real company). */

export const MODELS = [
    { id: "aster-3-pro", name: "Aster 3 Pro" },
    { id: "aster-3", name: "Aster 3" },
    { id: "aster-3-mini", name: "Aster 3 Mini" },
] as const;

export const PARAMETERS = [
    { id: "aip-temperature", label: "Temperature", value: 0.4, min: 0, max: 2, step: 0.1, hint: "Lower is more focused and repeatable" },
    { id: "aip-top-p", label: "Top P", value: 0.9, min: 0, max: 1, step: 0.05, hint: "Share of likely tokens considered" },
    { id: "aip-max-tokens", label: "Max output tokens", value: 2048, min: 256, max: 8192, step: 256, hint: "Hard limit per reply" },
];

export const ATTACHMENTS = [
    { name: "invoice-export.csv", size: "CSV · 24 KB" },
    { name: "events-api.yaml", size: "YAML · 9 KB" },
] as const;

export const TOOLS = ["lookup_invoice", "query_ledger", "create_ticket"] as const;

export const SYSTEM_PROMPT = "You are a senior billing engineer at Halcyon Labs. Answer in plain English, keep plans short, and show API requests as JSON.";

export const REQUEST_EXAMPLE = `{
  "type": "invoice.finalized",
  "account_id": "acct_4821",
  "invoice": {
    "id": "inv_20260114_0193",
    "total": 1840.00,
    "currency": "EUR"
  },
  "idempotency_key": "inv_20260114_0193:finalized"
}`;
