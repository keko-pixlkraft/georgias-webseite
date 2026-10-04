/* Private enquiry delivery; no visitor data is stored in the browser. */
function appointmentPreferences(document) {
  const next = document.querySelector('#continue-enquiry');
  if (!next) return null;
  const sessionStep = document.querySelector('#session-step');
  const detailsStep = document.querySelector('#details-step');
  const flexible = document.querySelector('#flexible');
  const date = document.querySelector('#preferredDate');
  const time = document.querySelector('#preferredTime');
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  let details = false;
  const syncTiming = () => {
    date.min = today();
    date.required = !flexible.checked;
    date.disabled = time.disabled = flexible.checked;
    document.querySelector('#preferred-fields').hidden = flexible.checked;
    document.querySelector('#timing-note').textContent = flexible.checked ? 'Georgia will suggest a time in her reply.' : 'Choose what suits you. Georgia will confirm it or offer an alternative.';
  };
  const values = () => ({
    format: document.querySelector('input[name="format"]:checked').value,
    preferredDate: flexible.checked ? '' : date.value,
    preferredTime: flexible.checked ? '' : time.value,
    timezone: 'Europe/Madrid'
  });
  const show = value => {
    details = value;
    document.querySelector('#enquiry-title').textContent = value ? 'Your details' : 'Your session';
    sessionStep.hidden = sessionStep.disabled = value;
    detailsStep.hidden = detailsStep.disabled = !value;
    document.querySelector(value ? '#progress-details' : '#progress-session').setAttribute('aria-current', 'step');
    document.querySelector(value ? '#progress-session' : '#progress-details').removeAttribute('aria-current');
    if (value) document.querySelector('#name').focus({ preventScroll: true });
  };
  const advance = () => {
    date.min = today();
    for (const field of [document.querySelector('#service'), date, time]) {
      if (!field.disabled && !field.checkValidity()) { field.reportValidity(); return false; }
    }
    const preference = values();
    const formattedDate = preference.preferredDate ? new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${preference.preferredDate}T12:00:00Z`)) : '';
    document.querySelector('#enquiry-summary-text').textContent = `${document.querySelector('#service').value}\n${preference.format}${preference.format === 'In person' ? ' · Costa del Sol' : ''}\n${formattedDate ? `${formattedDate}${preference.preferredTime ? ` · ${preference.preferredTime}` : ' · Flexible time'} · Europe/Madrid` : 'Flexible timing · Georgia will suggest a time'}`;
    show(true);
    return true;
  };
  next.addEventListener('click', advance);
  document.querySelector('#edit-enquiry').addEventListener('click', () => { show(false); next.focus({ preventScroll: true }); });
  flexible.addEventListener('change', syncTiming);
  document.querySelector('#service').addEventListener('change', () => { if (details) show(false); });
  syncTiming();
  return { values, isDetails: () => details, advance, reset() { syncTiming(); show(false); } };
}

function initialiseEnquiryForm(document, transport) {
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  const button = form.querySelector('button[type="submit"]');
  const originalButton = button.innerHTML;
  let sending = false;
  let previousPayload = '';
  let requestId;
  const preferences = appointmentPreferences(document);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    if (preferences && !preferences.isDetails()) { preferences.advance(); return; }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const payload = { ...Object.fromEntries(['name', 'email', 'service', 'message', 'website'].map(key => [key, document.querySelector(`#${key}`).value.trim()])), ...(preferences ? preferences.values() : {}) };
    if (!payload.name || !payload.message) {
      status.dataset.state = 'error';
      status.textContent = 'Please add your name and a short message.';
      status.focus();
      return;
    }
    const fingerprint = JSON.stringify(payload);
    // Reuse the provider idempotency key when an unchanged enquiry is retried.
    if (fingerprint !== previousPayload) {
      requestId = transport.randomUUID();
      previousPayload = fingerprint;
    }
    sending = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.dataset.state = 'pending';
    status.textContent = 'Sending your enquiry to Georgia…';
    try {
      const response = await transport.fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, requestId }),
        signal: AbortSignal.timeout(20000)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.accepted !== true) {
        if (response.status === 429) throw new Error('Please wait a few minutes before trying again, or contact Georgia on WhatsApp.');
        if (response.status === 400) throw new Error('Please check your details and try again.');
        throw new Error('Your enquiry could not be sent. Your details are still here. Please try again or contact Georgia on WhatsApp.');
      }
      form.reset();
      if (preferences) preferences.reset();
      previousPayload = '';
      requestId = undefined;
      document.querySelector('#service').dispatchEvent(new Event('change'));
      status.dataset.state = 'success';
      status.textContent = 'Thank you — your request has been sent. Georgia will reply by email to confirm your appointment, then send a PayPal payment link or bank transfer details.';
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error.name === 'TypeError' || error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'We couldn’t confirm delivery. Your details are still here. Please try again or contact Georgia on WhatsApp.'
        : error.message;
    } finally {
      sending = false;
      button.disabled = false;
      button.innerHTML = originalButton;
      form.removeAttribute('aria-busy');
      status.focus();
    }
  });
}

if (typeof module !== 'undefined' && module.exports) { module.exports = initialiseEnquiryForm; module.exports.appointmentPreferences = appointmentPreferences; }
else initialiseEnquiryForm(document, { fetch: window.fetch.bind(window), randomUUID: () => window.crypto.randomUUID() });
