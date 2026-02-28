/* ============================================================
   CALENDAR-2026.JS — My Lifeline Foundation
   2026 Odisha + National Festival & Holiday Calendar
   Used by notice-engine.js for auto festival notices
   ============================================================ */

"use strict";

const MLFCalendar2026 = (() => {

  /* ── Event list: { date: "MM-DD", name, type } ────────── */
  const events = [
    /* ── January ─────────────────────────────────────────── */
    { date: "01-01", name: "New Year's Day", type: "national" },
    { date: "01-06", name: "Makar Sankranti / Pongal", type: "odisha" },
    { date: "01-14", name: "Makar Mela — Sagar Island", type: "odisha" },
    { date: "01-23", name: "Netaji Subhas Chandra Bose Jayanti", type: "national" },
    { date: "01-26", name: "Republic Day 🇮🇳", type: "national" },

    /* ── February ─────────────────────────────────────────── */
    { date: "02-14", name: "Valentine's Day", type: "general" },
    { date: "02-19", name: "Shivratri", type: "odisha" },

    /* ── March ───────────────────────────────────────────── */
    { date: "03-08", name: "International Women's Day", type: "national" },
    { date: "03-20", name: "Holi — Festival of Colours", type: "national" },
    { date: "03-21", name: "Dol Purnima (Odisha Holi)", type: "odisha" },
    { date: "03-22", name: "World Water Day", type: "general" },

    /* ── April ───────────────────────────────────────────── */
    { date: "04-01", name: "Odisha Foundation Day 🌸", type: "odisha" },
    { date: "04-05", name: "Ram Navami", type: "national" },
    { date: "04-10", name: "Good Friday", type: "national" },
    { date: "04-14", name: "Ambedkar Jayanti / Vishu", type: "national" },
    { date: "04-15", name: "Odia New Year (Pana Sankranti)", type: "odisha" },

    /* ── May ─────────────────────────────────────────────── */
    { date: "05-01", name: "Labour Day / Akshaya Tritiya", type: "national" },
    { date: "05-07", name: "Rabindranath Tagore Jayanti", type: "national" },
    { date: "05-23", name: "Buddha Purnima", type: "national" },

    /* ── June ────────────────────────────────────────────── */
    { date: "06-01", name: "Rath Yatra Preparation Begins", type: "odisha" },
    { date: "06-12", name: "Raja Parba (Odisha Women's Festival)", type: "odisha" },
    { date: "06-21", name: "International Yoga Day", type: "national" },

    /* ── July ────────────────────────────────────────────── */
    { date: "07-01", name: "Rath Yatra — Puri Chariot Festival 🛕", type: "odisha" },
    { date: "07-10", name: "Bahuda Yatra (Return Chariot)", type: "odisha" },

    /* ── August ──────────────────────────────────────────── */
    { date: "08-05", name: "Nag Panchami", type: "national" },
    { date: "08-08", name: "Raksha Bandhan", type: "national" },
    { date: "08-15", name: "Independence Day 🇮🇳", type: "national" },
    { date: "08-19", name: "Janmashtami", type: "national" },
    { date: "08-22", name: "Nuakhai Juhar (Odisha Harvest Festival) 🌾", type: "odisha" },

    /* ── September ───────────────────────────────────────── */
    { date: "09-07", name: "Ganesh Chaturthi", type: "national" },
    { date: "09-17", name: "Vishwakarma Puja", type: "odisha" },
    { date: "09-25", name: "Kumar Purnima", type: "odisha" },

    /* ── October ─────────────────────────────────────────── */
    { date: "10-02", name: "Gandhi Jayanti 🕊️", type: "national" },
    { date: "10-09", name: "Navratri Begins", type: "national" },
    { date: "10-18", name: "Dussehra / Durga Puja 🪔", type: "national" },
    { date: "10-20", name: "Laxmi Puja (Odisha)", type: "odisha" },
    { date: "10-31", name: "Diwali / Kali Puja", type: "national" },

    /* ── November ────────────────────────────────────────── */
    { date: "11-02", name: "Diwali — Festival of Lights 🪔", type: "national" },
    { date: "11-05", name: "Bhai Dooj / Bhau Beej", type: "national" },
    { date: "11-14", name: "Children's Day", type: "national" },
    { date: "11-19", name: "Karthik Purnima / Dev Deepawali", type: "odisha" },
    { date: "11-24", name: "Guru Nanak Jayanti", type: "national" },

    /* ── December ────────────────────────────────────────── */
    { date: "12-01", name: "World AIDS Day", type: "general" },
    { date: "12-10", name: "Human Rights Day", type: "general" },
    { date: "12-25", name: "Christmas Day 🎄", type: "national" },
    { date: "12-31", name: "New Year's Eve", type: "general" },
  ];

  /* ── Get today's events ───────────────────────────────── */
  function getTodayEvents() {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const key = `${mm}-${dd}`;
    return events.filter(e => e.date === key);
  }

  /* ── Get upcoming events (next N days) ───────────────── */
  function getUpcomingEvents(days = 7) {
    const today = new Date();
    const upcoming = [];

    for (let i = 1; i <= days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const key = `${mm}-${dd}`;
      const found = events.filter(e => e.date === key);
      if (found.length) upcoming.push(...found.map(e => ({ ...e, daysAway: i })));
    }

    return upcoming;
  }

  /* ── Get all events ───────────────────────────────────── */
  function getAllEvents() {
    return events;
  }

  /* ── Public API ───────────────────────────────────────── */
  return { getTodayEvents, getUpcomingEvents, getAllEvents };

})();
