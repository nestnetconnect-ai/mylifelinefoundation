/* ============================================================
   UTILS.JS — My Lifeline Foundation
   Shared utility functions used across all modules
   ============================================================ */

"use strict";

const MLFUtils = (() => {

  /* ── ID Generator ─────────────────────────────────────── */
  function generateVolunteerID() {
    const volunteers = JSON.parse(localStorage.getItem("mlf_volunteers") || "[]");
    const count = volunteers.length + 1;
    return "MLF-OD-" + String(count).padStart(5, "0");
  }

  /* ── Mask Aadhaar ─────────────────────────────────────── */
  function maskAadhaar(aadhaar) {
    if (!aadhaar || aadhaar.length < 4) return "XXXX-XXXX-XXXX";
    const clean = aadhaar.replace(/\D/g, "");
    return "XXXX-XXXX-" + clean.slice(-4);
  }

  /* ── Format Date ──────────────────────────────────────── */
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  /* ── Calculate Age ────────────────────────────────────── */
  function calculateAge(dobStr) {
    if (!dobStr) return 0;
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  /* ── Check if Today is Birthday ───────────────────────── */
  function isBirthdayToday(dobStr) {
    if (!dobStr) return false;
    const dob = new Date(dobStr);
    const today = new Date();
    return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
  }

  /* ── Sanitize Input ───────────────────────────────────── */
  function sanitize(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str || ""));
    return div.innerHTML;
  }

  /* ── Show Toast Notification ──────────────────────────── */
  function showToast(message, type = "success") {
    const existing = document.querySelector(".mlf-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `mlf-toast mlf-toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("mlf-toast--visible"));
    setTimeout(() => {
      toast.classList.remove("mlf-toast--visible");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  /* ── Validate Mobile ──────────────────────────────────── */
  function validateMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ""));
  }

  /* ── Validate Email ───────────────────────────────────── */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ── Validate Aadhaar ─────────────────────────────────── */
  function validateAadhaar(aadhaar) {
    return /^\d{12}$/.test(aadhaar.replace(/\s|-/g, ""));
  }

  /* ── Animated Counter ─────────────────────────────────── */
  function animateCounter(el, target, duration = 2000) {
    const start = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString("en-IN");
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  /* ── IntersectionObserver for counters ───────────────── */
  function observeCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = "true";
          animateCounter(entry.target, parseInt(entry.target.dataset.count));
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => observer.observe(c));
  }

  /* ── Scroll Active Nav ────────────────────────────────── */
  function initScrollSpy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav__link");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove("active"));
          const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
          if (active) active.classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -60% 0px" });

    sections.forEach(s => observer.observe(s));
  }

  /* ── Read File as DataURL ─────────────────────────────── */
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ── Debounce ─────────────────────────────────────────── */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ── Public API ───────────────────────────────────────── */
  return {
    generateVolunteerID,
    maskAadhaar,
    formatDate,
    calculateAge,
    isBirthdayToday,
    sanitize,
    showToast,
    validateMobile,
    validateEmail,
    validateAadhaar,
    observeCounters,
    initScrollSpy,
    readFileAsDataURL,
    debounce
  };

})();
