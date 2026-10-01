# Georgia Reid — October 2026 refinement

Updated all nine duration/package choices, service inclusions and enquiry presets. The second section is shorter; the four photographic tiles carry only their numbered labels. Signature-session, tarot and appointment copy uses a direct first-person voice. Package cards use restrained material shadows and a highlighted signature tier rather than rotating controls. Georgia's existing photos remain unchanged; the About image is top-aligned and separated from the copy on mobile.

## New asset

`assets/vision/intuitive-tarot-daylight-v2.webp` — 1672 × 941, approximately 125 KB. Generated using the built-in image-generation tool; converted to WebP without changing the composition. This is a static photographic asset, not a 3D animation.

Final generation prompt:

> Use case: photorealistic-natural. Asset type: full-width background for Georgia Reid's premium private energy healing and intuitive tarot website. Primary request: refined editorial photograph of a real tarot session setting on a luminous Mediterranean terrace in Marbella. Wide landscape 16:9. Left half foreground: a fan of five physically realistic ivory and muted antique-gold tarot cards with subtle engraved celestial illustrations, elegant gilded edges, one moonstone crystal and a small brass bowl on pale travertine. Right half intentionally calm, softly lit cream limestone wall and translucent linen curtain, clear pale negative space for dark website text. Background left: tranquil blue-grey sea through a sunlit arch, distant Costa del Sol headland, olive branch casting delicate shadows. Warm late-afternoon light, natural material textures, restrained spiritual symbolism, real optical depth and shadows, luxury magazine photography, not fantasy concept art. No people, no text, no logos, no neon, no dark blue wash, no excessive objects, no floating elements. Keep the cards fully visible on the left and the right uncluttered.

## Checks

Follow-up: Intuitive Tarot is €111 in its card, scene and enquiry preset. Removed the floating CSS seals, orbit lines, spheres and drift animation across Hero, Sessions, Private Experiences and Enquiry. Scenic imagery supplies the material depth. Mobile review uses `responsive-check.html` at 360, 390, 430 and 768 CSS pixels. Corrected the mobile price row to span both card columns and added a readable glass header over the hero photograph.

Run `node --test tests/site.test.cjs`, `node --check script.js` and `git diff --check`.

The enquiry form opens the visitor's email app; it does not claim successful delivery. WhatsApp opens a direct conversation. No enquiry is sent during QA. Energy/intuitive work is labelled complementary wellbeing support; SOS coaching calls are not emergency care.


## Align with Georgia — selected AG signature, 1 October 2026

The user-selected stacked AG / Align / with Georgia reference was refined with black lettering and antique dark-gold metal accents. Built-in image generation, transparent PNG, actual source resolution 1287 × 1222. The PNG master is retained in assets/vision/align-with-georgia-black-gold-v1.png. Lossless WebP crops retain its original lettering for the responsive horizontal header/footer lockup; the favicon uses the same AG mark on ivory for dark-mode legibility. This is a raster master, not a traced vector or claimed 4K asset.

Generation prompt: Use case: logo-brand, precise edit of the attached selected logo. Produce a production-ready high-resolution 2048px transparent PNG logo. Preserve exactly the elegant interlocking AG monogram at the top, the distinctive high contrast serif word Align and the handwritten script with Georgia beneath it. Change the plum/purple lettering and main A/G strokes to rich BLACK #111111. Keep the curved ribbon crossing the AG, but change its copper colour to restrained DARK ANTIQUE GOLD #806029 with a subtle brushed-metal highlight #a08448. All text remains black. Exact text: Align / with Georgia. Maintain the reference letter shapes, proportions and flowing script as faithfully as possible. Remove the small duplicate monogram at the bottom, remove the cream background and the black outer border. One single large centred stacked logo only: AG monogram above, Align underneath, with Georgia in black script below. True transparent background, sharp clean antialiased edges, generous small transparent margin, no mockup, no paper texture, no extra ornaments, no shadow or glow, no other text. The black wordmark must be legible and substantial enough for website branding.

The four areas retain only 01 Energy, 02 Mindset, 03 Alignment and 04 Intuition. Gallery maximum width increases from 1240 to 1480px; image panels increase in height, surrounding whitespace decreases, and a photographic Mediterranean backdrop replaces the plain gradient. Borders, layered shadows and restrained perspective provide physical depth without floating symbolic overlays. Small screens retain a touch-scroll gallery with a visible next-card preview. All prices, inclusions and approved Georgia portraits are preserved.


## Public domain — 1 October 2026

Verified alignwithgeorgia.online redirects to https://www.alignwithgeorgia.online/ and serves this website. Contact/footer now show the domain; canonical URL, Open Graph URL/image, ProfessionalService URL/logo, robots and sitemap use the verified www host. Existing email and WhatsApp remain unchanged.
