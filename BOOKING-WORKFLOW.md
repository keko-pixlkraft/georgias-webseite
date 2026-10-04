# Personal appointments and payment

Approved by Kevin and Georgia on 4 October 2026. This replaces the calendar integration plan.

## Client journey

1. Choose a session and meeting format. Suggest a date and optional quarter-hour time, or choose flexible timing. Times use Europe/Madrid.
2. Review the chosen session, published price and preferences; add name, email and message.
3. Send the enquiry. The existing server-side Resend delivery emails Georgia at georgiareid25@gmail.com with all choices and the visitor's Reply-To address. The on-page receipt acknowledges the request; it is not an appointment confirmation. No automatic customer confirmation email is sent.
4. Georgia checks her own schedule and replies by email to confirm the date, time, duration, format and online joining details or meeting location. If the requested time is unsuitable, she proposes alternatives.
5. After confirming, Georgia sends a PayPal payment link or bank transfer details by email. She specifies the amount, payment due date and any applicable cancellation/rescheduling terms. Whether payment is due before or after the session remains her decision; the website does not invent a rule.
6. Georgia verifies receipt of payment herself. The website does not collect card/bank credentials or mark enquiries as paid.

## Scope

No Google Calendar API, OAuth credentials, calendar reservation or website payment gateway. The unused calendar adapter and its tests have been removed. Do not add a calendar or payment provider without a new explicit decision. Existing service prices and support inclusions remain unchanged. For journeys/mentorship, Georgia arranges subsequent appointments personally.

## Operational checklist

Before replying: check the requested time against other appointments, confirm the correct service/price, and include a clear payment deadline. Confirm the appointment explicitly rather than treating provider acceptance or email delivery as a reserved slot. Use Reply-To to answer the correct visitor.

## Verification

The user confirmed receipt of a real production enquiry on 4 October 2026. Automated tests mock Resend and send no real emails. They verify fixed-recipient delivery, preference inclusion, quarter-hour validation, request receipt wording, retries and failure behaviour.
