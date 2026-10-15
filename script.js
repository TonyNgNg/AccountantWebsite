/* =========================================================
   YOUR DETAILS. Edit these here and every page updates.
   - whatsapp: country code + number, digits only (no +, spaces or dashes)
   - display:  how the number is shown on the page
   - email:    leave "" to hide all email links until you have one
   ========================================================= */
const CONFIG = {
  whatsapp: "584248336578",
  display: "+58 424 833 6578",
  email: ""
};

(function () {
  "use strict";

  const DICT = window.I18N;
  const SUPPORTED = ["en", "es"];

  /* ---------- Language: saved choice, else browser language ---------- */
  function initialLang() {
    try {
      const saved = localStorage.getItem("lang");
      if (SUPPORTED.includes(saved)) return saved;
    } catch (e) {}
    return (navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en";
  }
  let lang = initialLang();
  const t = (key) => (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;

  /* ---------- Links ---------- */
  const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

  function setupContactLinks() {
    document.querySelectorAll("[data-phone-text]").forEach((el) => (el.textContent = CONFIG.display));
    document.querySelectorAll("[data-tel-link]").forEach((el) => (el.href = `tel:+${CONFIG.whatsapp}`));
    document.querySelectorAll("[data-email-link]").forEach((el) => {
      if (!CONFIG.email) { el.hidden = true; return; }
      el.href = `mailto:${CONFIG.email}`;
      const inner = el.querySelector("[data-email-text]");
      (inner || el).textContent = CONFIG.email;
    });
  }

  function refreshWhatsAppLinks() {
    document.querySelectorAll("[data-wa]").forEach((el) => {
      el.href = waLink(t(el.dataset.msgKey || "msg.default"));
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  function updateToggleLabel() {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-label", t(menu.classList.contains("open") ? "nav.close" : "nav.open"));
  }
  function setMenu(open) {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    updateToggleLabel();
  }
  if (toggle && menu) {
    toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Apply translations to the whole page ---------- */
  function applyLang() {
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    document.querySelectorAll("[data-i18n-html]").forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });

    document.querySelectorAll("[data-lang]").forEach((btn) =>
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang))
    );

    refreshWhatsAppLinks();
    updateToggleLabel();
    document.documentElement.classList.remove("t-wait");
  }

  function setLang(next) {
    if (!SUPPORTED.includes(next) || next === lang) return;
    lang = next;
    try { localStorage.setItem("lang", lang); } catch (e) {}
    applyLang();
  }

  document.querySelectorAll("[data-lang]").forEach((btn) =>
    btn.addEventListener("click", () => setLang(btn.dataset.lang))
  );

  /* ---------- Contact form -> opens WhatsApp with a ready message ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const nameInput = document.getElementById("name");
    const serviceSelect = document.getElementById("service");
    const messageInput = document.getElementById("message");
    const error = document.getElementById("form-error");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) {
        error.hidden = false;
        nameInput.focus();
        return;
      }
      error.hidden = true;
      const service = serviceSelect.options[serviceSelect.selectedIndex].textContent;
      const extra = messageInput.value.trim();
      const text =
        t("msg.form").replace("{name}", name).replace("{service}", service) +
        (extra ? `\n\n${extra}` : "");
      window.open(waLink(text), "_blank", "noopener");
    });
  }

  /* ---------- Init ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
  setupContactLinks();
  applyLang();
})();
