/* ============================================================
   NOTICE-ENGINE.JS — My Lifeline Foundation
   Floating notice widget: Live clock, rotating notices
   Priority: Festival > Birthday > Manual
   ============================================================ */

"use strict";

const MLFNoticeEngine = (() => {

  /* ── Manual Notices Array ────────────────────────────── */
  const manualNotices = [
    "🌟 Welcome to My Lifeline Foundation — Empowering Communities since 2018",
    "📋 Volunteer Registration is OPEN for 2026. Join our mission today!",
    "🎓 Education Scholarship Program: Applications open until Jan 31, 2026",
    "🏥 Free Health Camp at Bhubaneswar — Register by calling +91 98765 43210",
    "🌾 Rural Development Drive — Koraput District, Feb 2026. Volunteers needed!",
    "💧 Clean Water Initiative: 50 new villages targeted for 2026",
    "📣 Annual NGO Report 2025 is now available. Download from our portal.",
    "🤝 CSR Partnership Opportunities — Contact us at mlf@lifeline.org",
    "🏆 MLF wins 'Best NGO of the Year 2025' — Odisha State Award",
    "🎯 Goal 2026: Reach 10,000+ beneficiaries across Odisha",
  ];

  /* ── State ───────────────────────────────────────────── */
  let allNotices = [];
  let currentIndex = 0;
  let noticeInterval = null;
  let clockInterval = null;

  /* ── Build notice pool with priorities ───────────────── */
  function buildNoticePool() {
    allNotices = [];

    /* Priority 1 — Festival notices */
    const todayEvents = MLFCalendar2026.getTodayEvents();
    todayEvents.forEach(ev => {
      allNotices.push({
        text: `🎉 Today is ${ev.name}! Warm wishes from the entire MLF team.`,
        priority: 1,
        type: "festival"
      });
    });

    /* Upcoming festivals (next 3 days) */
    const upcoming = MLFCalendar2026.getUpcomingEvents(3);
    upcoming.forEach(ev => {
      const dayLabel = ev.daysAway === 1 ? "Tomorrow" : `In ${ev.daysAway} days`;
      allNotices.push({
        text: `📅 ${dayLabel}: ${ev.name} — Advance wishes from MLF!`,
        priority: 1,
        type: "festival"
      });
    });

    /* Priority 2 — Birthday notices */
    const volunteers = JSON.parse(localStorage.getItem("mlf_volunteers") || "[]");
    volunteers.forEach(v => {
      if (MLFUtils.isBirthdayToday(v.dob)) {
        allNotices.push({
          text: `🎂 Happy Birthday, ${v.fullName}! (${v.volunteerID}) — MLF family wishes you joy & health!`,
          priority: 2,
          type: "birthday"
        });
      }
    });

    /* Priority 3 — Manual notices */
    manualNotices.forEach(text => {
      allNotices.push({ text, priority: 3, type: "manual" });
    });

    /* Sort by priority */
    allNotices.sort((a, b) => a.priority - b.priority);
  }

  /* ── Update clock display ─────────────────────────────── */
  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();

    const timeEl = document.getElementById("notice-time");
    const dateEl = document.getElementById("notice-date");
    if (timeEl) timeEl.textContent = `${hh}:${mm}:${ss}`;
    if (dateEl) dateEl.textContent = `${dd}/${mo}/${yyyy}`;
  }

  /* ── Rotate notices ───────────────────────────────────── */
  function rotateNotice() {
    if (!allNotices.length) return;
    const el = document.getElementById("notice-text");
    if (!el) return;

    el.classList.remove("notice-text--visible");
    el.classList.add("notice-text--hidden");

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % allNotices.length;
      el.textContent = allNotices[currentIndex].text;
      el.classList.remove("notice-text--hidden");
      el.classList.add("notice-text--visible");
    }, 400);
  }

  /* ── Toggle widget open/close ─────────────────────────── */
  function toggleWidget() {
    const widget = document.getElementById("notice-widget");
    if (!widget) return;
    widget.classList.toggle("notice-widget--open");
  }

  /* ── Create widget DOM ────────────────────────────────── */
  function createWidget() {
    const widget = document.createElement("div");
    widget.id = "notice-widget";
    widget.className = "notice-widget";

    widget.innerHTML = `
      <button class="notice-toggle" id="notice-toggle-btn" aria-label="Toggle notices">
        <span class="notice-toggle__icon">📢</span>
        <span class="notice-badge" id="notice-badge">${allNotices.length}</span>
      </button>
      <div class="notice-panel">
        <div class="notice-panel__header">
          <div class="notice-clock">
            <span class="notice-clock__time" id="notice-time">00:00:00</span>
            <span class="notice-clock__date" id="notice-date">00/00/0000</span>
          </div>
          <button class="notice-close" id="notice-close-btn" aria-label="Close">✕</button>
        </div>
        <div class="notice-panel__body">
          <div class="notice-label">📋 Live Notice Board</div>
          <div class="notice-text notice-text--visible" id="notice-text">Loading notices...</div>
          <div class="notice-dots" id="notice-dots"></div>
        </div>
        <div class="notice-panel__footer">
          <span>${allNotices.length} active notice${allNotices.length !== 1 ? "s" : ""}</span>
          <button class="notice-nav notice-nav--prev" id="notice-prev">‹</button>
          <button class="notice-nav notice-nav--next" id="notice-next">›</button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    /* Bind events */
    document.getElementById("notice-toggle-btn").addEventListener("click", toggleWidget);
    document.getElementById("notice-close-btn").addEventListener("click", toggleWidget);

    document.getElementById("notice-prev").addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + allNotices.length) % allNotices.length;
      showNoticeAt(currentIndex);
    });

    document.getElementById("notice-next").addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % allNotices.length;
      showNoticeAt(currentIndex);
    });
  }

  /* ── Show notice at index ─────────────────────────────── */
  function showNoticeAt(index) {
    const el = document.getElementById("notice-text");
    if (!el || !allNotices.length) return;
    el.textContent = allNotices[index].text;
  }

  /* ── Initialize Engine ────────────────────────────────── */
  function init() {
    buildNoticePool();
    createWidget();
    updateClock();

    /* Set first notice */
    const el = document.getElementById("notice-text");
    if (el && allNotices.length) {
      el.textContent = allNotices[0].text;
    }

    /* Start clock */
    clockInterval = setInterval(updateClock, 1000);

    /* Rotate every 6 seconds */
    noticeInterval = setInterval(rotateNotice, 6000);
  }

  /* ── Refresh (call after volunteer register/login) ────── */
  function refresh() {
    buildNoticePool();
    const badge = document.getElementById("notice-badge");
    if (badge) badge.textContent = allNotices.length;
    if (allNotices.length) showNoticeAt(0);
    currentIndex = 0;
  }

  /* ── Public API ───────────────────────────────────────── */
  return { init, refresh, toggleWidget };

})();
