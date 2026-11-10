/* =========================================================
   GreenLoop — script.js
   Handles: mobile nav toggle, animated stat counters,
   featured event rendering, event filtering/search,
   registration form validation, character counter.
   ========================================================= */

"use strict";

/* ---------- Shared data (arrays + objects) ---------- */
const EVENTS = [
  { id: 1, title: "Riverside Litter Pick", location: "Riverside", date: "2025-07-12", time: "09:00", difficulty: "Easy",     description: "Family-friendly pick along the river path." },
  { id: 2, title: "City Centre Clean Sweep", location: "City Centre", date: "2025-07-19", time: "10:00", difficulty: "Moderate", description: "Focus on the high street and market square." },
  { id: 3, title: "North Park Tidy-Up", location: "North Park", date: "2025-07-26", time: "08:30", difficulty: "Easy", description: "Paths, playgrounds and picnic areas." },
  { id: 4, title: "Harbour Beach Clean", location: "Harbour", date: "2025-08-02", time: "07:30", difficulty: "Challenging", description: "Beach and shoreline clean, gloves provided." },
  { id: 5, title: "Riverside Second Pass", location: "Riverside", date: "2025-08-09", time: "09:30", difficulty: "Moderate", description: "Follow-up clean after summer events." },
  { id: 6, title: "North Park Family Morning", location: "North Park", date: "2025-08-16", time: "10:00", difficulty: "Easy", description: "Short session for families with young children." }
];

const STATS = { bags: 1240, volunteers: 318 };

/* ---------- Helpers ---------- */
function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function createEventCard(ev) {
  const article = document.createElement("article");
  article.className = "event-card";
  article.innerHTML = `
    <div class="event-top">
      <p class="event-location">${ev.location}</p>
      <h3 class="event-title">${ev.title}</h3>
      <p class="event-meta">${formatDate(ev.date)} · ${ev.time}</p>
      <span class="badge">${ev.difficulty}</span>
      <p class="event-meta" style="margin-top:.6rem">${ev.description}</p>
    </div>
    <div class="event-bottom">
      <a class="btn btn-primary" href="register.html?event=${ev.id}">Register</a>
    </div>
  `;
  return article;
}

/* ---------- Mobile nav toggle ---------- */
function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu after clicking a link (mobile UX)
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------- Animated stat counters (home page) ---------- */
function initStatCounters() {
  const bagsEl = document.getElementById("statBags");
  const volEl = document.getElementById("statVolunteers");
  if (!bagsEl || !volEl) return;

  const animate = (el, target) => {
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  animate(bagsEl, STATS.bags);
  animate(volEl, STATS.volunteers);
}

/* ---------- Home: featured events (first 3) ---------- */
function initFeaturedEvents() {
  const container = document.getElementById("featuredEvents");
  if (!container) return;
  EVENTS.slice(0, 3).forEach((ev) => container.appendChild(createEventCard(ev)));
}

/* ---------- Events page: filter + search ---------- */
function initEventFilter() {
  const grid = document.getElementById("eventGrid");
  if (!grid) return;

  const searchInput = document.getElementById("searchInput");
  const locationSelect = document.getElementById("locationSelect");
  const difficultySelect = document.getElementById("difficultySelect");
  const resultCount = document.getElementById("resultCount");
  const emptyState = document.getElementById("emptyState");

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const location = locationSelect.value;
    const difficulty = difficultySelect.value;

    const filtered = EVENTS.filter((ev) => {
      const matchesQuery =
        ev.title.toLowerCase().includes(query) ||
        ev.description.toLowerCase().includes(query);
      const matchesLocation = location === "all" || ev.location === location;
      const matchesDifficulty = difficulty === "all" || ev.difficulty === difficulty;
      return matchesQuery && matchesLocation && matchesDifficulty;
    });

    grid.innerHTML = "";
    filtered.forEach((ev) => grid.appendChild(createEventCard(ev)));

    resultCount.textContent = `${filtered.length} event${filtered.length === 1 ? "" : "s"} found`;
    emptyState.hidden = filtered.length !== 0;
  }

  // Event listeners for live filtering
  searchInput.addEventListener("input", render);
  locationSelect.addEventListener("change", render);
  difficultySelect.addEventListener("change", render);

  render(); // initial paint
}

/* ---------- Register page ---------- */
function initRegisterPage() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const eventSelect = document.getElementById("eventSelect");
  const peopleInput = document.getElementById("people");
  const messageInput = document.getElementById("message");
  const charCount = document.getElementById("charCount");
  const success = document.getElementById("formSuccess");

  /* Populate event dropdown from data */
  EVENTS.forEach((ev) => {
    const opt = document.createElement("option");
    opt.value = ev.id;
    opt.textContent = `${ev.title} — ${formatDate(ev.date)}`;
    eventSelect.appendChild(opt);
  });

  /* Pre-select event from ?event=ID in URL */
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get("event");
  if (preselect) eventSelect.value = preselect;

  /* Character counter for message */
  if (messageInput && charCount) {
    messageInput.addEventListener("input", () => {
      charCount.textContent = messageInput.value.length;
    });
  }

  /* Per-field error helpers */
  const setError = (field, message) => {
    const input = document.getElementById(field);
    const errorEl = document.getElementById(field + "Error");
    if (input) {
      input.classList.toggle("invalid", Boolean(message));
      input.setAttribute("aria-invalid", String(Boolean(message)));
    }
    if (errorEl) errorEl.textContent = message;
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validate() {
    let valid = true;

    const fullName = document.getElementById("fullName").value.trim();
    if (fullName.length < 2) {
      setError("fullName", "Please enter your full name (at least 2 characters).");
      valid = false;
    } else setError("fullName", "");

    const email = document.getElementById("email").value.trim();
    if (!emailPattern.test(email)) {
      setError("email", "Please enter a valid email address.");
      valid = false;
    } else setError("email", "");

    const phone = document.getElementById("phone").value.trim();
    const phonePattern = /^[0-9+\s()-]{7,15}$/;
    if (phone && !phonePattern.test(phone)) {
      setError("phone", "Phone must be 7–15 characters (digits, spaces, +, -, brackets).");
      valid = false;
    } else setError("phone", "");

    if (!eventSelect.value) {
      setError("eventSelect", "Please choose an event.");
      valid = false;
    } else setError("eventSelect", "");

    const people = Number(peopleInput.value);
    if (!Number.isInteger(people) || people < 1 || people > 10) {
      setError("people", "Please enter a whole number between 1 and 10.");
      valid = false;
    } else setError("people", "");

    const consent = document.getElementById("consent");
    if (!consent.checked) {
      setError("consent", "You must agree to be contacted to register.");
      valid = false;
    } else setError("consent", "");

    return valid;
  }

  /* Live validation for better UX */
  ["fullName", "email", "phone", "eventSelect", "people", "consent"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const evt = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => {
      // re-run the whole validation but only clear/set relevant errors
      validate();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    success.hidden = true;

    if (!validate()) {
      // Focus first invalid field for accessibility
      const firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const chosen = EVENTS.find((ev) => String(ev.id) === eventSelect.value);
    const name = document.getElementById("fullName").value.trim();
    success.textContent = `Thank you, ${name}! You're registered for "${chosen.title}" on ${formatDate(chosen.date)}. A confirmation has been noted (demo only).`;
    success.hidden = false;

    form.reset();
    charCount.textContent = "0";
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ---------- Footer year ---------- */
function initYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initStatCounters();
  initFeaturedEvents();
  initEventFilter();
  initRegisterPage();
  initYear();
});