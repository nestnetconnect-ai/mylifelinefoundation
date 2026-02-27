/**
 * main.js — My Lifeline Foundation
 * Orchestrates all page-level features:
 *   - Hero particle animation
 *   - Sticky header on scroll
 *   - Mobile nav toggle
 *   - Smooth active nav links
 *   - Impact counter animation (on scroll)
 *   - Gallery modal
 *   - Contact form handler
 *   - Scroll reveal animations
 *   - Footer year
 * Depends on: utils.js, notice-engine.js, volunteer-engine.js, auth.js
 */

window.MLF = window.MLF || {};

/* ====================================================
   HERO PARTICLES
==================================================== */
MLF.HeroParticles = (function () {

  function init() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const count = window.innerWidth < 768 ? 12 : 24;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'hero-particle';

      const size = Math.random() * 12 + 4;
      const left = Math.random() * 100;
      const dur  = Math.random() * 14 + 10;
      const del  = Math.random() * 10;

      p.style.cssText = [
        'width:'           + size + 'px',
        'height:'          + size + 'px',
        'left:'            + left + '%',
        'animation-duration:' + dur + 's',
        'animation-delay:'    + del + 's',
        'opacity:'         + (Math.random() * 0.4 + 0.1)
      ].join(';');

      container.appendChild(p);
    }
  }

  return { init };
})();

/* ====================================================
   STICKY HEADER
==================================================== */
MLF.Header = (function () {

  function init() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const onScroll = MLF.Utils.throttle(function () {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, 80);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  return { init };
})();

/* ====================================================
   MOBILE NAV
==================================================== */
MLF.MobileNav = (function () {

  function init() {
    const burger = document.getElementById('nav-hamburger');
    const links  = document.getElementById('nav-links');
    if (!burger || !links) return;

    burger.addEventListener('click', function () {
      const open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });

    /* Close on link click */
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!burger.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  return { init };
})();

/* ====================================================
   ACTIVE NAV LINK ON SCROLL
==================================================== */
MLF.NavHighlight = (function () {

  function init() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-link');
    if (!sections.length || !links.length) return;

    const onScroll = MLF.Utils.throttle(function () {
      let current = '';
      sections.forEach(function (sec) {
        const offset = sec.getBoundingClientRect().top;
        if (offset <= 100) current = sec.id;
      });
      links.forEach(function (l) {
        l.classList.remove('active');
        if (l.getAttribute('href') === '#' + current) {
          l.classList.add('active');
        }
      });
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  return { init };
})();

/* ====================================================
   IMPACT COUNTERS — animated on scroll
==================================================== */
MLF.Counters = (function () {

  let animated = false;

  const counters = [
    { id: 'counter-volunteers',   target: 5000,  suffix: '+' },
    { id: 'counter-beneficiaries',target: 50000, suffix: '+' },
    { id: 'counter-events',       target: 320,   suffix: '+' },
    { id: 'counter-donations',    target: 75,    suffix: 'L+' }
  ];

  function easeOutQuad(t) { return t * (2 - t); }

  function animateCount(el, target, suffix, duration) {
    const start = performance.now();
    function frame(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuad(progress);
      const current  = Math.floor(eased * target);
      el.textContent = (current >= 1000
        ? (current / 1000).toFixed(current % 1000 === 0 ? 0 : 1) + 'K'
        : current) + (progress >= 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function tryAnimate() {
    if (animated) return;
    const section = document.getElementById('impact');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      animated = true;
      counters.forEach(function (c) {
        const el = document.getElementById(c.id);
        if (el) animateCount(el, c.target, c.suffix, 2200);
      });
    }
  }

  function init() {
    window.addEventListener('scroll', MLF.Utils.throttle(tryAnimate, 100), { passive: true });
    tryAnimate(); /* check immediately in case already in view */
  }

  return { init };
})();

/* ====================================================
   GALLERY MODAL
==================================================== */
MLF.Gallery = (function () {

  const galleryData = [
    { src: 'assets/images/gallery/gallery-1.jpg', caption: 'Education Camp – Koraput, 2025' },
    { src: 'assets/images/gallery/gallery-2.jpg', caption: 'Medical Camp – Kalahandi, 2025' },
    { src: 'assets/images/gallery/gallery-3.jpg', caption: 'Water Project – Mayurbhanj, 2024' },
    { src: 'assets/images/gallery/gallery-4.jpg', caption: 'Volunteer Rally – Bhubaneswar, 2025' },
    { src: 'assets/images/gallery/gallery-5.jpg', caption: 'Skill Training – Sambalpur, 2024' },
    { src: 'assets/images/gallery/gallery-6.jpg', caption: 'Tree Plantation Drive, 2025' }
  ];

  let current = 0;

  function open(index) {
    current = index;
    show(current);
    const modal = document.getElementById('gallery-modal');
    if (modal) modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    const modal = document.getElementById('gallery-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function show(index) {
    const img     = document.getElementById('modal-img');
    const caption = document.getElementById('modal-caption');
    const item    = galleryData[index];
    if (!item) return;
    if (img)     img.src        = item.src;
    if (img)     img.alt        = item.caption;
    if (caption) caption.textContent = item.caption;
    current = index;
  }

  function prev() { show((current - 1 + galleryData.length) % galleryData.length); }
  function next() { show((current + 1) % galleryData.length); }

  function init() {
    const closeBtn = document.getElementById('modal-close');
    const prevBtn  = document.getElementById('modal-prev');
    const nextBtn  = document.getElementById('modal-next');
    const modal    = document.getElementById('gallery-modal');

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn)  prevBtn.addEventListener('click', prev);
    if (nextBtn)  nextBtn.addEventListener('click', next);

    /* Close on backdrop click */
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) close();
      });
    }

    /* Keyboard navigation */
    document.addEventListener('keydown', function (e) {
      const m = document.getElementById('gallery-modal');
      if (!m || !m.classList.contains('open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    });
  }

  return { init, open, close, prev, next };
})();

/* ====================================================
   CONTACT FORM
==================================================== */
MLF.ContactForm = (function () {

  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name    = (document.getElementById('c-name')?.value    || '').trim();
      const email   = (document.getElementById('c-email')?.value   || '').trim();
      const subject = (document.getElementById('c-subject')?.value || '').trim();
      const message = (document.getElementById('c-message')?.value || '').trim();

      if (!name || !email || !message) {
        MLF.Utils.showFeedback('contact-feedback', 'Please fill in all required fields.', 'error', 4000);
        return;
      }
      if (!MLF.Utils.isValidEmail(email)) {
        MLF.Utils.showFeedback('contact-feedback', 'Please enter a valid email address.', 'error', 4000);
        return;
      }

      /* Simulate form submission (no backend in this build) */
      MLF.Utils.showFeedback(
        'contact-feedback',
        '✅ Thank you, ' + name + '! We\'ll get back to you within 2 business days.',
        'success'
      );
      form.reset();
    });
  }

  return { init };
})();

/* ====================================================
   SCROLL REVEAL
==================================================== */
MLF.Reveal = (function () {

  function init() {
    const elements = document.querySelectorAll(
      '.about-grid, .program-card, .counter-card, .value-card, .contact-grid, .vm-card'
    );
    elements.forEach(function (el) { el.classList.add('reveal'); });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  return { init };
})();

/* ====================================================
   FOOTER YEAR
==================================================== */
MLF.Footer = (function () {
  function init() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }
  return { init };
})();

/* ====================================================
   SMOOTH SCROLL for anchor links
==================================================== */
MLF.SmoothScroll = (function () {
  function init() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const headerH = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--header-h')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }
  return { init };
})();

/* ====================================================
   BOOT — initialise all modules when DOM is ready
==================================================== */
document.addEventListener('DOMContentLoaded', function () {

  /* Core UI */
  MLF.HeroParticles.init();
  MLF.Header.init();
  MLF.MobileNav.init();
  MLF.NavHighlight.init();
  MLF.Counters.init();
  MLF.Gallery.init();
  MLF.ContactForm.init();
  MLF.Reveal.init();
  MLF.SmoothScroll.init();
  MLF.Footer.init();

  /* Notice engine (clock + notices) */
  MLF.NoticeEngine.init();

  /* Volunteer + Auth */
  MLF.Auth.init();

  /* Expose Gallery.open globally for inline onclick in HTML */
  window.MLF = window.MLF || {};
});
