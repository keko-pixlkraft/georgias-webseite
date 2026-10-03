# Direct enquiries — next rollout

The first release updates the contact design, Instagram and typography. Its form explicitly says **Continue by email**; it is not yet a direct email sender.

`api/enquiry.js` is a prepared Vercel Node function. It is disabled by default, uses the fixed recipient `georgiareid25@gmail.com`, and accepts only the published experiences and prices. Tests mock the provider: no test emails are sent.

## Activation prerequisites

1. Verify `alignwithgeorgia.online` with Resend using the DNS records it supplies. Do not replace existing email DNS records blindly.
2. Configure Vercel server environment variables: `RESEND_API_KEY`, `ENQUIRY_FROM` (a verified sender such as `Georgia <sessions@alignwithgeorgia.online>`), and eventually `ENQUIRY_ENABLED=true`. Never place the API key in frontend files, GitHub or chat.
3. Connect the frontend to POST JSON to `/api/enquiry` with name, email, service, message, a stable UUID `requestId`, and a hidden `website` honeypot. Preserve the UUID when retrying an unchanged enquiry. Never fall back to automatically opening an email app.
4. Add Vercel Firewall rate limiting / bot protection before enabling public delivery. Origin checks and honeypots alone are not sufficient abuse protection; no unreliable in-memory rate limiter is used.
5. Show progress, prevent double submits, preserve entered fields on failure, and show success only after a positive API response. Explain that a request is not a confirmed appointment. Provider acceptance does not prove Gmail inbox delivery.
6. Check production delivery, reply-to, provider bounce reporting and mobile error states. A real end-to-end test email is a separate explicit test action.

Next UI milestone: preferred date/time, Europe/Madrid time-zone label, online/in-person choice, flexible-date alternative, and an enquiry summary. Do not show slots as available until backed by Georgia's actual calendar.

## Checks

`node --test tests/*.test.cjs`

Sources: https://vercel.com/docs/functions/runtimes/node-js and https://resend.com/docs/api-reference/emails/send-email
