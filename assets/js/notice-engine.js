/**
 * notice-engine.js — My Lifeline Foundation
 * Floating notice widget: live clock, rotating notices.
 * Priority: Festival > Birthday > Manual
 * Depends on: utils.js, calendar-2026.js
 */
window.MLF = window.MLF || {};
MLF.NoticeEngine = (function () {
  const MANUAL_NOTICES = [
    'MLF is accepting volunteer registrations for 2026! Register today.',
    'Free Medical Camp at Koraput on 15 March 2026. Contact us to participate.',
    'Digital Literacy Drive launching in 5 new districts — volunteers needed.',
    'Annual Volunteer Convention 2026 — Save the date: 20th July, Bhubaneswar.',
    'Scholarship applications open for Class 10 students. Deadline: 31 March 2026.',
    'Join our #GreenOdisha plantation drive every Sunday — 50,000 trees planted!',
    'Donate for our clean water project in Mayurbhanj — transform 12 villages.',
    'MLF Helpline: +91 98765 43210 | Mon–Sat, 9 AM – 6 PM'
  ];
  let notices=[], currentIdx=0, noticeTimer=null, isCollapsed=false;

  function tickClock() {
    const now=new Date();
    const te=document.getElementById('notice-time');
    const de=document.getElementById('notice-date');
    if(te) te.textContent=MLF.Utils.formatTime(now);
    if(de) de.textContent=MLF.Utils.formatDate(now);
  }

  function buildQueue() {
    const q=[];
    MLF.Calendar.getTodayEvents().forEach(function(ev){
      q.push({
        text:'🎉 '+ev.name+' — Wishing everyone a wonderful day!',
        tag: ev.type==='festival'?'FESTIVAL':ev.type==='odisha'?'ODISHA':'NATIONAL',
        cls:'festival'
      });
    });
    const vols=MLF.Utils.lsGet('mlf_volunteers',[]);
    vols.forEach(function(v){
      if(MLF.Utils.isBirthdayToday(v.dob)){
        q.push({text:'🎂 Happy Birthday, '+v.fullName.split(' ')[0]+'! ('+v.volunteerId+')',tag:'BIRTHDAY',cls:'birthday'});
      }
    });
    MLF.Calendar.getUpcomingEvents(3).forEach(function(ev){
      const d=new Date(ev.date), diff=Math.round((d-new Date())/(864e5));
      if(diff>0) q.push({text:'📅 Upcoming: '+ev.name+' in '+diff+' day'+(diff>1?'s':''),tag:'UPCOMING',cls:'manual'});
    });
    MANUAL_NOTICES.forEach(function(txt){ q.push({text:txt,tag:'INFO',cls:'manual'}); });
    return q.length?q:[{text:'Welcome to My Lifeline Foundation!',tag:'INFO',cls:'manual'}];
  }

  function showNotice(idx) {
    const n=notices[idx]; if(!n) return;
    const tag=document.getElementById('notice-tag');
    const txt=document.getElementById('notice-text');
    if(tag){tag.textContent=n.tag; tag.className='notice-tag '+n.cls;}
    if(txt){txt.style.animation='none';txt.offsetHeight;txt.style.animation='';txt.textContent=n.text;}
  }

  function startRotation() {
    if(!notices.length) return;
    showNotice(0);
    noticeTimer=setInterval(function(){
      currentIdx=(currentIdx+1)%notices.length;
      showNotice(currentIdx);
    },6000);
  }

  function init() {
    notices=buildQueue();
    tickClock();
    setInterval(tickClock,1000);
    startRotation();
    const btn=document.getElementById('notice-toggle');
    if(btn) btn.addEventListener('click',function(){
      isCollapsed=!isCollapsed;
      const w=document.getElementById('notice-widget');
      if(w) w.classList.toggle('collapsed',isCollapsed);
    });
    setInterval(function(){
      clearInterval(noticeTimer); notices=buildQueue(); currentIdx=0; startRotation();
    },60000);
  }

  return { init };
})();
