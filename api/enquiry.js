// Delivery is enabled only through server-side Vercel configuration.
const { randomUUID } = require('node:crypto');

const experiences = new Set([
  'Energy Healing — 60 minutes — €333', 'Energy Healing — 90 minutes — €444',
  'Mindset Strategy — 60 minutes — €333', 'The Alignment Session — 90 minutes — €444',
  'Manifestation & Self-Concept — 75 minutes — €444', 'Intuitive Tarot — 60 minutes — €111',
  'The Alignment Journey — 4 sessions — €1,333', 'The Georgia Edit — 8 sessions — €2,222',
  'Private 1:1 Mentorship — 12 weeks — €3,333', 'I’m not sure yet'
]);
const origins = new Set([
  'https://www.alignwithgeorgia.online', 'https://alignwithgeorgia.online',
  'https://georgias-webseite.vercel.app'
]);
const recipient = 'georgiareid25@gmail.com';
const clean = (value, limit) => typeof value === 'string' && value.trim().length <= limit ? value.trim() : '';

const escapeHtml = value => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json({ available: process.env.ENQUIRY_ENABLED === 'true' && Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_FROM) });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Please submit an enquiry using the form.' });
  }
  if (!origins.has(req.headers.origin)) return res.status(403).json({ error: 'This request could not be accepted.' });
  if (!(req.headers['content-type'] || '').startsWith('application/json')) return res.status(415).json({ error: 'Please use the enquiry form.' });
  if (process.env.ENQUIRY_ENABLED !== 'true' || !process.env.RESEND_API_KEY || !process.env.ENQUIRY_FROM) {
    return res.status(503).json({ error: 'Online enquiries are unavailable. Please contact Georgia directly.' });
  }
  let body;
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!raw || Buffer.byteLength(raw) > 12000) return res.status(413).json({ error: 'Please keep your enquiry brief.' });
    body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
  } catch {
    return res.status(400).json({ error: 'Please check your enquiry and try again.' });
  }
  if (body.website) return res.status(400).json({ error: 'This request could not be accepted.' });
  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const service = clean(body.service, 180);
  const message = clean(body.message, 3000);
  if (!name || /[\r\n]/.test(name) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !experiences.has(service) || !message) {
    return res.status(400).json({ error: 'Please check your name, email, session and message.' });
  }
  // Old browser tabs remain compatible; new enquiries include appointment preferences.
  const format = body.format === undefined ? 'Let’s discuss' : clean(body.format, 30);
  const preferredDate = body.preferredDate === undefined ? '' : clean(body.preferredDate, 10);
  const preferredTime = body.preferredTime === undefined ? '' : clean(body.preferredTime, 5);
  const timezone = 'Europe/Madrid';
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(preferredDate) && !Number.isNaN(Date.parse(`${preferredDate}T12:00:00Z`)) && new Date(`${preferredDate}T12:00:00Z`).toISOString().slice(0, 10) === preferredDate && preferredDate >= today;
  if (!['Online', 'In person', 'Let’s discuss'].includes(format) || (body.preferredDate !== undefined && typeof body.preferredDate !== 'string') || (body.preferredTime !== undefined && typeof body.preferredTime !== 'string') || (body.timezone !== undefined && body.timezone !== timezone) || (preferredDate && !validDate) || (preferredTime && (!preferredDate || !/^([01]\d|2[0-3]):(00|15|30|45)$/.test(preferredTime))) || (body.preferredDate && !preferredDate) || (body.preferredTime && !preferredTime)) {
    return res.status(400).json({ error: 'Please check your meeting format, preferred date and time.' });
  }
  const appointment = `Meeting: ${format}${format === 'In person' ? ' — Costa del Sol' : ''}\nPreferred date: ${preferredDate || 'Flexible — please suggest a time'}\nPreferred time: ${preferredTime || 'Flexible'}\nTime zone: ${timezone}`;
  // Recipient and sender stay server-side. The visitor is only the reply-to address.
  const id = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId || '') ? body.requestId : randomUUID();
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `enquiry-${id}` },
      body: JSON.stringify({
        from: process.env.ENQUIRY_FROM, to: [recipient], reply_to: email,
        subject: `Private enquiry — ${service}`,
        html: `<div style="background:#f7f1e6;padding:32px;color:#211d18;font-family:Arial,sans-serif;line-height:1.6"><p style="color:#765128;letter-spacing:2px;font-size:12px">ALIGN WITH GEORGIA</p><h1 style="font-family:Georgia,serif;font-size:28px;font-weight:normal">A new private enquiry</h1><p><strong>${escapeHtml(name)}</strong><br>${escapeHtml(email)}</p><p style="border-top:1px solid #d8c9ad;padding-top:16px"><strong>${escapeHtml(service)}</strong></p><p style="white-space:pre-line;background:#efe4d0;padding:16px">${escapeHtml(appointment)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p><p style="font-size:12px;color:#685c4c">Reply to this email to contact the visitor.<br>Reference: ${id}<br>This is a preferred time request, not a confirmed appointment. Reply to confirm the date, time and meeting details, then send your PayPal payment link or bank transfer details.</p></div>`,
        text: `ALIGN WITH GEORGIA\n\nName: ${name}\nEmail: ${email}\nSession: ${service}\n\n${appointment}\n\n${message}\n\nReference: ${id}\nThis is a preferred time request, not a confirmed appointment. Reply to confirm the date, time and meeting details, then send your PayPal payment link or bank transfer details.`
      }),
      signal: AbortSignal.timeout(10000)
    });
    const result = await response.json();
    if (!response.ok || !result.id) throw new Error('Delivery not accepted');
    return res.status(200).json({ accepted: true, reference: id });
  } catch {
    // Never log private messages or credentials, and never report a failed send as success.
    return res.status(502).json({ error: 'Your enquiry could not be sent. Please try again or contact Georgia on WhatsApp.' });
  }
};
