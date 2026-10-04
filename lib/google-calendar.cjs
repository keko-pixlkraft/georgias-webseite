// Server-only availability adapter. Import from the future booking API, never from browser code.
const calendarScope = 'https://www.googleapis.com/auth/calendar.events.freebusy';
function createGoogleAvailability({ clientId, clientSecret, refreshToken, fetchImpl = fetch }) {
  let accessToken, expiresAt = 0;
  let refreshing;
  async function token() {
    if (accessToken && Date.now() < expiresAt) return accessToken;
    if (!refreshing) refreshing = (async () => {
      if (!clientId || !clientSecret || !refreshToken) throw new Error('Calendar connection is not configured.');
      const response = await fetchImpl('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }).toString(),
        signal: AbortSignal.timeout(10000)
      });
      const result = await response.json();
      if (!response.ok || typeof result.access_token !== 'string' || !result.access_token || !Number.isFinite(result.expires_in) || result.expires_in <= 0) throw new Error('Calendar connection could not be refreshed.');
      accessToken = result.access_token;
      expiresAt = Date.now() + Math.max(0, result.expires_in - 60) * 1000;
      return accessToken;
    })().finally(() => { refreshing = undefined; });
    return refreshing;
  }
  return {
    async busy({ calendarIds, timeMin, timeMax }) {
      const start = Date.parse(timeMin), end = Date.parse(timeMax);
      if (!Array.isArray(calendarIds) || !calendarIds.length || calendarIds.length > 10 || !calendarIds.every(id => typeof id === 'string' && id.length <= 254 && id.trim()) || !Number.isFinite(start) || !Number.isFinite(end) || end <= start || end - start > 31 * 86400000) throw new Error('Invalid availability range.');
      const bearer = await token();
      const response = await fetchImpl('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST', headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeMin: new Date(start).toISOString(), timeMax: new Date(end).toISOString(), timeZone: 'Europe/Madrid', items: calendarIds.map(id => ({ id })) }),
        signal: AbortSignal.timeout(10000)
      });
      if (response.status === 401) { accessToken = undefined; expiresAt = 0; }
      const result = await response.json();
      if (!response.ok || !result.calendars) throw new Error('Calendar availability could not be checked.');
      const intervals = [];
      for (const id of calendarIds) {
        const calendar = result.calendars[id];
        // Missing/inaccessible calendars fail closed; never interpret a provider error as free time.
        if (!calendar || calendar.errors?.length || !Array.isArray(calendar.busy)) throw new Error('Calendar availability could not be checked.');
        for (const interval of calendar.busy) {
          const from = Date.parse(interval.start), to = Date.parse(interval.end);
          if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) throw new Error('Calendar availability could not be checked.');
          intervals.push({ start: new Date(from).toISOString(), end: new Date(to).toISOString() });
        }
      }
      return intervals;
    }
  };
}
module.exports = { createGoogleAvailability, calendarScope };
