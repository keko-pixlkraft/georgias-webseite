const test = require('node:test');
const assert = require('node:assert/strict');
const { createGoogleAvailability } = require('../lib/google-calendar.cjs');
const range = { calendarIds: ['private-bookings@example.com'], timeMin: '2026-10-05T08:00:00+02:00', timeMax: '2026-10-06T08:00:00+02:00' };
const credentials = { clientId: 'test-only', clientSecret: 'test-only', refreshToken: 'test-only' };

test('Google availability uses cached server tokens and returns only busy intervals', async () => {
  let tokenCalls = 0, queryCalls = 0;
  const adapter = createGoogleAvailability({ ...credentials, fetchImpl: async (url, options) => {
    if (url.endsWith('/token')) { tokenCalls++; return { ok: true, json: async () => ({ access_token: 'fake-token', expires_in: 3600 }) }; }
    queryCalls++;
    const body = JSON.parse(options.body);
    assert.equal(body.timeZone, 'Europe/Madrid');
    assert.equal(body.timeMin, '2026-10-05T06:00:00.000Z');
    assert.equal(options.headers.Authorization, 'Bearer fake-token');
    return { ok: true, json: async () => ({ calendars: { [range.calendarIds[0]]: { busy: [{ start: '2026-10-05T12:00:00+02:00', end: '2026-10-05T13:00:00+02:00' }] } } }) };
  } });
  const results = await Promise.all([adapter.busy(range), adapter.busy(range)]);
  assert.deepEqual(results[0], [{ start: '2026-10-05T10:00:00.000Z', end: '2026-10-05T11:00:00.000Z' }]);
  assert.equal(tokenCalls, 1); assert.equal(queryCalls, 2);
  await adapter.busy(range); assert.equal(tokenCalls, 1);
});

test('missing calendar access, provider errors and invalid ranges never become free availability', async () => {
  for (const calendars of [{}, { [range.calendarIds[0]]: { errors: [{ reason: 'notFound' }] } }, { [range.calendarIds[0]]: { busy: [{ start: 'invalid', end: 'invalid' }] } }]) {
    const adapter = createGoogleAvailability({ ...credentials, fetchImpl: async url => url.endsWith('/token') ? { ok: true, json: async () => ({ access_token: 'fake-token', expires_in: 3600 }) } : { ok: true, json: async () => ({ calendars }) } });
    await assert.rejects(adapter.busy(range), /could not be checked/);
  }
  const disconnected = createGoogleAvailability({ fetchImpl: () => { throw new Error('Network must not be used'); } });
  await assert.rejects(disconnected.busy(range), /not configured/);
  await assert.rejects(disconnected.busy({ ...range, timeMax: 'invalid' }), /Invalid availability range/);
});
