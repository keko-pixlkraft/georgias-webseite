const CONTACT_CONFIG = {
  contactEmail: "georgiareid25@gmail.com",
  whatsappNumber: "447855030356",
  whatsappMessage:
    "Hi Georgia, I found your website and would love to book a session."
};

const form = document.querySelector("#contact-form");
const statusNode = document.querySelector("#form-status");
const emailLink = document.querySelector("#email-link");
const whatsappLink = document.querySelector("#whatsapp-link");
const whatsappFloat = document.querySelector("#whatsapp-float");
const availabilityWhatsapp = document.querySelector("#availability-whatsapp");
const availabilityEmail = document.querySelector("#availability-email");
const serviceSelect = document.querySelector("#service");
const revealNodes = document.querySelectorAll(".reveal");

const summaryService = document.querySelector("#summary-service");
const summaryDay = document.querySelector("#summary-day");
const summaryTime = document.querySelector("#summary-time");

const availabilityState = {
  service: "Mindset & Lifestyle Coaching",
  day: "Tuesday",
  time: "Afternoon"
};

function updateContactLinks() {
  const emailHref = `mailto:${CONTACT_CONFIG.contactEmail}`;
  const whatsappHref = `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    CONTACT_CONFIG.whatsappMessage
  )}`;

  if (emailLink) {
    emailLink.href = emailHref;
    const emailValue = emailLink.querySelector("strong");
    if (emailValue) emailValue.textContent = CONTACT_CONFIG.contactEmail;
  }

  if (whatsappLink) {
    whatsappLink.href = whatsappHref;
  }

  if (whatsappFloat) {
    whatsappFloat.href = whatsappHref;
  }
}

function showFieldError(field, hasError) {
  field.classList.toggle("invalid", hasError);
}

function validateForm() {
  if (!form) return true;

  const fields = [...form.querySelectorAll(".field")];
  let valid = true;

  fields.forEach((field) => {
    const input = field.querySelector("input, select, textarea");
    const hasError = input ? !input.checkValidity() : false;
    showFieldError(field, hasError);
    if (hasError) valid = false;
  });

  return valid;
}

function composeMailto(values) {
  const subject = `Website enquiry: ${values.service}`;
  const body = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Service: ${values.service}`,
    "",
    values.message
  ].join("\n");

  return `mailto:${CONTACT_CONFIG.contactEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

function setStatus(message, state = "") {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.className = `form-status ${state}`.trim();
}

function buildAvailabilityMessage() {
  return `Hi Georgia, I would love to request ${availabilityState.service} on ${availabilityState.day} in the ${availabilityState.time.toLowerCase()}.`;
}

function updateAvailabilitySummary() {
  if (summaryService) summaryService.textContent = availabilityState.service;
  if (summaryDay) summaryDay.textContent = availabilityState.day;
  if (summaryTime) summaryTime.textContent = availabilityState.time;

  const requestMessage = buildAvailabilityMessage();
  const whatsappHref = `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    requestMessage
  )}`;
  const emailHref = `mailto:${CONTACT_CONFIG.contactEmail}?subject=${encodeURIComponent(
    `Availability request: ${availabilityState.service}`
  )}&body=${encodeURIComponent(requestMessage)}`;

  if (availabilityWhatsapp) availabilityWhatsapp.href = whatsappHref;
  if (availabilityEmail) availabilityEmail.href = emailHref;
  if (serviceSelect) serviceSelect.value = availabilityState.service;
}

function bindChipGroup(selector, key) {
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(selector).forEach((node) => {
        node.classList.remove("is-selected");
      });
      button.classList.add("is-selected");
      availabilityState[key] = button.dataset[key];
      updateAvailabilitySummary();
    });
  });
}

document.querySelectorAll("[data-service-option]").forEach((link) => {
  link.addEventListener("click", () => {
    availabilityState.service = link.dataset.serviceOption;
    document.querySelectorAll("[data-service]").forEach((button) => {
      button.classList.toggle(
        "is-selected",
        button.dataset.service === availabilityState.service
      );
    });
    updateAvailabilitySummary();
  });
});

bindChipGroup("[data-service]", "service");
bindChipGroup("[data-day]", "day");
bindChipGroup("[data-time]", "time");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setStatus("Please complete the highlighted fields before sending.", "error");
      return;
    }

    const values = Object.fromEntries(new FormData(form).entries());
    const mailtoUrl = composeMailto(values);

    window.location.href = mailtoUrl;
    setStatus(
      "Your email app should open now with your enquiry pre-filled. If it does not, use the email link above.",
      "success"
    );

    form.reset();
    if (serviceSelect) serviceSelect.value = availabilityState.service;
    form.querySelectorAll(".field").forEach((field) => showFieldError(field, false));
  });

  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("blur", validateForm);
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16
    }
  );

  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}

updateContactLinks();
updateAvailabilitySummary();
