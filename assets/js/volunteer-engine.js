/* ============================================================
   VOLUNTEER-ENGINE.JS — My Lifeline Foundation
   Volunteer registration, data management, ID card print
   Storage: localStorage key "mlf_volunteers"
   ============================================================ */

"use strict";

const MLFVolunteerEngine = (() => {

  const STORAGE_KEY = "mlf_volunteers";

  /* ── Get all volunteers ───────────────────────────────── */
  function getAllVolunteers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }

  /* ── Save volunteers array ────────────────────────────── */
  function saveVolunteers(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  /* ── Find volunteer by ID ─────────────────────────────── */
  function findByID(volunteerID) {
    return getAllVolunteers().find(v => v.volunteerID === volunteerID) || null;
  }

  /* ── Find by mobile ───────────────────────────────────── */
  function findByMobile(mobile) {
    return getAllVolunteers().find(v => v.mobile === mobile) || null;
  }

  /* ── Register new volunteer ───────────────────────────── */
  async function register(formData) {
    const volunteers = getAllVolunteers();

    /* Duplicate check */
    if (volunteers.find(v => v.mobile === formData.mobile)) {
      return { success: false, message: "Mobile number already registered." };
    }
    if (volunteers.find(v => v.email === formData.email)) {
      return { success: false, message: "Email address already registered." };
    }

    /* Process photo */
    let photoDataURL = "";
    if (formData.photoFile) {
      try {
        photoDataURL = await MLFUtils.readFileAsDataURL(formData.photoFile);
      } catch (e) {
        photoDataURL = "";
      }
    }

    /* Create volunteer object */
    const volunteer = {
      volunteerID: MLFUtils.generateVolunteerID(),
      fullName: formData.fullName.trim(),
      dob: formData.dob,
      mobile: formData.mobile.trim(),
      email: formData.email.trim().toLowerCase(),
      district: formData.district,
      address: formData.address.trim(),
      aadhaar: formData.aadhaar.replace(/\D/g, ""),
      photo: photoDataURL,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active"
    };

    volunteers.push(volunteer);
    saveVolunteers(volunteers);

    return { success: true, volunteer };
  }

  /* ── Handle Registration Form Submit ──────────────────── */
  function bindRegistrationForm() {
    const form = document.getElementById("volunteer-reg-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      /* Gather data */
      const formData = {
        fullName: form.querySelector("#reg-fullname").value,
        dob: form.querySelector("#reg-dob").value,
        mobile: form.querySelector("#reg-mobile").value,
        email: form.querySelector("#reg-email").value,
        district: form.querySelector("#reg-district").value,
        address: form.querySelector("#reg-address").value,
        aadhaar: form.querySelector("#reg-aadhaar").value,
        photoFile: form.querySelector("#reg-photo").files[0] || null
      };

      /* Validation */
      if (!formData.fullName || formData.fullName.length < 3) {
        MLFUtils.showToast("Please enter a valid full name.", "error"); return;
      }
      if (!formData.dob) {
        MLFUtils.showToast("Please enter your date of birth.", "error"); return;
      }
      const age = MLFUtils.calculateAge(formData.dob);
      if (age < 16 || age > 70) {
        MLFUtils.showToast("Age must be between 16 and 70 years.", "error"); return;
      }
      if (!MLFUtils.validateMobile(formData.mobile)) {
        MLFUtils.showToast("Please enter a valid 10-digit mobile number.", "error"); return;
      }
      if (!MLFUtils.validateEmail(formData.email)) {
        MLFUtils.showToast("Please enter a valid email address.", "error"); return;
      }
      if (!formData.district) {
        MLFUtils.showToast("Please select your district.", "error"); return;
      }
      if (!formData.address || formData.address.length < 10) {
        MLFUtils.showToast("Please enter a complete address.", "error"); return;
      }
      if (!MLFUtils.validateAadhaar(formData.aadhaar)) {
        MLFUtils.showToast("Please enter a valid 12-digit Aadhaar number.", "error"); return;
      }

      /* Submit button loading */
      const btn = form.querySelector(".reg-submit-btn");
      btn.textContent = "Registering...";
      btn.disabled = true;

      const result = await register(formData);

      btn.textContent = "Register as Volunteer";
      btn.disabled = false;

      if (result.success) {
        MLFUtils.showToast(`✅ Registered! Your ID: ${result.volunteer.volunteerID}`, "success");
        form.reset();
        document.getElementById("reg-photo-preview").src = "";
        document.getElementById("reg-photo-preview").style.display = "none";

        /* Show success card */
        showRegistrationSuccess(result.volunteer);

        /* Refresh notice engine for birthday detection */
        MLFNoticeEngine.refresh();
      } else {
        MLFUtils.showToast(result.message, "error");
      }
    });

    /* Photo preview */
    const photoInput = form.querySelector("#reg-photo");
    if (photoInput) {
      photoInput.addEventListener("change", async () => {
        const file = photoInput.files[0];
        if (file) {
          const url = await MLFUtils.readFileAsDataURL(file);
          const preview = document.getElementById("reg-photo-preview");
          preview.src = url;
          preview.style.display = "block";
        }
      });
    }
  }

  /* ── Show success after registration ─────────────────── */
  function showRegistrationSuccess(volunteer) {
    const modal = document.getElementById("reg-success-modal");
    if (!modal) return;

    modal.querySelector(".success-vid-id").textContent = volunteer.volunteerID;
    modal.querySelector(".success-name").textContent = volunteer.fullName;
    modal.querySelector(".success-date").textContent = MLFUtils.formatDate(volunteer.joinDate);

    modal.classList.add("modal--active");
    document.body.classList.add("body--modal-open");
  }

  /* ── Render Volunteer Dashboard ───────────────────────── */
  function renderDashboard(volunteer) {
    const dash = document.getElementById("volunteer-dashboard");
    if (!dash) return;

    const photo = volunteer.photo || "assets/images/default-avatar.png";

    dash.innerHTML = `
      <div class="dashboard-header">
        <div class="dashboard-avatar-wrap">
          <img src="${MLFUtils.sanitize(photo)}" alt="Volunteer Photo" class="dashboard-avatar" onerror="this.src='assets/images/default-avatar.png'">
          <div class="dashboard-status">Active</div>
        </div>
        <div class="dashboard-info">
          <h2 class="dashboard-name">${MLFUtils.sanitize(volunteer.fullName)}</h2>
          <div class="dashboard-id">${MLFUtils.sanitize(volunteer.volunteerID)}</div>
          <div class="dashboard-joined">Member since ${MLFUtils.formatDate(volunteer.joinDate)}</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <div class="dashboard-card__label">District</div>
          <div class="dashboard-card__value">${MLFUtils.sanitize(volunteer.district)}</div>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card__label">Mobile</div>
          <div class="dashboard-card__value">${MLFUtils.sanitize(volunteer.mobile)}</div>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card__label">Email</div>
          <div class="dashboard-card__value">${MLFUtils.sanitize(volunteer.email)}</div>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card__label">Aadhaar</div>
          <div class="dashboard-card__value">${MLFUtils.maskAadhaar(volunteer.aadhaar)}</div>
        </div>
        <div class="dashboard-card dashboard-card--full">
          <div class="dashboard-card__label">Address</div>
          <div class="dashboard-card__value">${MLFUtils.sanitize(volunteer.address)}</div>
        </div>
      </div>

      <div class="dashboard-qr-section">
        <h3>My Digital ID</h3>
        <div class="dashboard-qr-wrap">
          <div id="dashboard-qr-canvas"></div>
          <div class="dashboard-qr-info">
            <p>Scan to verify volunteer identity</p>
            <span class="qr-id-label">${MLFUtils.sanitize(volunteer.volunteerID)}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-actions">
        <button class="btn btn--primary" id="print-id-btn">🖨️ Print ID Card</button>
        <button class="btn btn--outline" id="logout-btn">Sign Out</button>
      </div>
    `;

    /* Render QR code */
    const qrPayload = MLFQR.buildVolunteerQRPayload(volunteer);
    MLFQR.renderInElement("dashboard-qr-canvas", qrPayload, { size: 160 });

    /* Print ID card */
    document.getElementById("print-id-btn").addEventListener("click", () => {
      printIDCard(volunteer);
    });

    /* Logout */
    document.getElementById("logout-btn").addEventListener("click", () => {
      MLFAuth.logout();
    });
  }

  /* ── Print Digital ID Card ────────────────────────────── */
  function printIDCard(volunteer) {
    const photo = volunteer.photo || "assets/images/default-avatar.png";
    const qrPayload = MLFQR.buildVolunteerQRPayload(volunteer);
    const qrDataURL = MLFQR.generateQRDataURL(qrPayload, { size: 120, fgColor: "#0a1628" });

    const printWindow = window.open("", "_blank", "width=420,height=280");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>MLF Volunteer ID — ${volunteer.volunteerID}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; background: #fff; }
          .card {
            width: 85.6mm; height: 53.98mm;
            background: linear-gradient(135deg, #0a1628 0%, #1a2b4a 60%, #0a1628 100%);
            color: #fff;
            border-radius: 6px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
            padding: 10px;
          }
          .card-accent {
            position: absolute; top: 0; right: 0;
            width: 40%; height: 100%;
            background: linear-gradient(180deg, #f4821e22 0%, transparent 100%);
          }
          .card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
          .card-logo { font-size: 18px; font-weight: 900; color: #f4821e; letter-spacing: -1px; }
          .card-org { font-size: 8px; line-height: 1.2; }
          .card-org strong { display: block; font-size: 10px; color: #f4821e; }
          .card-body { display: flex; gap: 8px; flex: 1; }
          .card-photo { width: 55px; height: 65px; object-fit: cover; border-radius: 4px; border: 2px solid #f4821e44; }
          .card-details { flex: 1; }
          .card-name { font-size: 11px; font-weight: 700; color: #fff; margin-bottom: 2px; }
          .card-id { font-size: 9px; color: #f4821e; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px; }
          .card-field { font-size: 8px; color: #aabbcc; margin: 1px 0; }
          .card-field span { color: #fff; }
          .card-qr { width: 55px; text-align: center; }
          .card-qr img { width: 50px; height: 50px; }
          .card-qr-label { font-size: 6px; color: #aaa; margin-top: 2px; }
          .card-footer {
            border-top: 1px solid #ffffff22;
            padding-top: 5px;
            display: flex; justify-content: space-between; align-items: center;
            margin-top: 4px;
          }
          .card-footer-text { font-size: 7px; color: #aabbcc; }
          .card-stripe {
            position: absolute; bottom: 0; left: 0; right: 0;
            height: 4px;
            background: linear-gradient(90deg, #f4821e, #ffa040, #f4821e);
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="card-accent"></div>
          <div class="card-top">
            <div class="card-logo">MLF</div>
            <div class="card-org">
              <strong>My Lifeline Foundation</strong>
              Volunteer Identity Card
            </div>
          </div>
          <div class="card-body">
            <img src="${photo}" class="card-photo" onerror="this.src='assets/images/default-avatar.png'" alt="Photo">
            <div class="card-details">
              <div class="card-name">${MLFUtils.sanitize(volunteer.fullName)}</div>
              <div class="card-id">${MLFUtils.sanitize(volunteer.volunteerID)}</div>
              <div class="card-field">District: <span>${MLFUtils.sanitize(volunteer.district)}</span></div>
              <div class="card-field">Mobile: <span>${MLFUtils.sanitize(volunteer.mobile)}</span></div>
              <div class="card-field">Joined: <span>${MLFUtils.formatDate(volunteer.joinDate)}</span></div>
              <div class="card-field">Aadhaar: <span>${MLFUtils.maskAadhaar(volunteer.aadhaar)}</span></div>
            </div>
            <div class="card-qr">
              <img src="${qrDataURL}" alt="QR Code">
              <div class="card-qr-label">Scan to Verify</div>
            </div>
          </div>
          <div class="card-footer">
            <span class="card-footer-text">www.mylifelinefoundation.org</span>
            <span class="card-footer-text">mlf@lifeline.org</span>
          </div>
          <div class="card-stripe"></div>
        </div>
        <script>window.onload = () => window.print();<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  /* ── Public API ───────────────────────────────────────── */
  return {
    getAllVolunteers,
    findByID,
    findByMobile,
    register,
    bindRegistrationForm,
    renderDashboard,
    printIDCard
  };

})();
