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
