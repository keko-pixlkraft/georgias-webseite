# Align with Georgia

Private energy healing, mindset strategy, tarot and alignment experiences on the Costa del Sol and online worldwide.

Live: https://www.alignwithgeorgia.online/

Static HTML/CSS/JavaScript on Vercel. Direct enquiries use a server-side Resend function with fixed recipient, validation, idempotent retries and Vercel Firewall rate limiting. See ENQUIRY-SETUP.md for configuration and delivery checks.

## Local preview

Serve the project root with a static web server. Open responsive-check.html to inspect the live CSS at narrow viewport widths.

## Checks

`node --test tests/*.test.cjs`

## Booking and payment

Clients submit their session, preferred date/time and contact details. Georgia receives the enquiry by email, confirms the appointment personally by email, then sends a PayPal payment link or bank transfer details. There is no calendar connection or website checkout. Payment due dates are agreed by Georgia in her confirmation. See BOOKING-WORKFLOW.md.
