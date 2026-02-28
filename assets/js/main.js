/* ============================================================
   MAIN.JS — My Lifeline Foundation
   Application entry point — initializes all modules
   Handles: nav, modals, gallery, contact form, animations
   ============================================================ */

"use strict";

/* ── Wait for DOM ready ───────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initHeroParticles();
  initGallery();
  initContactForm();
  initModals();
  initScrollAnimations();
  MLFUtils.observeCounters();
  MLFUtils.initScrollSpy();
  MLFNoticeEngine.init();
  MLFVolunteerEngine.bindRegistrationForm();
  MLFAuth.init();

  /* Restore session if previously logged in */
  const hasSession = MLFAuth.restoreSession();
  if (!hasSession) {
    MLFAuth.showAuthPanel();
  }

  /* Smooth anchor scroll for hero buttons */
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});

/* ── Navigation ───────────────────────────────────────────── */
function initNavigation() {
  const nav = document.querySelector(".nav");
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.querySelector(".nav__menu");

  /* Sticky nav on scroll */
  window.addEventListener("scroll", MLFUtils.debounce(() => {
    if (window.scrollY > 80) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }
  }, 10));

  /* Hamburger toggle */
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("nav__menu--open");
      document.body.classList.toggle("body--nav-open");
    });
  }

  /* Close menu on link click */
  document.querySelectorAll(".nav__link").forEach(link => {
    link.addEventListener("click", () => {
      hamburger?.classList.remove("active");
      navMenu?.classList.remove("nav__menu--open");
      document.body.classList.remove("body--nav-open");
    });
  });
}

/* ── Hero Particle Animation ──────────────────────────────── */
function initHeroParticles() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let animFrame;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.2,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.7 ? "#f4821e" : "#7090b0"
    };
  }

  function initParticles() {
    particles = Array.from({ length: 80 }, createParticle);
  }

  function drawLines(p) {
    particles.forEach(other => {
      const dx = p.x - other.x;
      const dy = p.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(112, 144, 176, ${0.08 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;

      drawLines(p);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    animFrame = requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();
  window.addEventListener("resize", () => { resize(); initParticles(); });
}

/* ── Gallery ──────────────────────────────────────────────── */
function initGallery() {
  const galleryItems = document.querySelectorAll(".gallery__item");
  const modal = document.getElementById("gallery-modal");
  const modalImg = document.getElementById("gallery-modal-img");
  const modalClose = document.getElementById("gallery-modal-close");
  const modalCaption = document.getElementById("gallery-modal-caption");

  if (!galleryItems.length || !modal) return;

  galleryItems.forEach(item => {
    item.addEventListener("click", () => {
      const src = item.querySelector("img").src;
      const caption = item.dataset.caption || "";
      modalImg.src = src;
      modalCaption.textContent = caption;
      modal.classList.add("modal--active");
      document.body.classList.add("body--modal-open");
    });
  });

  function closeGalleryModal() {
    modal.classList.remove("modal--active");
    document.body.classList.remove("body--modal-open");
  }

  if (modalClose) modalClose.addEventListener("click", closeGalleryModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeGalleryModal();
  });
}

/* ── Contact Form ─────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.querySelector("#contact-name").value.trim();
    const email = form.querySelector("#contact-email").value.trim();
    const subject = form.querySelector("#contact-subject").value.trim();
    const message = form.querySelector("#contact-message").value.trim();

    if (!name || name.length < 2) {
      MLFUtils.showToast("Please enter your name.", "error"); return;
    }
    if (!MLFUtils.validateEmail(email)) {
      MLFUtils.showToast("Please enter a valid email.", "error"); return;
    }
    if (!message || message.length < 10) {
      MLFUtils.showToast("Please write a message (min 10 characters).", "error"); return;
    }

    const btn = form.querySelector(".contact-submit-btn");
    btn.textContent = "Sending...";
    btn.disabled = true;

    /* Simulate async send */
    setTimeout(() => {
      MLFUtils.showToast("✅ Message sent! We'll respond within 24 hours.", "success");
      form.reset();
      btn.textContent = "Send Message";
      btn.disabled = false;
    }, 1200);
  });
}

/* ── Modals (generic open/close) ─────────────────────────── */
function initModals() {
  /* Close buttons for all modals */
  document.querySelectorAll(".modal-close, .modal__backdrop").forEach(el => {
    el.addEventListener("click", (e) => {
      const modal = el.closest(".modal") || document.querySelector(".modal--active");
      if (modal) {
        modal.classList.remove("modal--active");
        document.body.classList.remove("body--modal-open");
      }
    });
  });

  /* Close reg success modal */
  const successClose = document.getElementById("reg-success-close");
  if (successClose) {
    successClose.addEventListener("click", () => {
      document.getElementById("reg-success-modal").classList.remove("modal--active");
      document.body.classList.remove("body--modal-open");

      /* Switch to login tab */
      const loginTab = document.querySelector('[data-tab="login"]');
      if (loginTab) loginTab.click();
    });
  }

  /* Escape key closes any open modal */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal--active").forEach(m => {
        m.classList.remove("modal--active");
      });
      document.body.classList.remove("body--modal-open");
    }
  });

  /* Volunteer portal open button */
  const portalBtns = document.querySelectorAll("[data-open-portal]");
  portalBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const section = document.getElementById("volunteer");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* ── Scroll Animations (reveal on scroll) ─────────────────── */
function initScrollAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal--visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  elements.forEach(el => observer.observe(el));
}
