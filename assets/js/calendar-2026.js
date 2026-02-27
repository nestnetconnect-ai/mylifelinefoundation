/**
 * calendar-2026.js — Odisha + National events for 2026
 * Exposed as MLF.Calendar
 */
window.MLF = window.MLF || {};
MLF.Calendar = (function () {
  const events2026 = [
    {date:'2026-01-01',name:"New Year's Day",type:'national'},
    {date:'2026-01-14',name:'Makar Sankranti / Pongal',type:'festival'},
    {date:'2026-01-15',name:'Tusu Purnima (Odisha)',type:'odisha'},
    {date:'2026-01-23',name:'Netaji Subhash Chandra Bose Jayanti',type:'national'},
    {date:'2026-01-26',name:'Republic Day',type:'national'},
    {date:'2026-02-17',name:'Maha Shivaratri',type:'festival'},
    {date:'2026-03-03',name:'Holi',type:'festival'},
    {date:'2026-03-22',name:'Sarhul (Odisha Tribes)',type:'odisha'},
    {date:'2026-04-02',name:'Ram Navami',type:'festival'},
    {date:'2026-04-03',name:'Good Friday',type:'national'},
    {date:'2026-04-14',name:'Utkal Divas (Odisha Day)',type:'odisha'},
    {date:'2026-04-18',name:'Mahavir Jayanti',type:'national'},
    {date:'2026-05-01',name:'International Labour Day',type:'national'},
    {date:'2026-05-11',name:'Buddha Purnima',type:'national'},
    {date:'2026-05-23',name:'Eid ul-Adha (Bakrid)',type:'national'},
    {date:'2026-06-05',name:'World Environment Day',type:'national'},
    {date:'2026-06-21',name:'International Yoga Day',type:'national'},
    {date:'2026-07-07',name:'Rath Yatra (Puri, Odisha)',type:'odisha'},
    {date:'2026-08-15',name:'Independence Day',type:'national'},
    {date:'2026-08-19',name:'Janmashtami',type:'festival'},
    {date:'2026-09-02',name:'Ganesh Chaturthi',type:'festival'},
    {date:'2026-09-05',name:"Teachers' Day",type:'national'},
    {date:'2026-09-22',name:'Nuakhai (Odisha Harvest Festival)',type:'odisha'},
    {date:'2026-10-02',name:'Gandhi Jayanti',type:'national'},
    {date:'2026-10-20',name:'Kumara Purnima (Odisha)',type:'odisha'},
    {date:'2026-10-26',name:'Dussehra / Vijayadashami',type:'national'},
    {date:'2026-11-01',name:'Diwali / Lakshmi Puja',type:'festival'},
    {date:'2026-11-05',name:'Chhath Puja (Sandhya Arghya)',type:'odisha'},
    {date:'2026-11-06',name:'Chhath Puja (Usha Arghya)',type:'odisha'},
    {date:'2026-11-14',name:"Children's Day",type:'national'},
    {date:'2026-11-19',name:'Kartik Purnima / Boita Bandana',type:'odisha'},
    {date:'2026-12-25',name:'Christmas Day',type:'national'},
    {date:'2026-12-31',name:"New Year's Eve",type:'festival'}
  ];
  function getTodayEvents() {
    const t=new Date();
    const ts=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');
    return events2026.filter(ev=>ev.date===ts);
  }
  function getUpcomingEvents(days) {
    const today=new Date(), future=new Date(today);
    future.setDate(future.getDate()+(days||7));
    return events2026.filter(ev=>{const d=new Date(ev.date);return d>today&&d<=future;});
  }
  function getMonthEvents(month) {
    return events2026.filter(ev=>new Date(ev.date).getMonth()+1===month);
  }
  function getAllEvents() { return events2026.slice(); }
  return { getTodayEvents, getUpcomingEvents, getMonthEvents, getAllEvents };
})();
