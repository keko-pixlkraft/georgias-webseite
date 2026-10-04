const header = document.querySelector('#site-header');
const form = document.querySelector('#contact-form');
const service = document.querySelector('#service');
const selectedSession = document.querySelector('#selected-session');
const updateWhatsApp = () => {
  const text = service.value && service.value !== 'I’m not sure yet' ? `Hello Georgia, I’d like to ask about ${service.value}.` : 'Hello Georgia, I’d like to ask about a private session.';
  document.querySelectorAll('a[href^="https://wa.me/447855030356"]').forEach(link => { link.href = `https://wa.me/447855030356?text=${encodeURIComponent(text)}`; });
};

const setHeaderState = () => header.classList.toggle('is-scrolled', window.scrollY > 80);
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

const chooseSession = (session) => {
  const option = [...service.options].find((item) => item.textContent === session);
  if (!option) return;
  service.value = option.value;
  updateWhatsApp();
  selectedSession.textContent = `Selected experience: ${session}`;
  selectedSession.classList.add('is-visible');
  document.querySelector('#request').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

service.addEventListener('change', () => {
  updateWhatsApp();
  selectedSession.textContent = service.value ? `Selected experience: ${service.value}` : 'No experience selected yet';
  selectedSession.classList.toggle('is-visible', Boolean(service.value));
});

document.querySelectorAll('.select-session').forEach((button) => {
  button.addEventListener('click', () => {
    chooseSession(button.dataset.choice || button.closest('[data-session]').dataset.session);
  });
});

document.querySelectorAll('[data-preset]').forEach((link) => {
  link.addEventListener('click', () => {
    const preset = link.dataset.preset;
    window.setTimeout(() => {
      const option = [...service.options].find((item) => item.textContent === preset);
      if (option) service.value = option.value;
      updateWhatsApp();
      selectedSession.textContent = `Selected experience: ${preset}`;
      selectedSession.classList.add('is-visible');
    }, 250);
  });
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
