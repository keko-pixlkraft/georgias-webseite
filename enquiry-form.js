/* Private enquiry delivery; no visitor data is stored in the browser. */
function initialiseEnquiryForm(document, transport) {
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  const button = form.querySelector('button[type="submit"]');
  const originalButton = button.innerHTML;
  let sending = false;
  let previousPayload = '';
  let requestId;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const payload = Object.fromEntries(['name', 'email', 'service', 'message', 'website'].map(key => [key, document.querySelector(`#${key}`).value.trim()]));
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
      previousPayload = '';
      requestId = undefined;
      document.querySelector('#service').dispatchEvent(new Event('change'));
      status.dataset.state = 'success';
      status.textContent = 'Thank you — your enquiry has been sent. Georgia will reply personally to arrange a time. Your session is confirmed once you hear from her.';
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

if (typeof module !== 'undefined' && module.exports) module.exports = initialiseEnquiryForm;
else initialiseEnquiryForm(document, { fetch: window.fetch.bind(window), randomUUID: () => window.crypto.randomUUID() });
