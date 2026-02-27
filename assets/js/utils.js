/**
 * utils.js — My Lifeline Foundation
 * Shared utility functions used across all modules.
 */
window.MLF = window.MLF || {};

MLF.Utils = (function () {
  function padNum(num, size) {
    let s = String(num);
    while (s.length < size) s = '0' + s;
    return s;
  }
  function formatDate(date) {
    const d = date || new Date();
    return padNum(d.getDate(),2)+'/'+padNum(d.getMonth()+1,2)+'/'+d.getFullYear();
  }
  function formatTime(date) {
    const d = date || new Date();
    return padNum(d.getHours(),2)+':'+padNum(d.getMinutes(),2)+':'+padNum(d.getSeconds(),2);
  }
  function lsGet(key, fallback) {
    try { const r=localStorage.getItem(key); return r!==null?JSON.parse(r):fallback; }
    catch(e){ return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch(e){ console.warn('lsSet failed',e); }
  }
  function lsRemove(key) { try{ localStorage.removeItem(key); }catch(e){} }
  function sanitise(str) { const d=document.createElement('div'); d.textContent=str; return d.innerHTML; }
  function isValidMobile(m) { return /^[6-9]\d{9}$/.test(m.trim()); }
  function isValidEmail(e)  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); }
  function isValidAadhaar(a){ return /^\d{12}$/.test(a.trim()); }
  function maskAadhaar(a)   { return 'XXXX-XXXX-'+a.slice(-4); }
  function debounce(fn,delay){ let t; return function(...a){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a),delay); }; }
  function throttle(fn,limit){ let last=0; return function(...a){ const n=Date.now(); if(n-last>=limit){last=n;fn.apply(this,a);} }; }
  function showFeedback(elId, msg, type, dur) {
    const el=document.getElementById(elId); if(!el) return;
    el.textContent=msg; el.className='form-feedback '+(type||'');
    if(dur) setTimeout(()=>{el.textContent='';el.className='form-feedback';},dur);
  }
  function readFileAsDataURL(file) {
    return new Promise(function(resolve,reject){
      const r=new FileReader();
      r.onload=()=>resolve(r.result);
      r.onerror=()=>reject(new Error('File read failed'));
      r.readAsDataURL(file);
    });
  }
  function getAge(dob) {
    const b=new Date(dob), t=new Date(); let age=t.getFullYear()-b.getFullYear();
    const m=t.getMonth()-b.getMonth(); if(m<0||(m===0&&t.getDate()<b.getDate())) age--;
    return age;
  }
  function isBirthdayToday(dob) {
    const b=new Date(dob), t=new Date();
    return b.getDate()===t.getDate()&&b.getMonth()===t.getMonth();
  }
  return { padNum,formatDate,formatTime,lsGet,lsSet,lsRemove,sanitise,
           isValidMobile,isValidEmail,isValidAadhaar,maskAadhaar,
           debounce,throttle,showFeedback,readFileAsDataURL,getAge,isBirthdayToday };
})();
