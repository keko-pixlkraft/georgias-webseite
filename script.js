document.documentElement.classList.add('has-js');

const form = document.querySelector('#contact-form');
const service = document.querySelector('#service');
const selectedSession = document.querySelector('#selected-session');
const status = document.querySelector('#form-status');

document.querySelectorAll('.select-session').forEach((button) => {
  button.addEventListener('click', () => {
    const session = button.closest('[data-session]').dataset.session;
    service.value = session;
    selectedSession.textContent = `Selected: ${session}`;
    selectedSession.classList.add('is-visible');
    document.querySelector('#request').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('is-invalid');
    form.reportValidity();
    return;
  }
  const name = document.querySelector('#name').value.trim();
  const email = document.querySelector('#email').value.trim();
  const message = document.querySelector('#message').value.trim();
  const subject = encodeURIComponent(`Private session request — ${service.value}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nSession: ${service.value}\n\nWhat I would like support with:\n${message}`);
  window.location.href = `mailto:georgiareid25@gmail.com?subject=${subject}&body=${body}`;
  status.textContent = 'Your email app is opening with your private request.';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
}, { threshold: 0.13 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();
