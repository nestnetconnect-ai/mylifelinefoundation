/**
 * volunteer-engine.js — My Lifeline Foundation
 * Volunteer registration, ID generation (MLF-OD-NNNNN), and data management.
 * Storage: localStorage key 'mlf_volunteers'
 * Depends on: utils.js
 */
window.MLF = window.MLF || {};
MLF.VolunteerEngine = (function () {
  const STORAGE_KEY='mlf_volunteers';
  const COUNTER_KEY='mlf_vol_counter';

  function generateVolunteerId() {
    let c=MLF.Utils.lsGet(COUNTER_KEY,0)+1;
    MLF.Utils.lsSet(COUNTER_KEY,c);
    return 'MLF-OD-'+MLF.Utils.padNum(c,5);
  }
  function getAllVolunteers()  { return MLF.Utils.lsGet(STORAGE_KEY,[]); }
  function getById(id)        { return getAllVolunteers().find(v=>v.volunteerId===id)||null; }
  function getByMobile(mob)   { return getAllVolunteers().find(v=>v.mobile===mob)||null; }
  function isMobileRegistered(m) { return getAllVolunteers().some(v=>v.mobile===m); }
  function isEmailRegistered(e)  { return getAllVolunteers().some(v=>v.email.toLowerCase()===e.toLowerCase()); }

  function saveVolunteer(data) {
    const vols=getAllVolunteers();
    const record=Object.assign({},data,{volunteerId:generateVolunteerId(),registeredOn:new Date().toISOString(),status:'active'});
    vols.push(record);
    MLF.Utils.lsSet(STORAGE_KEY,vols);
    return record;
  }

  function validate(data) {
    const errors={};
    if(!data.fullName||data.fullName.trim().length<3) errors.name='Full name must be at least 3 characters.';
    if(!data.dob) errors.dob='Date of birth is required.';
    else { const age=MLF.Utils.getAge(data.dob); if(age<16) errors.dob='Must be at least 16 years old.'; }
    if(!data.mobile||!MLF.Utils.isValidMobile(data.mobile)) errors.mobile='Enter a valid 10-digit mobile number.';
    else if(isMobileRegistered(data.mobile)) errors.mobile='Mobile already registered.';
    if(!data.email||!MLF.Utils.isValidEmail(data.email)) errors.email='Enter a valid email address.';
    else if(isEmailRegistered(data.email)) errors.email='Email already registered.';
    if(!data.district||data.district==='') errors.district='Please select your district.';
    if(!data.aadhaar||!MLF.Utils.isValidAadhaar(data.aadhaar)) errors.aadhaar='Aadhaar must be exactly 12 digits.';
    if(!data.address||data.address.trim().length<10) errors.address='Please enter your full address.';
    return {valid:Object.keys(errors).length===0, errors};
  }

  function collectFormData() {
    return {
      fullName: (document.getElementById('vol-name')?.value||'').trim(),
      dob:      (document.getElementById('vol-dob')?.value||'').trim(),
      mobile:   (document.getElementById('vol-mobile')?.value||'').trim(),
      email:    (document.getElementById('vol-email')?.value||'').trim(),
      district: (document.getElementById('vol-district')?.value||'').trim(),
      aadhaar:  (document.getElementById('vol-aadhaar')?.value||'').trim(),
      address:  (document.getElementById('vol-address')?.value||'').trim()
    };
  }

  function showErrors(errors) {
    const map={name:'err-name',dob:'err-dob',mobile:'err-mobile',email:'err-email',district:'err-district',aadhaar:'err-aadhaar',address:'err-address'};
    Object.values(map).forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='';});
    Object.keys(errors).forEach(f=>{const el=document.getElementById(map[f]);if(el)el.textContent=errors[f];});
  }

  function clearErrors() {
    ['err-name','err-dob','err-mobile','err-email','err-district','err-aadhaar','err-address']
      .forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='';});
  }

  async function getPhotoDataURL() {
    const input=document.getElementById('vol-photo');
    if(!input||!input.files||!input.files[0]) return null;
    const file=input.files[0];
    if(file.size>2*1024*1024) throw new Error('Photo must be under 2MB.');
    return await MLF.Utils.readFileAsDataURL(file);
  }

  async function register() {
    clearErrors();
    const data=collectFormData();
    const {valid,errors}=validate(data);
    if(!valid){ showErrors(errors); return null; }
    let photo=null;
    try { photo=await getPhotoDataURL(); } catch(e){ MLF.Utils.showFeedback('register-feedback',e.message,'error',5000); return null; }
    if(photo) data.photo=photo;
    return saveVolunteer(data);
  }

  return { register, getAllVolunteers, getById, getByMobile, validate, isMobileRegistered };
})();
