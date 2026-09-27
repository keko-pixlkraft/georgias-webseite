const CONTACT = {
  email: "georgiareid25@gmail.com"
};

const form = document.querySelector("#contact-form");
const serviceSelect = document.querySelector("#service");
const status = document.querySelector("#form-status");

document.querySelector("#year").textContent = new Date().getFullYear();

document.querySelectorAll(".session-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (!event.target.closest("button")) return;
    serviceSelect.value = card.dataset.service;
    document.querySelector("#request").scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => serviceSelect.focus({ preventScroll: true }), 650);
  });
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("is-invalid");
      status.textContent = "Please complete the highlighted fields.";
      return;
    }

    const values = Object.fromEntries(new FormData(form).entries());
    const subject = `Private session request: ${values.service}`;
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Session: ${values.service}`,
      "",
      values.message
    ].join("\n");

    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Your email app should open with your private request ready to send.";
    form.classList.remove("is-invalid");
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const delay = Number(entry.target.dataset.delay || 0);
    window.setTimeout(() => entry.target.classList.add("is-visible"), delay);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
