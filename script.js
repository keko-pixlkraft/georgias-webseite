const header = document.querySelector('#site-header');
const form = document.querySelector('#contact-form');
const service = document.querySelector('#service');
const selectedSession = document.querySelector('#selected-session');
const status = document.querySelector('#form-status');

const setHeaderState = () => header.classList.toggle('is-scrolled', window.scrollY > 80);
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

const chooseSession = (session) => {
  const option = [...service.options].find((item) => item.textContent === session);
  if (option) service.value = option.value;
  selectedSession.textContent = `Selected experience: ${session}`;
  selectedSession.classList.add('is-visible');
  document.querySelector('#request').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

document.querySelectorAll('.select-session').forEach((button) => {
  button.addEventListener('click', () => {
    chooseSession(button.closest('[data-session]').dataset.session);
  });
});

document.querySelectorAll('[data-preset]').forEach((link) => {
  link.addEventListener('click', () => {
    const preset = link.dataset.preset;
    window.setTimeout(() => {
      const option = [...service.options].find((item) => item.textContent === preset);
      if (option) service.value = option.value;
      selectedSession.textContent = `Selected experience: ${preset}`;
      selectedSession.classList.add('is-visible');
    }, 250);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const name = document.querySelector('#name').value.trim();
  const email = document.querySelector('#email').value.trim();
  const message = document.querySelector('#message').value.trim();
  const subject = encodeURIComponent(`Private enquiry — ${service.value}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nExperience: ${service.value}\n\nWhat I would like support with:\n${message}`);
  window.location.href = `mailto:georgiareid25@gmail.com?subject=${subject}&body=${body}`;
  status.textContent = 'Your email app is opening with your private enquiry.';
});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-entering');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

document.querySelector('#year').textContent = new Date().getFullYear();
