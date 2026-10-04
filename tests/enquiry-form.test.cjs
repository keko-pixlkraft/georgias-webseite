const test = require('node:test');
const assert = require('node:assert/strict');
const initialise = require('../enquiry-form.js');

function fixture(fetch) {
  let submit, resets = 0, uuidCount = 0, valid = true;
  const fields = Object.fromEntries(Object.entries({ name: 'Visitor', email: 'visitor@example.com', service: 'Intuitive Tarot — 60 minutes — €111', message: 'A private session please.', website: '' }).map(([key, value]) => [`#${key}`, { value, dispatchEvent() {} }]));
  const button = { innerHTML: 'Send enquiry', disabled: false };
  const status = { dataset: {}, focus() {} };
  const form = { addEventListener(event, listener) { submit = listener; }, querySelector() { return button; }, checkValidity() { return valid; }, reportValidity() {}, setAttribute() {}, removeAttribute() {}, reset() { resets++; } };
  initialise({ querySelector(selector) { return { '#contact-form': form, '#form-status': status, ...fields }[selector]; } }, { fetch, randomUUID() { return `id-${++uuidCount}`; } });
  return { submit: () => submit({ preventDefault() {} }), fields, button, status, invalid() { valid = false; }, get resets() { return resets; } };
}

test('success is only shown after provider acceptance and duplicate clicks are ignored', async () => {
  let resolve, calls = 0;
  const ui = fixture(() => { calls++; return new Promise(r => { resolve = r; }); });
  const pending = ui.submit();
  assert.equal(ui.button.disabled, true);
  await ui.submit();
  assert.equal(calls, 1);
  assert.equal(ui.resets, 0);
  resolve({ ok: true, json: async () => ({ accepted: true }) });
  await pending;
  assert.equal(ui.status.dataset.state, 'success');
  assert.match(ui.status.textContent, /reply by email to confirm your appointment/);
  assert.match(ui.status.textContent, /PayPal payment link or bank transfer details/);
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.button.innerHTML, 'Send enquiry');
  assert.equal(ui.resets, 1);
});

test('failed requests preserve data and retry keys; changed enquiries get a new key', async () => {
  const ids = [];
  const ui = fixture(async (url, options) => { assert.equal(url, '/api/enquiry'); ids.push(JSON.parse(options.body).requestId); throw new TypeError('offline'); });
  await ui.submit(); await ui.submit();
  assert.deepEqual(ids, ['id-1', 'id-1']);
  assert.equal(ui.status.dataset.state, 'error');
  assert.equal(ui.resets, 0);
  assert.equal(ui.fields['#message'].value, 'A private session please.');
  ui.fields['#message'].value = 'A different enquiry';
  await ui.submit();
  assert.equal(ids[2], 'id-2');
});

test('rate limits and non-JSON errors never become success; invalid forms never send', async () => {
  let calls = 0;
  const ui = fixture(async () => { calls++; return { ok: false, status: 429, json: async () => { throw new SyntaxError('HTML response'); } }; });
  await ui.submit();
  assert.equal(ui.status.dataset.state, 'error');
  assert.match(ui.status.textContent, /wait a few minutes/);
  ui.invalid(); await ui.submit();
  assert.equal(calls, 1);
  const unaccepted = fixture(async () => ({ ok: true, json: async () => ({}) }));
  await unaccepted.submit();
  assert.equal(unaccepted.status.dataset.state, 'error');
});

test('appointment steps preserve choices, validate the date and build a clear summary', () => {
  const elements = {};
  for (const id of ['enquiry-title', 'continue-enquiry', 'session-step', 'details-step', 'flexible', 'preferredDate', 'preferredTime', 'preferred-fields', 'timing-note', 'progress-details', 'progress-session', 'name', 'service', 'enquiry-summary-text', 'edit-enquiry']) {
    elements[`#${id}`] = { value: '', disabled: false, hidden: false, listeners: {}, attributes: {}, valid: true,
      addEventListener(event, fn) { this.listeners[event] = fn; }, setAttribute(k, v) { this.attributes[k] = v; }, removeAttribute(k) { delete this.attributes[k]; }, focus() {}, checkValidity() { return this.valid; }, reportValidity() { this.reported = true; } };
  }
  elements['#flexible'].checked = true;
  elements['#service'].value = 'Energy Healing — 60 minutes — €333';
  elements['input[name="format"]:checked'] = { value: 'Online' };
  const flow = initialise.appointmentPreferences({ querySelector: selector => elements[selector] });
  assert.equal(elements['#preferred-fields'].hidden, true);
  assert.equal(flow.values().preferredDate, '');
  flow.advance();
  assert.equal(flow.isDetails(), true);
  assert.equal(elements['#session-step'].disabled, true);
  assert.equal(elements['#details-step'].disabled, false);
  assert.match(elements['#enquiry-summary-text'].textContent, /€333\nOnline\nFlexible timing/);
  elements['#edit-enquiry'].listeners.click();
  elements['#flexible'].checked = false;
  elements['#flexible'].listeners.change();
  assert.equal(elements['#preferredDate'].required, true);
  elements['#preferredDate'].valid = false;
  assert.equal(flow.advance(), false);
  assert.equal(flow.isDetails(), false);
  assert.equal(elements['#preferredDate'].reported, true);
  elements['#preferredDate'].valid = true;
  elements['#preferredDate'].value = `${new Date().getUTCFullYear() + 1}-10-05`;
  elements['#preferredTime'].value = '14:30';
  elements['input[name="format"]:checked'].value = 'In person';
  flow.advance();
  assert.match(elements['#enquiry-summary-text'].textContent, /In person · Costa del Sol/);
  assert.match(elements['#enquiry-summary-text'].textContent, /14:30 · Europe\/Madrid/);
  elements['#service'].listeners.change();
  assert.equal(flow.isDetails(), false);
});
