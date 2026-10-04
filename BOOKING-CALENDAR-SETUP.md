# Google Calendar — production booking milestone

Status: Google Calendar selected by Kevin on 4 October 2026. The website currently sends preferred-time enquiries. It does not display live availability or automatically create appointments. No calendar credentials are present in the repository.

## Delivered foundation

`lib/google-calendar.cjs` is a server-only OAuth/free-busy adapter. It refreshes an existing, explicitly authorised connection, reuses short-lived access tokens and returns busy intervals only. Calendar errors fail closed. Mock tests use no Google account or live credentials. The adapter is not exposed as a public endpoint and does not create events.

## Account and configuration

1. Georgia keeps ownership of a dedicated calendar named **Align with Georgia — Private Sessions**, using **Europe/Madrid**. Identify any other calendars that must block appointment times. Their event details need not appear on the website.
2. Confirm working days/hours for online and in-person sessions, the actual in-person location, buffers, minimum booking notice, maximum booking horizon and cancellation/rescheduling rules. Do not invent these values from the coaching prices.
3. The optional Google Calendar connection in ChatGPT helps us inspect/configure the calendar. It is separate from the production website's authorisation.
4. For website availability, create a Google Cloud project, enable Calendar API, configure the OAuth consent screen and a web application OAuth client. Request narrow free/busy access first (`calendar.events.freebusy`), with offline access. Obtain user consent before adding appointment-writing access. Avoid broad `calendar` or ACL permission by default.
5. Store client secret and refresh token only as Vercel server-side Secrets. Never send these values in chat or commit them. The selected calendar IDs and business schedule are server-side configuration. Register a real, implemented OAuth callback URL; there is no live callback endpoint yet. Check Google consent/verification and token lifetime requirements before production use.

## Implementation order

- Availability API: approved opening windows minus Google busy intervals, session duration, buffers and booking notice. Return start/end instants plus explicit timezone; support European daylight-saving changes and visitor-local display. Starts stay on a 15-minute grid.
- Premium date/slot selection: keep the current visual system and two-step enquiry. Show actual free slots only after a successful provider query. On connection failure, retain the personal enquiry route.
- Reservation/confirmation: use a durable transactional reservation store to prevent concurrent double bookings; recheck Google before inserting an appointment. A Google free/busy query alone is not an atomic reservation. Persist request/event IDs so retries do not create duplicates.
- Confirm only after durable reservation and successful calendar creation. Then send Resend confirmation and calendar details. Handle cancellation/rescheduling and reconciliation when calendar creation or mail delivery fails. Do not use Gmail receipt as proof of a calendar reservation.
- Journeys and mentorship: select the first appointment initially; subsequent sessions are arranged according to the agreed programme, rather than automatically inventing a recurring schedule.

## Session durations

| Session | Duration |
| --- | --- |
| Energy Healing | 60 or 90 minutes |
| Mindset Strategy | 60 minutes |
| The Alignment Session | 90 minutes |
| Manifestation & Self-Concept | 75 minutes |
| Intuitive Tarot | 60 minutes |
| The Alignment Journey / The Georgia Edit / Mentorship | 60 minutes per appointment |

## Validation before activation

Real calendar connection and selected calendars; approved working hours; summer/winter DST; blocked times; 60/75/90-minute durations and buffers; simultaneous attempts on the same slot; retry after calendar or email timeout; cancellation/rescheduling. No public availability until these checks pass.

Official sources:
- https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query
- https://developers.google.com/workspace/calendar/api/auth
- https://developers.google.com/identity/protocols/oauth2/web-server
