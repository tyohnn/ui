/** The API reference's fixed data: Ledgerline, a fictional payments API, and its "Create a payment" endpoint. */

export const ENDPOINT = { method: "POST", path: "/v1/accounts/{account_id}/payments", host: "https://api.ledgerline.dev" } as const;

export interface Parameter
{
    name: string;
    type: string;
    required: boolean;
    description: string;
    values?: string;
}

export const PATH_PARAMETERS: Parameter[] = [
    { name: "account_id", type: "string", required: true, description: "The connected account that receives the funds. Starts with acct_." },
];

export const QUERY_PARAMETERS: Parameter[] = [
    { name: "expand[]", type: "string[]", required: false, description: "Related objects to include in the response.", values: "customer · payment_method" },
    { name: "dry_run", type: "boolean", required: false, description: "Validate the request and return the fees without moving money." },
];

export const BODY_PARAMETERS: Parameter[] = [
    { name: "amount", type: "integer", required: true, description: "Amount in the smallest currency unit, for example 1840 for €18.40." },
    { name: "currency", type: "string", required: true, description: "Three-letter ISO currency code, lowercase.", values: "eur · usd · gbp · sek" },
    { name: "customer", type: "string", required: false, description: "ID of the customer this payment belongs to." },
    { name: "payment_method", type: "string", required: true, description: "ID of a saved payment method, or a one-time token from the client SDK." },
    { name: "capture", type: "enum", required: false, description: "Capture immediately, or authorise now and capture within 7 days.", values: "automatic · manual" },
    { name: "metadata", type: "object", required: false, description: "Up to 20 key-value pairs stored on the payment and sent with its events." },
];

export const HEADERS: Parameter[] = [
    { name: "Idempotency-Key", type: "string", required: false, description: "Retrying with the same key returns the first result instead of charging twice. Kept for 24 hours." },
    { name: "Ledgerline-Version", type: "string", required: false, description: "Pins the request to an API version. Defaults to your account's version, 2026-01-01." },
];

export const REQUEST_EXAMPLES = [
    {
        id: "curl",
        label: "cURL",
        code: `curl -X POST \\
  $LEDGERLINE_API/v1/accounts/acct_4821/payments \\
  -u sk_test_51Hx9w2Q: \\
  -H "Idempotency-Key: 7b0c8e7a-inv-0193" \\
  -d amount=1840 \\
  -d currency=eur \\
  -d customer=cus_R2d7Lq \\
  -d payment_method=pm_card_debit_4242 \\
  -d capture=automatic`,
    },
    {
        id: "js",
        label: "JavaScript",
        code: `import Ledgerline from "@ledgerline/node";

const ledgerline = new Ledgerline("sk_test_51Hx9w2Q");

const payment = await ledgerline.payments.create(
  "acct_4821",
  {
    amount: 1840,
    currency: "eur",
    customer: "cus_R2d7Lq",
    payment_method: "pm_card_debit_4242",
  },
  { idempotencyKey: "7b0c8e7a-inv-0193" },
);`,
    },
    {
        id: "python",
        label: "Python",
        code: `import ledgerline

ledgerline.api_key = "sk_test_51Hx9w2Q"

payment = ledgerline.Payment.create(
    account="acct_4821",
    amount=1840,
    currency="eur",
    customer="cus_R2d7Lq",
    payment_method="pm_card_debit_4242",
    idempotency_key="7b0c8e7a-inv-0193",
)`,
    },
] as const;

export const RESPONSE_EXAMPLE = `{
  "id": "pay_3Qm8Zr1Kd9",
  "object": "payment",
  "amount": 1840,
  "amount_received": 1840,
  "currency": "eur",
  "status": "succeeded",
  "capture": "automatic",
  "customer": "cus_R2d7Lq",
  "fee": { "amount": 57, "currency": "eur" },
  "created": "2026-01-14T09:12:44Z",
  "livemode": false
}`;

export const STATUS_CODES = [
    { code: "201", label: "Created", description: "The payment was created. Check status for the outcome.", tone: "success" },
    { code: "400", label: "Bad request", description: "A parameter is missing or has the wrong type.", tone: "error" },
    { code: "401", label: "Unauthorized", description: "The API key is missing, revoked or for another mode.", tone: "error" },
    { code: "402", label: "Payment required", description: "The card was declined. decline_code says why.", tone: "error" },
    { code: "409", label: "Conflict", description: "The idempotency key was reused with different parameters.", tone: "error" },
    { code: "429", label: "Too many requests", description: "Over 100 writes per second. Retry after the Retry-After header.", tone: "error" },
] as const;
