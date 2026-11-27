'use strict';

const site = document.querySelector('#site');
const dialog = document.querySelector('#dialog');
const state = { data: sampleNetwork(), previewOnly: true, guestSchools: [], sample: true, page: 'dashboard', auth: 'login', busy: false,
  directory: { query: '', school: '', batch: '', mentors: false }, status: '', chartSchool: '', connectionError: '' };
const tabs = { dashboard:'Overview', alumni:'Alumni directory', schools:'Schools', mentorship:'Mentorship', events:'Events', insights:'Reports', notes:'Notifications' };
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[char]);
const e = escapeHTML;
const currentYear = new Date().getFullYear();
const today = () => sampleDay();
function niceDate(raw) {
  if (!raw) return '';
  return new Intl.DateTimeFormat('en-IN',{ day:'numeric',month:'short',year:'numeric',timeZone:'UTC' })
    .format(new Date(raw.length === 10 ? raw + 'T00:00:00Z' : raw));
}
function button(text, action, id='', classes='compact') {
  return `<button type="button" class="${classes}" data-action="${action}" data-id="${e(id)}">${e(text)}</button>`;
}
function optionList(values, selected) {
  return values.map(v => `<option value="${e(v)}"${String(v) === String(selected) ? ' selected' : ''}>${e(v)}</option>`).join('');
}
function badge(status) {return `<span class="badge ${e(status)}">${e(status)}</span>`;}
function empty(text) {return `<p class="empty">${e(text)}</p>`;}
function noError() {return '<p class="error wide" data-error role="alert"></p>';}
function header(){
 return `<header class="mast"><div class="mast-inner"><button class="atlas-brand" data-action="sample">${mark()}</button>${button('Browse sample workspace','sample')}</div></header>`;
}
function footer(showCampusCredit = false) {
  const credit = showCampusCredit
    ? '<span>Lovely Professional University · <a href="https://commons.wikimedia.org/wiki/File:Admission-block-copy.jpg">Photo by Tanya2016</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></span>'
    : '<span>Alumni &amp; student community</span>';
  return `<footer class="foot"><div class="foot-inner"><span>School Alumini Portal for Management · Independent student project</span>${credit}</div></footer>`;
}
function input(label,name,value='',attributes='',type='text') {
  return `<label>${e(label)}<input name="${name}" type="${type}" value="${e(value)}" ${attributes}></label>`;
}
function textArea(label,name,attributes='') {
  return `<label class="wide">${e(label)}<textarea name="${name}" rows="3" ${attributes}></textarea></label>`;
}
function passwordField(isRegister) {
  return `<label>Password<span class="password"><input name="password" type="password" maxlength="200" ${isRegister?'minlength="10" autocomplete="new-password" placeholder="At least 10 characters"':'autocomplete="current-password" placeholder="Enter your password"'} required>
  <button type="button" data-action="password" aria-label="Show password" aria-pressed="false">Show</button></span></label>`;
}
function schoolField(value='') {
  return `<label>School and campus<input name="school" list="school-list" placeholder="e.g. School of Computer Science &amp; Engineering" value="${e(value)}" minlength="2" maxlength="120" required>
    <small class="hint">Choose an existing school or enter a new school and city.</small></label>`;
}
function schoolOptions() {
  return `<datalist id="school-list">${optionList(state.data?.schools || state.guestSchools,'')}</datalist>`;
}
function alumniFields(row={}) {
  return `${input('Graduation year','batch',row.batch,`min="1900" max="${currentYear}" placeholder="e.g. 2018" required`,'number')}
    ${input('Profession or field of study','profession',row.profession,'minlength="2" maxlength="90" placeholder="e.g. Software engineer" required')}
    ${input('Current city (optional)','city',row.city,'maxlength="80" placeholder="e.g. Pune"')}
    ${row.owner === null ? '<p class="hint">Mentorship requests require a registered alumni account.</p>' : `<label class="check"><input type="checkbox" name="mentoring" ${row.mentoring?'checked':''}> Open to mentorship requests</label>`}`;
}
function adminSetupPage() {
  return header() + '<main class="gate" id="main"><div class="photo"><img src="assets/lpu-open-air-theatre.webp" alt="The LPU open-air theatre" width="980" height="654"></div><section class="gate-side"><header><h1>Set up your administrator account</h1><p>Choose the email and password you will use to manage alumni, events and reports.</p></header><form class="form-grid" data-form="activateAdmin">' +
    input('Administrator email','email','','autocomplete="email" maxlength="254" required','email') +
    passwordField(true).replace('minlength="10"','minlength="12"').replace('At least 10 characters','At least 12 characters') +
    noError() + '<button class="btn" type="submit">Activate administrator account</button></form></section></main>' + footer(true);
}
function authPage() {
  const reg = state.auth === 'register';
  const fields = `${reg ? input('Full name','name','','autocomplete="name" minlength="2" maxlength="80" required') : ''}
    ${input('Email address','email','','autocomplete="email" maxlength="254" placeholder="you@example.com" required','email')}
    ${passwordField(reg)}
    ${reg ? `<label>I am a<select name="role"><option value="alumni">School alumnus / alumna</option><option value="student">Current student</option></select></label>${schoolField()}
    <div class="form-grid" data-alumni-fields>${alumniFields()}<p class="hint">Signed-in members can see your directory profile. Your sign-in email stays private.</p></div>`:''}`;
  const gate = state.previewOnly
    ? `<header><h1>Explore the network</h1><p>Browse sample alumni, school graphs and a mentorship session.</p></header>
       ${button('Explore the sample workspace','sample','','btn arrow')}
       <p class="hint browse">Try the roles with fictional records. Live registration requires a connected school database.</p>`
    : `<header><h1>${reg?'Join the network':'Welcome back'}</h1><p>${reg?'Create your alumni or student profile.':'Log in to your school alumni network.'}</p></header>
    <div class="tabs" aria-label="Account options"><button data-action="auth" data-id="login" aria-pressed="${!reg}">Login</button><button data-action="auth" data-id="register" aria-pressed="${reg}">Register</button></div>
    <form class="form-grid" data-form="${reg?'register':'login'}">${fields}${noError()}<button class="btn arrow" type="submit">${reg?'Create account':'Log in'}</button></form>${schoolOptions()}
    <div class="browse">${button('Explore the sample workspace','sample','','quiet arrow')}</div>`;
  return `${header(null)}<main class="gate" id="main"><div class="photo"><img src="assets/lpu-open-air-theatre.webp" alt="The open-air theatre on the Lovely Professional University campus" width="980" height="654">
    <div class="photo-text"><h2>Back on <em>campus.</em></h2><p>Find your school community and connect with someone who’s been there before.</p></div></div>
    <section class="gate-side">${gate}</section></main>${footer(true)}`;
}
function pageHead(title,description,actions='') {
  return `<div class="page-head"><div><h1>${e(title)}</h1><p>${e(description)}</p></div>${actions}</div>`;
}
function metrics(pairs) {
  return `<div class="summary">${pairs.map(([n,l])=>`<div class="stat"><strong>${n}</strong><span>${e(l)}</span></div>`).join('')}</div>`;
}
function graph(title,rows,getKey,sort='count',secondary=false) {
  const counts = new Map();
  for (const row of rows) {const k=getKey(row);counts.set(k,1+(counts.get(k)||0));}
  const entries = [...counts].sort((a,b) => sort === 'year' ? Number(a[0])-Number(b[0]) : b[1]-a[1] || String(a[0]).localeCompare(String(b[0])));
  const max = Math.max(1,...entries.map(([,count])=>count));
  return `<section class="panel ${secondary?'secondary':''}"><h2>${e(title)}</h2>${entries.length ? `<ul class="chart-list">${entries.map(([key,count])=>
    `<li><span>${e(key)}</span><b>${count}</b><meter min="0" max="${max}" value="${count}" aria-label="${e(key)}: ${count}">${count}</meter></li>`).join('')}</ul>`:empty('No records to graph yet.')}</section>`;
}
function dashboard(d){ return atlasDashboard(d); }
function insights(d) {
  const scope=state.chartSchool;
  const alumni=d.alumni.filter(a=>!scope || a.school===scope);
  return pageHead('Alumni graphs','Explore the directory by school and graduation year.') +
    `<div class="tools"><label>School<select data-filter="chartSchool"><option value="">All schools</option>${optionList(d.schools,scope)}</select></label></div>` +
    metrics([[alumni.length,'Alumni in selection'],[new Set(alumni.map(a=>a.batch)).size,'Graduation years'],[alumni.filter(a=>a.mentoring&&a.owner).length,'Available mentors']]) +
    `<div class="charts">${graph('Alumni by school',alumni,a=>a.school)}${graph('Alumni by graduation year',alumni,a=>a.batch,'year',true)}</div>
    <div class="charts">${graph('Mentorship status',d.requests.filter(r=>!scope || r.school===scope),r=>r.status)}${graph('Event registrations · all schools',d.registrations,r=>r.status,'count',true)}</div>
    <p class="hint">${d.me.role==='admin'?'Mentorship and event totals include every member.':'Mentorship and event totals include your own records.'}</p>`;
}
function schoolsPage(d){
 return pageHead('Schools','Choose a school to explore its alumni, professions and available mentors.')+schoolCards(d);
}
function directory(d) {
  const f=state.directory;
  return pageHead('Alumni directory','Find classmates and mentors across the school network.',d.me.role==='admin'?button('Add alumni record','editProfile','','btn'):'') +
    `<div class="tools"><label class="search">Search<input type="search" data-filter="query" placeholder="Name, profession or city" value="${e(f.query)}"></label>
    <label>School<select data-filter="school"><option value="">All schools</option>${optionList(d.schools,f.school)}</select></label>
    <label>Graduation year<select data-filter="batch"><option value="">All years</option>${optionList([...new Set(d.alumni.map(a=>a.batch))].sort((a,b)=>b-a),f.batch)}</select></label>
    <label class="check"><input type="checkbox" data-filter="mentors" ${f.mentors?'checked':''}> Available mentors</label></div><div id="directory-results">${directoryResults(d)}</div>`;
}
function directoryResults(d) {
  const f=state.directory;
  const query=f.query.trim().toLowerCase();
  const rows=d.alumni.filter(a => (!f.school || a.school===f.school) && (!f.batch || String(a.batch)===f.batch)
    && (!f.mentors || a.mentoring && a.owner) && [a.name,a.profession,a.city,a.school].join(' ').toLowerCase().includes(query)).sort((a,b)=>a.name.localeCompare(b.name));
  const cards=rows.map(a=>{
    const initials=a.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('');
    const open=d.requests.find(r=>r.student===d.me.id && r.mentor===a.owner && ['Pending','Approved'].includes(r.status));
    const mentor=a.mentoring && a.owner;
    let action='';
    if (d.me.role==='student' && open) action=button('View mentorship','viewMentorship',open.id);
    else if (d.me.role==='student' && mentor) action=button('Request mentorship','ask',a.id);
    if (d.me.role==='admin' || a.owner===d.me.id) action+=button('Edit profile','editProfile',a.id);
    if (d.me.role==='admin') action+=button('Remove','removeProfile',a.id,'quiet');
    return `<article class="profile"><div class="person"><span aria-hidden="true" class="avatar">${e(initials)}</span><div><h3>${e(a.name)}</h3><span class="small">${e(a.profession)}</span></div></div>
      <dl><div><dt>School</dt><dd>${e(a.school)}</dd></div><div><dt>Class of</dt><dd>${a.batch}</dd></div>${a.city?`<div><dt>City</dt><dd>${e(a.city)}</dd></div>`:''}</dl>
      ${mentor?'<span class="badge available">Open to mentorship</span>':''}<div class="btn-row">${action}</div></article>`;
  }).join('');
  return `<p class="results" aria-live="polite">${rows.length} ${rows.length===1?'alumnus':'alumni'} found</p>${rows.length?`<div class="cards">${cards}</div>`:empty('No alumni match these filters.')}`;
}
function mentorship(d) {
  const rows=d.requests.filter(r=>!state.status || r.status===state.status);
  const cards=rows.map(r=>{
    let actions='';
    if (r.status==='Pending' && d.me.id===r.mentor) actions=button('Approve','Approved',r.id,'btn')+button('Decline','Rejected',r.id);
    if (r.status==='Pending' && d.me.id===r.student) actions=button('Cancel request','Cancelled',r.id);
    if (r.status==='Approved' && [r.mentor,r.student].includes(d.me.id)) actions=button('Log a session','log',r.id,'btn')+button('Mark completed','Completed',r.id);
    const sessions=r.sessions.length ? r.sessions.map(s=>`<div class="entry"><strong>${niceDate(s.date)}</strong> · ${e(s.by)}<p>${e(s.notes)}</p>${s.next?`<p class="small"><b>Next step</b> · ${e(s.next)}</p>`:''}</div>`).join('') : empty('No sessions recorded yet.');
    return `<article class="record" id="record-${e(r.id)}" tabindex="-1"><div class="card-top"><h2>${e(r.topic)}</h2>${badge(r.status)}</div>
      <p><b>${e(r.studentName)}</b> with <b>${e(r.mentorName)}</b></p><p class="muted small">${e(r.school)} · Requested ${niceDate(r.at)}</p>
      <p>${e(r.message)}</p><details class="details"><summary>Session log (${r.sessions.length}) &amp; request history</summary>${sessions}
      <h3>Request history</h3><ol class="log">${r.history.map(h=>`<li>${e(h.status)} · ${e(h.by)} · ${niceDate(h.at)}</li>`).join('')}</ol></details><div class="btn-row">${actions}</div></article>`;
  }).join('');
  return pageHead('Mentorship records',d.me.role==='admin'?'Review requests and session histories across the network.':'Follow your requests, record sessions and keep track of the next step.',
    d.me.role==='student'?button('Find a mentor','findMentor','','soft arrow'):'')+
    `<div class="tools"><label>Status<select data-filter="status"><option value="">All statuses</option>${optionList(['Pending','Approved','Rejected','Completed','Cancelled'],state.status)}</select></label></div>
    <div class="stack">${cards || empty('No mentorship records match this view.')}</div>`;
}
function events(d) {
  const admin=d.me.role==='admin';
  const cards=d.events.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(ev=>{
    const registered=d.registrations.some(r=>r.event===ev.id && r.member===d.me.id && ['Pending','Confirmed'].includes(r.status));
    const remaining=ev.seats-ev.taken;
    const acts=admin?button('Edit','editEvent',ev.id)+button('Remove','removeEvent',ev.id,'quiet'):
      registered?'Seat requested or confirmed':ev.date<today()?'Event ended':remaining===0?'Fully booked':button('Register for event','attend',ev.id,'btn');
    return `<article class="event"><h2>${e(ev.title)}</h2><p>${niceDate(ev.date)} · ${e(ev.venue)}</p><p class="muted">${remaining} of ${ev.seats} seats available</p><div class="btn-row">${acts}</div></article>`;
  }).join('');
  return pageHead('Events','School reunions, workshops and member registrations.',admin?button('Add event','editEvent','','btn'):'') +
    `<div class="cards">${cards||empty('No events have been posted yet.')}</div><section class="panel details"><h2>${admin?'All registrations':'My registrations'}</h2>
    ${d.registrations.length ? `<ul class="items">${d.registrations.map(r=>{
      const acts=admin && r.status==='Pending'?button('Confirm','confirmSeat',r.id)+button('Reject','rejectSeat',r.id):r.member===d.me.id&&['Pending','Confirmed'].includes(r.status)?button('Cancel registration','cancelSeat',r.id):'';
      return `<li><div class="card-top"><div><b>${e(d.events.find(ev=>ev.id===r.event)?.title || r.title)}</b> · ${e(r.name)}</div>${badge(r.status)}</div><div class="btn-row">${acts}</div></li>`;
    }).join('')}</ul>`:empty('No event registrations yet.')}</section>`;
}
function noteList(list) {
  return list.length?`<ul class="items">${list.map(n=>`<li><p>${e(n.message)}</p><small>${niceDate(n.at)}</small></li>`).join('')}</ul>`:empty('No notifications yet.');
}
function draw() {
  if (adminInvite) {
    document.title = 'Administrator setup · School Alumini Portal for Management';
    site.innerHTML=adminSetupPage();
    return;
  }
  const d=state.data;
  const pages={dashboard,alumni:directory,schools:schoolsPage,mentorship,events,insights,
    notes:data=>pageHead('Notifications','Updates on your registrations and mentorship activity.')+`<section class="panel">${noteList(data.notifications)}</section>`};
  if (!d) {site.innerHTML=authPage(); if (state.connectionError) showError(state.connectionError); return;}
  site.innerHTML=atlasShell(d,pages[state.page](d));
  document.title=tabs[state.page]+' · School Alumini Portal for Management';
}
let toastTimer;
let viewRevision=0;
function toast(message) {
  const target=document.querySelector('#feedback');
  target.textContent=message;target.hidden=false;
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>{target.hidden=true;},4500);
}
function showError(message,form) {
  const target=(form || site).querySelector('[data-error]');
  if (target) target.textContent=message; else toast(message);
}
function navigate(key,scroll=true) {
  if (!Object.hasOwn(tabs,key)) return;
  state.page=key;draw();
  if (state.data && location.hash.slice(1)!==key) location.hash=key;
  if (scroll) window.scrollTo(0,0);
}
function setGuest(mode='login') {
  viewRevision++;
  if (dialog.open) dialog.close();
  state.data=null;state.sample=false;state.auth=mode;state.page='dashboard';state.status='';state.chartSchool='';
  state.directory={query:'',school:'',batch:'',mentors:false};
  history.replaceState(null,'',location.pathname+location.search);draw();window.scrollTo(0,0);
}
async function api(action,body={}) {
  if (location.protocol==='file:') throw new Error('To use real accounts, run npm start in the extracted project and open http://localhost:3000. The sample works here.');
  let response;
  try {
    response=await fetch('/api/network',action?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,action}),cache:'no-store'}:{cache:'no-store'});
  } catch { throw new Error('Cannot reach the school server. Check your connection and try again.'); }
  let data;
  try {data=await response.json();} catch {throw new Error('The school API is unavailable. Run npm start locally or deploy the entire project folder to Vercel.');}
  if (!response.ok) {
    if (response.status===401 && state.data && !state.sample) setGuest();
    throw new Error(data.error||'The request could not be completed.');
  }
  return data;
}
async function refresh(initial=false) {
  if ((state.sample && !initial) || state.busy || dialog.open || location.protocol==='file:') return;
  if (adminInvite) return;
  const revision=viewRevision;
  try {
    const data=await api();
    if ((!initial && state.sample) || revision!==viewRevision || state.busy || dialog.open) return;
    const modeChanged = state.previewOnly !== Boolean(data.previewOnly);
    state.previewOnly = Boolean(data.previewOnly);
    state.guestSchools=data.schools || [];
    state.connectionError='';
    if (data.me) {
      state.sample=false;
      const changed=JSON.stringify(state.data)!==JSON.stringify(data);
      state.data=data;
      const hash=location.hash.slice(1);
      if (Object.hasOwn(tabs,hash)) state.page=hash;
      if (changed) draw();
    } else if (state.data && !state.sample) setGuest();
    else {
      if (modeChanged) draw();
      const list=document.querySelector('#school-list');
      if (list) list.innerHTML=optionList(state.guestSchools,'');
      const error=site.querySelector('[data-error]');
      if (error?.dataset.connection) {error.textContent='';delete error.dataset.connection;}
    }
  } catch(error) {
    if (state.sample || revision!==viewRevision || state.busy) return;
    if (!state.data) state.connectionError=error.message;
    const el=site.querySelector('[data-error]');
    if (el) el.dataset.connection='true';
    showError(error.message);
  }
}
async function commit(action,body,success,form) {
  if (state.busy) return;
  state.busy=true;viewRevision++;
  const trigger=form?.querySelector('[type="submit"]');
  if (trigger) trigger.disabled=true;
  try {
    const data=state.sample?sampleChange(action,body):await api(action,body);
    if (action==='activateAdmin') adminInvite='';
    if (dialog.open) dialog.close();
    state.connectionError='';
    if (action==='logout') setGuest();
    else {
      state.data=data;
      if (['login','register','activateAdmin'].includes(action)) navigate('dashboard');
      else draw();
    }
    if (success) toast(success);
  } catch(error) {showError(error.message,form?.isConnected ? form : null);}
  finally {state.busy=false;if (trigger) trigger.disabled=false;}
}
function openDialog(title,contents,action,id,submit='Save') {
  dialog.innerHTML=`<div class="card-top"><h2 id="dialog-title">${e(title)}</h2>${button('×','close','','close').replace('type="button"','type="button" aria-label="Close dialog"')}</div>
    <form class="form-grid" data-form="${action}" data-id="${e(id)}">${contents}${noError()}<div class="btn-row">
    ${button('Cancel','close')}<button type="submit" class="btn">${e(submit)}</button></div></form>`;
  dialog.showModal();
}
const statusActions=['Approved','Rejected','Cancelled','Completed'];
const attendanceActions={confirmSeat:'Confirmed',rejectSeat:'Rejected',cancelSeat:'Cancelled'};
document.addEventListener('click',event=>{
  const target=event.target.closest('button[data-action]');
  if (!target || state.busy) return;
  const {action,id}=target.dataset;
  if (action==='close') {dialog.close();return;}
  if (action==='password') {
    const element=target.parentElement.querySelector('input');
    const visible=element.type==='password';
    element.type=visible?'text':'password';target.textContent=visible?'Hide':'Show';
    target.setAttribute('aria-label',visible?'Hide password':'Show password');target.setAttribute('aria-pressed',visible);
    return;
  }
  if (action==='menu') {
    const shell=site.querySelector('.atlas-shell');const open=shell.classList.toggle('menu-open');
    shell.querySelector('.scrim').hidden=!open;const toggle=shell.querySelector('.mobile-menu');toggle.setAttribute('aria-expanded',String(open));
    if(open)shell.querySelector('.rail-nav [aria-current]')?.focus();else toggle.focus();return;
  }
  if (action==='account'){atlasAccount();return;}
  if (action==='demoRole' && state.sample && ['student','alumni','admin'].includes(id)){
    demo.role=id;state.data=sampleNetwork();dialog.close();state.status='';draw();toast('Switched to the '+roleName(id).toLowerCase()+' sample view.');return;
  }
  if (action==='enterAccount'){setGuest('login');return;}
  if (action==='search'){atlasSearch();return;}
  if (action==='person'){openProfile(id);return;}
  if (action==='credits'){
    readDialog('Photo credits','<ul class="photo-credits"><li>LPU Open-Air Theatre by <b>Tanya2016</b>. The photo is cropped in the homepage banner. <a href="https://commons.wikimedia.org/wiki/File:Admission-block-copy.jpg">Original photograph</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></li><li>School covers are AI-generated illustrations of each discipline.</li></ul>');return;
  }
  if(dialog.open && ['page','ask','viewMentorship','logout'].includes(action))dialog.close();
  if (action==='auth') {state.auth=id;draw();return;}
  if (action==='startRegister') {setGuest('register');return;}
  if (action==='sample') {
    adminInvite='';viewRevision++;state.sample=true;state.data=window.sampleNetwork();state.status='';state.chartSchool='';
    navigate('dashboard');return;
  }
  if (action==='page') {navigate(id);refresh();return;}
  if (action==='logout') {
    if (state.sample) setGuest(); else commit('logout',{},'Logged out.');
    return;
  }
  if (action==='school' || action==='findMentor') {
    state.directory={query:'',school:action==='school'?id:'',batch:'',mentors:action==='findMentor'};
    navigate('alumni');return;
  }
  if (action==='viewMentorship') {
    state.status='';navigate('mentorship');
    const el=document.getElementById('record-'+id);
    if (el) {el.querySelector('details').open=true;el.focus();}
    return;
  }
  const d=state.data;
  if (!d) return;
  const profile=d.alumni.find(a=>a.id===id);
  if (action==='ask' && profile) {
    openDialog('Request mentorship',`<p>Send a request to <b>${e(profile.name)}</b> at ${e(profile.school)}.</p>
      ${input('Topic','topic','','minlength="3" maxlength="100" placeholder="e.g. Choosing an engineering branch" required')}
      ${textArea('What would you like help with?','message','minlength="10" maxlength="1600" required')}`,'request',id,'Send request');
  } else if (action==='log') {
    openDialog('Log a session',`<p class="hint">These notes are visible to both participants and the administrator.</p>${input('Session date','date',today(),`max="${today()}" required`,'date')}
      ${textArea('What did you work on?','notes','minlength="5" maxlength="1600" required')}
      ${textArea('Next step (optional)','next','maxlength="500"')}`,'session',id,'Save session');
    dialog.querySelector('form').dataset.entryId=crypto.randomUUID();
  } else if (action==='editProfile') {
    const row=profile || {owner:null};
    openDialog(profile?'Edit alumni profile':'Add alumni record',
      `${input('Full name','name',row.name,'minlength="2" maxlength="80" required')}${schoolField(row.school)}${schoolOptions()}
       ${alumniFields(row)}`,'profile',id);
  } else if (action==='editEvent') {
    const ev=d.events.find(r=>r.id===id)||{};
    openDialog(ev.id?'Edit event':'Add event',`${input('Event title','title',ev.title,'minlength="3" maxlength="120" required')}
      ${input('Event date','date',ev.date,'required','date')}${input('Venue','venue',ev.venue,'maxlength="140" required')}
      ${input('Seats','seats',ev.seats,'min="1" max="100000" required','number')}`,'event',id);
  } else if (['removeProfile','removeEvent'].includes(action)) {
    const isProfile=action==='removeProfile';
    openDialog(isProfile?'Remove alumni profile?':'Remove event?',`<p>${isProfile?'This removes the directory listing. Existing mentorship records stay available.':'This cancels active registrations and removes the event.'}</p>`,action,id,'Remove');
  } else if (statusActions.includes(action)) {
    const labels={Approved:'Approve mentorship',Rejected:'Decline request',Cancelled:'Cancel request',Completed:'Complete mentorship'};
    const copy=action==='Completed'?'The session log will close and remain available to both participants.':'Both participants will see the updated status in their request history.';
    openDialog(labels[action],`<p>${copy}</p><input type="hidden" name="status" value="${action}">`,'status',id,'Confirm');
  } else if (Object.hasOwn(attendanceActions,action)) {
    openDialog('Update registration',`<p>Change this registration to ${e(attendanceActions[action].toLowerCase())}?</p><input type="hidden" name="status" value="${attendanceActions[action]}">`,'attendance',id,'Confirm');
  } else if (action==='attend') commit('attend',{id},'Event registration submitted.');
});
document.addEventListener('submit',event=>{
  const form=event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  if (state.busy) return;
  const fields=Object.fromEntries(new FormData(form));
  if (form.dataset.form === 'activateAdmin') fields.invite=adminInvite;
  if (form.dataset.id) fields.id=form.dataset.id;
  if (form.dataset.entryId) fields.entryId=form.dataset.entryId;
  if (form.elements.mentoring) fields.mentoring=form.elements.mentoring.checked;
  const messages={activateAdmin:'Administrator account activated.',register:'Account created.',login:'Logged in.',request:'Mentorship request sent.',profile:'Alumni profile saved.',
    session:'Session recorded.',status:'Mentorship updated.',event:'Event saved.',attendance:'Registration updated.',removeEvent:'Event removed.',removeProfile:'Profile removed.'};
  commit(form.dataset.form,fields,messages[form.dataset.form],form);
});
document.addEventListener('input',event=>{
  if(event.target.id==='global-search'){searchResults(event.target.value);return;}
  if (event.target.dataset.filter==='query') {
    state.directory.query=event.target.value;
    document.querySelector('#directory-results').innerHTML=directoryResults(state.data);
  }
});
document.addEventListener('change',event=>{
  const target=event.target;
  if (target.name==='role') {
    const alumni=target.value==='alumni';
    const fields=site.querySelector('[data-alumni-fields]');
    fields.hidden=!alumni;
    for (const item of fields.querySelectorAll('input')) item.disabled=!alumni;
  }
  const filter=target.dataset.filter;
  if (!filter || filter==='query') return;
  if (['status','chartSchool'].includes(filter)) {
    state[filter]=target.value;draw();site.querySelector(`[data-filter="${filter}"]`)?.focus();
  } else {
    state.directory[filter]=filter==='mentors'?target.checked:target.value;
    document.querySelector('#directory-results').innerHTML=directoryResults(state.data);
  }
});
window.addEventListener('hashchange',()=>{
  const page=location.hash.slice(1);
  if (state.data && Object.hasOwn(tabs,page) && state.page!==page) navigate(page);
});
window.addEventListener('focus',()=>{if (state.data) refresh();});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&site.querySelector('.menu-open'))site.querySelector('.mobile-menu').click();
 if(event.key==='/'&&!dialog.open&&state.data&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.closest('input,textarea,select,[contenteditable]')){
   event.preventDefault();atlasSearch();
 }
});
let adminInvite = /^#activate=([a-f0-9]{64})$/.exec(location.hash)?.[1] || '';
if (adminInvite) {
  state.data=null;
  state.sample=false;
  history.replaceState(null,'',location.pathname+location.search);
}
if(Object.hasOwn(tabs,location.hash.slice(1)))state.page=location.hash.slice(1);
draw();
refresh(true);
