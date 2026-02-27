/**
 * auth.js — My Lifeline Foundation
 * Handles:
 *   - Volunteer registration form submission
 *   - Login (Volunteer ID + Mobile)
 *   - Session management via sessionStorage
 *   - Dashboard population
 *   - Tab switching
 * Depends on: utils.js, volunteer-engine.js, qr.js
 * Exposed as MLF.Auth
 */

window.MLF = window.MLF || {};

MLF.Auth = (function () {

  /* ---- Session key ---- */
  const SESSION_KEY = 'mlf_current_vol';

  /* ====================================================
     Session Helpers
  ==================================================== */

  function setSession(volunteer) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(volunteer));
    } catch (e) {
      console.warn('Auth: sessionStorage write failed', e);
    }
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.warn('Auth: sessionStorage clear failed', e);
    }
  }

  /* ====================================================
     Tab / Panel Switching
  ==================================================== */

  function showPanel(panelName) {
    const panels = ['register', 'login', 'dashboard'];
    panels.forEach(function (name) {
      const panel = document.getElementById('panel-' + name);
      const tab   = document.getElementById('tab-' + name);
      if (panel) panel.classList.toggle('hidden', name !== panelName);
      if (tab)   tab.classList.toggle('active',   name === panelName);
    });
  }

  function switchTab(panelName) {
    /* Reveal dashboard tab only when logged in */
    const dashTab = document.getElementById('tab-dashboard');
    if (dashTab) {
      dashTab.style.display = (getSession() !== null) ? '' : 'none';
    }
    showPanel(panelName);
  }

  function bindTabs() {
    ['register', 'login', 'dashboard'].forEach(function (name) {
      const tab = document.getElementById('tab-' + name);
      if (tab) {
        tab.addEventListener('click', function () {
          switchTab(name);
        });
      }
    });
  }

  /* ====================================================
     Dashboard Population
  ==================================================== */

  function formatDOB(dob) {
    if (!dob) return '—';
    const d = new Date(dob);
    return MLF.Utils.padNum(d.getDate(), 2) + '/' +
           MLF.Utils.padNum(d.getMonth() + 1, 2) + '/' +
           d.getFullYear();
  }

  function populateDashboard(vol) {
    /* Main profile */
    const set = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '—';
    };

    const photo = vol.photo || 'assets/images/default-avatar.png';
    const dashPhoto = document.getElementById('dash-photo');
    if (dashPhoto) dashPhoto.src = photo;

    set('dash-name',     vol.fullName);
    set('dash-id',       vol.volunteerId);
    set('dash-email',    vol.email);
    set('dash-mobile',   vol.mobile);
    set('dash-district', vol.district);
    set('dash-dob',      formatDOB(vol.dob));
    set('dash-aadhaar',  MLF.Utils.maskAadhaar(vol.aadhaar));

    /* Joined date */
    if (vol.registeredOn) {
      const joined = new Date(vol.registeredOn);
      set('dash-joined', MLF.Utils.formatDate(joined));
    }

    /* ID Card fields */
    const cardPhoto = document.getElementById('card-photo');
    if (cardPhoto) cardPhoto.src = photo;
    set('card-name',     vol.fullName);
    set('card-id',       vol.volunteerId);
    set('card-district', vol.district);
    set('card-mobile',   vol.mobile);
    set('card-valid',    new Date().getFullYear());
  }

  /* ====================================================
     Registration Form Handler
  ==================================================== */

  function bindRegistration() {
    const form = document.getElementById('vol-register-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = document.getElementById('btn-register');
      if (btn) { btn.disabled = true; btn.textContent = 'Registering…'; }

      try {
        const volunteer = await MLF.VolunteerEngine.register();

        if (!volunteer) {
          if (btn) { btn.disabled = false; btn.textContent = 'Register as Volunteer'; }
          return;
        }

        MLF.Utils.showFeedback(
          'register-feedback',
          '✅ Registration successful! Your Volunteer ID is ' + volunteer.volunteerId +
          '. Please note it for login.',
          'success'
        );

        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = 'Register as Volunteer'; }

        /* Auto-login after registration */
        setTimeout(function () {
          setSession(volunteer);
          populateDashboard(volunteer);
          const dashTab = document.getElementById('tab-dashboard');
          if (dashTab) dashTab.style.display = '';
          switchTab('dashboard');
        }, 2500);

      } catch (err) {
        MLF.Utils.showFeedback('register-feedback', '❌ Error: ' + err.message, 'error', 6000);
        if (btn) { btn.disabled = false; btn.textContent = 'Register as Volunteer'; }
      }
    });
  }

  /* ====================================================
     Login Form Handler
  ==================================================== */

  function bindLogin() {
    const form = document.getElementById('vol-login-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const inputId     = (document.getElementById('login-id')?.value || '').trim().toUpperCase();
      const inputMobile = (document.getElementById('login-mobile')?.value || '').trim();

      if (!inputId || !inputMobile) {
        MLF.Utils.showFeedback('login-feedback', 'Please enter both Volunteer ID and Mobile.', 'error', 4000);
        return;
      }

      const volunteer = MLF.VolunteerEngine.getById(inputId);

      if (!volunteer) {
        MLF.Utils.showFeedback('login-feedback', '❌ Volunteer ID not found.', 'error', 4000);
        return;
      }

      if (volunteer.mobile !== inputMobile) {
        MLF.Utils.showFeedback('login-feedback', '❌ Mobile number does not match.', 'error', 4000);
        return;
      }

      /* Successful login */
      setSession(volunteer);
      populateDashboard(volunteer);
      const dashTab = document.getElementById('tab-dashboard');
      if (dashTab) dashTab.style.display = '';
      switchTab('dashboard');
      form.reset();
    });
  }

  /* ====================================================
     Logout
  ==================================================== */

  function bindLogout() {
    const btn = document.getElementById('btn-logout');
    if (!btn) return;
    btn.addEventListener('click', function () {
      clearSession();
      const dashTab = document.getElementById('tab-dashboard');
      if (dashTab) dashTab.style.display = 'none';
      /* Hide ID card if open */
      const idSec = document.getElementById('id-card-section');
      if (idSec) idSec.style.display = 'none';
      switchTab('login');
    });
  }

  /* ====================================================
     Generate ID Card Button
  ==================================================== */

  function bindGenerateId() {
    const btn = document.getElementById('btn-gen-id');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const vol = getSession();
      if (!vol) return;

      const idSec = document.getElementById('id-card-section');
      if (idSec) {
        idSec.style.display = 'block';
        idSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      /* Generate QR code */
      if (MLF.QR) {
        MLF.QR.generateForVolunteer(vol);
      }
    });
  }

  /* ====================================================
     Print ID Card
  ==================================================== */

  function bindPrint() {
    const btn = document.getElementById('btn-print-id');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.print();
    });
  }

  /* ====================================================
     Restore Session on Page Load
  ==================================================== */

  function restoreSession() {
    const vol = getSession();
    if (vol) {
      populateDashboard(vol);
      const dashTab = document.getElementById('tab-dashboard');
      if (dashTab) dashTab.style.display = '';
      switchTab('dashboard');
    }
  }

  /* ====================================================
     Init
  ==================================================== */

  function init() {
    bindTabs();
    bindRegistration();
    bindLogin();
    bindLogout();
    bindGenerateId();
    bindPrint();
    restoreSession();
  }

  /* ---- Public API ---- */
  return {
    init,
    getSession,
    setSession,
    clearSession,
    populateDashboard
  };

})();
