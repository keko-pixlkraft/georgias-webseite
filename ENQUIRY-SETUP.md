# Direct enquiries

The form posts JSON to `/api/enquiry`. Email is sent server-side through Resend to the fixed recipient `georgiareid25@gmail.com`; Reply-To is the visitor’s email. The client never receives the API key and never opens an email app automatically.

## Production configuration

- Resend sending domain: `mail.alignwithgeorgia.online` (verified).
- Vercel production variables: `RESEND_API_KEY`, `ENQUIRY_FROM=Georgia <sessions@mail.alignwithgeorgia.online>`, `ENQUIRY_ENABLED=true`.
- Store the API key as **Secret** in Vercel. Never commit it or paste it into chat. Changes to environment variables require a new deployment.
- Vercel Firewall: `/api/enquiry` AND method POST, fixed-window limit of five requests per IP per 600 seconds, HTTP 429 when exceeded.
- `GET /api/enquiry` returns only an availability boolean; no credentials or messages.

## Behaviour and protection

The server checks the origin, content type, payload size, name/email, offer whitelist and hidden honeypot. Sender and recipient cannot be overridden by the browser. Email HTML is escaped and a plain-text alternative is included. An unchanged retry reuses the same idempotency key. The client blocks double submits, keeps details on failure and reports success only after provider acceptance. Acceptance is not proof of Gmail inbox delivery; verify delivery/bounce status in Resend and the actual inbox separately.

## Checks

`node --test tests/*.test.cjs` uses a mocked provider and sends no real email. It covers delivery guards, escaping, retry idempotency, duplicate clicks, non-JSON/rate-limit errors and success states.

Production smoke check: submit one clearly labelled test enquiry, verify Resend delivery, Gmail receipt and Reply-To. A request is not a confirmed appointment.

Next UI milestone: preferred date/time, Europe/Madrid time-zone label, online/in-person choice, flexible-date alternative and an enquiry summary. Do not show slots as available until backed by Georgia’s actual calendar.

Sources: https://vercel.com/docs/functions/runtimes/node-js and https://resend.com/docs/api-reference/emails/send-email
