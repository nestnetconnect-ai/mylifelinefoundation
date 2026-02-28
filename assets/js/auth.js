/* ============================================================
   AUTH.JS — My Lifeline Foundation
   Volunteer authentication: Login with ID + Mobile
   Session managed via sessionStorage
   ============================================================ */

"use strict";

const MLFAuth = (() => {

  const SESSION_KEY = "mlf_session";

  /* ── Get current session ──────────────────────────────── */
  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  /* ── Save session ─────────────────────────────────────── */
  function saveSession(volunteer) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      volunteerID: volunteer.volunteerID,
      fullName: volunteer.fullName,
      loginTime: new Date().toISOString()
    }));
  }

  /* ── Check if logged in ───────────────────────────────── */
  function isLoggedIn() {
    return getSession() !== null;
  }

  /* ── Login function ───────────────────────────────────── */
  function login(volunteerID, mobile) {
    const volunteer = MLFVolunteerEngine.findByID(volunteerID.toUpperCase().trim());

    if (!volunteer) {
      return { success: false, message: "Volunteer ID not found. Please check and try again." };
    }

    if (volunteer.mobile !== mobile.trim()) {
      return { success: false, message: "Mobile number does not match our records." };
    }

    if (volunteer.status !== "active") {
      return { success: false, message: "Your account is currently inactive. Contact admin." };
    }

    saveSession(volunteer);
    return { success: true, volunteer };
  }

  /* ── Logout ───────────────────────────────────────────── */
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    MLFUtils.showToast("You have been signed out.", "success");

    /* Show auth section, hide dashboard */
    showAuthPanel();
  }

  /* ── Show auth panel ──────────────────────────────────── */
  function showAuthPanel() {
    const authPanel = document.getElementById("auth-panel");
    const dashPanel = document.getElementById("dashboard-panel");
    if (authPanel) authPanel.style.display = "block";
    if (dashPanel) dashPanel.style.display = "none";
    document.getElementById("auth-login-form")?.reset();
  }

  /* ── Show dashboard panel ─────────────────────────────── */
  function showDashboardPanel(volunteer) {
    const authPanel = document.getElementById("auth-panel");
    const dashPanel = document.getElementById("dashboard-panel");
    if (authPanel) authPanel.style.display = "none";
    if (dashPanel) dashPanel.style.display = "block";
    MLFVolunteerEngine.renderDashboard(volunteer);
  }

  /* ── Bind login form ──────────────────────────────────── */
  function bindLoginForm() {
    const form = document.getElementById("auth-login-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const vidInput = form.querySelector("#login-vid");
      const mobileInput = form.querySelector("#login-mobile");

      if (!vidInput.value.trim()) {
        MLFUtils.showToast("Please enter your Volunteer ID.", "error"); return;
      }
      if (!MLFUtils.validateMobile(mobileInput.value)) {
        MLFUtils.showToast("Please enter a valid mobile number.", "error"); return;
      }

      const result = login(vidInput.value, mobileInput.value);

      if (result.success) {
        MLFUtils.showToast(`Welcome back, ${result.volunteer.fullName}! 👋`, "success");
        showDashboardPanel(result.volunteer);
      } else {
        MLFUtils.showToast(result.message, "error");
      }
    });
  }

  /* ── Auto-restore session on page load ───────────────── */
  function restoreSession() {
    const session = getSession();
    if (!session) return false;

    const volunteer = MLFVolunteerEngine.findByID(session.volunteerID);
    if (!volunteer) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }

    showDashboardPanel(volunteer);
    return true;
  }

  /* ── Init ─────────────────────────────────────────────── */
  function init() {
    bindLoginForm();

    /* Tab switching inside volunteer portal */
    const tabBtns = document.querySelectorAll(".portal-tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll(".portal-tab-content").forEach(tc => {
          tc.classList.remove("active");
        });
        const content = document.getElementById(`tab-${target}`);
        if (content) content.classList.add("active");
      });
    });
  }

  /* ── Public API ───────────────────────────────────────── */
  return { getSession, isLoggedIn, login, logout, restoreSession, init, showAuthPanel, showDashboardPanel };

})();
