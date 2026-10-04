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
    assert.deepEqual((await invoke(valid, { method: 'GET' })).body, { available: false });
    assert.equal((await invoke(valid, { method: 'DELETE' })).code, 405);
    assert.equal((await invoke(valid, { headers: { origin: 'https://other.example' } })).code, 403);
    process.env.ENQUIRY_ENABLED = 'true';
    process.env.RESEND_API_KEY = 'test-only';
    process.env.ENQUIRY_FROM = 'Georgia <sessions@alignwithgeorgia.online>';
    assert.deepEqual((await invoke(valid, { method: 'GET' })).body, { available: true });
    assert.equal((await invoke(valid, { headers: { origin: 'https://www.alignwithgeorgia.online', 'content-type': 'text/plain' } })).code, 415);
    assert.equal((await invoke({ ...valid, message: 'A'.repeat(13000) })).code, 413);
    for (const body of [null, [], '{', { ...valid, email: 'bad\r\nemail@example.com' }, { ...valid, service: 'Fake offer' }, { ...valid, message: '' }, { ...valid, website: 'spam' }, { ...valid, name: 'A'.repeat(121) }]) {
      assert.equal((await invoke(body)).code, 400);
    }
    assert.equal(calls, 0);
    let sent;
    const nextYear = new Date().getUTCFullYear() + 1;
    for (const fields of [{ format: 'Invented' }, { preferredDate: '2000-01-01' }, { preferredDate: `${nextYear}-02-30` }, { preferredDate: ['invalid'] }, { preferredTime: '12:30' }, { preferredDate: `${nextYear}-10-05`, preferredTime: '24:00' }, { preferredDate: 'too-long-date-input' }, { timezone: 'Fake/Timezone' }]) {
      assert.equal((await invoke({ ...valid, ...fields })).code, 400);
    }
    assert.equal(calls, 0);
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
    await invoke({ ...valid, name: '<img src=x onerror=alert(1)>', message: '<script>bad</script>' });
    assert.ok(sent.html.includes('&lt;script&gt;bad&lt;/script&gt;'));
    assert.ok(!sent.html.includes('<img'));
    const appointment = await invoke({ ...valid, format: 'In person', preferredDate: `${nextYear}-10-05`, preferredTime: '14:30', timezone: 'Europe/Madrid' });
    assert.equal(appointment.code, 200);
    assert.ok(sent.text.includes('Meeting: In person — Costa del Sol'));
    assert.ok(sent.text.includes(`Preferred date: ${nextYear}-10-05`));
    assert.ok(sent.html.includes('Preferred time: 14:30'));
    assert.ok(sent.html.includes('Time zone: Europe/Madrid'));
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
