const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/enquiry.js');

const valid = { name: 'Example visitor', email: 'visitor@example.com', service: 'Intuitive Tarot — 60 minutes — €111', message: 'I would like to ask about a session.', requestId: '7a114c93-f10a-46a1-bbad-e43ea98e32df' };
const invoke = async (body = valid, overrides = {}) => {
  const req = { method: 'POST', headers: { origin: 'https://www.alignwithgeorgia.online', 'content-type': 'application/json' }, body, ...overrides };
  const result = { headers: {} };
  const res = { setHeader(k, v) { result.headers[k] = v; }, status(code) { result.code = code; return this; }, json(value) { result.body = value; return result; } };
  await handler(req, res);
  return result;
};

test('enquiry delivery safeguards and failure handling (no real emails)', async () => {
  const saved = { enabled: process.env.ENQUIRY_ENABLED, key: process.env.RESEND_API_KEY, from: process.env.ENQUIRY_FROM, fetch: global.fetch };
  let calls = 0;
  global.fetch = async () => { calls++; throw new Error('Unexpected network call'); };
  try {
    delete process.env.ENQUIRY_ENABLED;
    assert.equal((await invoke()).code, 503);
    assert.equal(calls, 0);
    assert.equal((await invoke(valid, { method: 'GET' })).code, 405);
    assert.equal((await invoke(valid, { headers: { origin: 'https://other.example' } })).code, 403);
    process.env.ENQUIRY_ENABLED = 'true';
    process.env.RESEND_API_KEY = 'test-only';
    process.env.ENQUIRY_FROM = 'Georgia <sessions@alignwithgeorgia.online>';
    for (const body of [null, [], '{', { ...valid, email: 'bad\r\nemail@example.com' }, { ...valid, service: 'Fake offer' }, { ...valid, message: '' }, { ...valid, website: 'spam' }, { ...valid, name: 'A'.repeat(121) }]) {
      assert.equal((await invoke(body)).code, 400);
    }
    assert.equal(calls, 0);
    let sent;
    global.fetch = async (url, options) => {
      calls++; sent = JSON.parse(options.body);
      assert.equal(url, 'https://api.resend.com/emails');
      assert.equal(options.headers['Idempotency-Key'], `enquiry-${valid.requestId}`);
      return { ok: true, json: async () => ({ id: 'provider-test-id' }) };
    };
    const accepted = await invoke({ ...valid, to: 'attacker@example.com', from: 'attacker@example.com' });
    assert.equal(accepted.code, 200);
    assert.deepEqual(sent.to, ['georgiareid25@gmail.com']);
    assert.equal(sent.reply_to, valid.email);
    assert.equal(sent.from, process.env.ENQUIRY_FROM);
    global.fetch = async () => ({ ok: false, json: async () => ({ error: 'rejected' }) });
    assert.equal((await invoke()).code, 502);
    global.fetch = async () => { throw new Error('timeout'); };
    assert.equal((await invoke()).code, 502);
  } finally {
    global.fetch = saved.fetch;
    for (const [key, value] of Object.entries({ ENQUIRY_ENABLED: saved.enabled, RESEND_API_KEY: saved.key, ENQUIRY_FROM: saved.from })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
