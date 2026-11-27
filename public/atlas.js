const iconPaths = {
 overview:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 people:'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16-1v-1a4 4 0 0 0-3-3.8"/><circle cx="10" cy="8" r="4"/><path d="M16 4.3a4 4 0 0 1 0 7.5"/>',
 school:'<path d="m2 8 10-5 10 5-10 5zM5 11v6l7 4 7-4v-6m3-3v7"/>',
 mentor:'<path d="M2 8l4-4 5 2 3-1 4 1 4 4-3 4-6 6-3-1-5-5zm6 7 4 3m-1-6 5 4m-5-10-3 4a2 2 0 0 0 3 2l2-2 6 5"/>',
 events:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5m10-5v5M3 11h18m-13 4h2m4 0h2"/>',
 insights:'<path d="M4 3v17h17M8 16v-4m5 4V7m5 9v-6"/>',notes:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9m-8 12a2 2 0 0 0 4 0"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.7"/><path d="m16 16 5 5"/>',location:'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 chev:'<path d="m9 5 7 7-7 7"/>',down:'<path d="m6 9 6 6 6-6"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',
 code:'<path d="m7 7-5 5 5 5m10-10 5 5-5 5m-4-13-3 16"/>',business:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V4h8v3M2 12c5 4 15 4 20 0m-10 1v3"/>',
 design:'<path d="m4 20 1-6L16 3l5 5L10 19zm9-14 5 5M5 15l4 4"/>',building:'<path d="m2 8 10-5 10 5M4 10h16M6 10v8m6-8v8m6-8v8M3 21h18"/>',
 layers:'<path d="m3 8 9-5 9 5-9 5zm0 4 9 5 9-5m-18 4 9 5 9-5"/>',login:'<path d="M13 3h6v18h-6M3 12h12m-5-5 5 5-5 5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',book:'<path d="M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2zm9 2v15"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>'
};
function icon(name){return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.book}</svg>`;}
const navIcons={dashboard:'overview',alumni:'people',schools:'building',mentorship:'mentor',events:'events',insights:'insights',notes:'notes'};
const roleName=r=>({alumni:'Alumni',student:'Student',admin:'Administrator'})[r]||'Guest';
function mark(){return `<span class="brand-mark"><img src="assets/atlas.svg" width="41" height="41" alt=""></span><span><strong>School Alumini</strong><small>Portal for Management</small></span>`;}
function actionBtn(label,action,id,cls='',ico=''){return `<button type="button" data-action="${action}" data-id="${e(id)}" class="${cls}">${ico?icon(ico):''}${e(label)}</button>`;}
function sidebar(d){
 const nav=keys=>keys.map(k=>`<button type="button" data-action="page" data-id="${k}" ${state.page===k?'aria-current="page"':''}>${icon(navIcons[k])}<span>${e(tabs[k])}</span></button>`).join('');
 return `<aside class="rail" id="atlas-navigation"><button class="atlas-brand" data-action="page" data-id="dashboard" aria-label="School Alumini Portal for Management overview">${mark()}</button>
 <nav class="rail-nav" aria-label="Workspace"><h2>Workspace</h2>${nav(['dashboard','alumni','schools','mentorship','events'])}<h2>Reporting</h2>${nav(['insights','notes'])}</nav>
 <div class="rail-bottom"><span class="campus-icon">${icon('building')}</span><div><strong>Lovely Professional<br>University</strong><small>Phagwara, Punjab</small></div></div></aside>`;
}
function atlasShell(d,body){
 const initials=d.me.name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('');
 return `<div class="atlas-shell">${sidebar(d)}<button class="scrim" data-action="menu" aria-label="Close navigation" hidden></button><div class="canvas">
 <header class="topline"><div class="crumb"><button class="mobile-menu icon-btn" data-action="menu" aria-controls="atlas-navigation" aria-expanded="false" aria-label="Open navigation">${icon('menu')}</button><span>Workspace</span>${icon('chev')}<b>${e(tabs[state.page])}</b></div>
 <div class="top-actions"><button class="top-search" data-action="search">${icon('search')}<span>Search the network</span><kbd>/</kbd></button>
 <button class="top-bell icon-btn" data-action="page" data-id="notes" aria-label="View notifications">${icon('notes')}</button><button class="user-chip" data-action="account" aria-label="Account and workspace options"><span>${e(initials)}</span><b class="chip-role">${e(roleName(d.me.role))}${state.sample?' demo':''}</b>${icon('down')}</button></div></header>
 <main class="atlas-main" id="main" tabindex="-1">${body}</main><footer class="atlas-footer"><span>School Alumini Portal for Management · Independent student project</span><div>${state.sample?'<button data-action="account">Sample workspace</button> · ':''}<button data-action="credits">Photo credits</button> · <a href="https://github.com/surajshrivastav02">GitHub</a></div></footer></div></div>`;
}
function schoolMeta(name){
 if(/business|manage|commerce|finance/i.test(name))return {title:name===sampleSchools[1]?'Business & Management':name,photo:'business',glyph:'business',tone:'amber'};
 if(/design|architecture|art\b/i.test(name))return {title:name===sampleSchools[2]?'Design & Architecture':name,photo:'design',glyph:'design',tone:'plum'};
 if(/computer|engin|technolog/i.test(name))return {title:name===sampleSchools[0]?'Computer Science & Engineering':name,photo:'engineering',glyph:'code',tone:'aqua'};
 return {title:name,photo:'lpu-open-air-theatre',glyph:'school',tone:'aqua'};
}
function schoolCards(d,subset=d.schools){
 if(!subset.length)return empty('Schools appear here when the first members join.');
 return `<div class="school-grid">${subset.map(s=>{const m=schoolMeta(s);const rows=d.alumni.filter(a=>a.school===s);return `<button class="school-tile ${m.tone}" data-action="school" data-id="${e(s)}"><span class="tile-media"><img src="assets/${m.photo}.webp" alt="" loading="lazy"><span class="tile-glyph">${icon(m.glyph)}</span></span><span class="tile-copy"><b>${e(m.title)}</b><small>${icon('people')}${rows.length} alumni</small></span></button>`;}).join('')}</div>`;
}
function sectionTitle(title,subtitle,action,id){return `<div class="atlas-section-head"><div><h2>${e(title)}</h2>${subtitle?`<p>${e(subtitle)}</p>`:''}</div>${action?actionBtn(action,'page',id,'text-action'):''}</div>`;}
function atlasDashboard(d){
 const upcoming=d.events.filter(v=>v.date>=today()).sort((a,b)=>a.date.localeCompare(b.date));
 const stats=[['people',d.alumni.length,'Alumni','alumni','jade'],['building',d.schools.length,'Schools','schools','blue'],['mentor',d.alumni.filter(a=>a.mentoring&&a.owner).length,'Available mentors','findMentor','violet'],['events',upcoming.length,'Upcoming events','events','ochre']];
 return `<section class="welcome"><img class="campus-photo" src="assets/lpu-open-air-theatre.webp" alt="The terraced LPU open-air theatre framed by the brick admission block" fetchpriority="high"><div class="hero-wash"></div>
 <div class="welcome-copy"><div class="campus-label"><span></span> LPU Alumni Network</div><h1>Once a Verto,<br><em>always a Verto.</em></h1>
 <p>Find your people, share your experience, and reconnect with the community that shaped you.</p>${actionBtn('Explore directory','page','alumni','hero-btn','people')}</div>
 <span class="photo-location">${icon('location')} LPU Open-Air Theatre</span></section>
 <section aria-label="Network at a glance" class="atlas-stats">${stats.map(([ic,n,l,key,tone])=>`<button class="atlas-stat ${tone}" data-action="${key==='findMentor'?key:'page'}" data-id="${key}"><span class="stat-icon">${icon(ic)}</span><span><b>${n}</b><small>${l}</small></span></button>`).join('')}</section>
 <section class="schools-section">${sectionTitle('Explore schools','Discover the people and professions in each school.','View all schools','schools')}${schoolCards(d,d.schools.slice(0,3))}</section>
 <div class="lower-grid"><section class="overview-panel">${sectionTitle('Upcoming events','','View events','events')}${upcoming.slice(0,3).map(ev=>{
 const date=new Date(ev.date+'T00:00:00Z');return `<button class="overview-row" data-action="page" data-id="events"><span class="date-block"><small>${date.toLocaleString('en',{month:'short',timeZone:'UTC'})}</small><b>${date.getUTCDate()}</b></span><span><strong>${e(ev.title)}</strong><small>${e(ev.venue)}</small></span></button>`;}).join('')||empty('Published events will appear here.')}</section>
 <section class="overview-panel">${sectionTitle('Meet the mentors','','View directory','alumni')}${d.alumni.filter(a=>a.mentoring&&a.owner).slice(0,3).map(a=>`<button class="overview-row" data-action="person" data-id="${e(a.id)}"><span class="list-avatar">${e(a.name.split(/\s+/).slice(0,2).map(x=>x[0]).join(''))}</span><span><strong>${e(a.name)}</strong><small>${e(a.profession)} · ${e(a.city||a.school)}</small></span></button>`).join('')||empty('Available mentors will appear here.')}</section></div>`;
}
function readDialog(title,content){
 if(dialog.open)dialog.close();
 dialog.innerHTML=`<div class="card-top"><h2 id="dialog-title">${e(title)}</h2><button class="icon-btn" data-action="close" aria-label="Close dialog">${icon('x')}</button></div>${content}`;
 dialog.showModal();
}
function atlasAccount(){
 const me=state.data.me;
 if(!state.sample){readDialog('Your account',`<p class="account-name">${e(me.name)}</p><p>${e(roleName(me.role))} · ${e(me.email||me.school||'School Alumini Portal for Management')}</p><div class="dialog-actions">${actionBtn('Sign out','logout','','btn')}</div>`);return;}
 readDialog('Sample workspace',`<p>Try the platform with fictional records. Role changes share this tab’s sample activity. Reloading resets it.</p><fieldset class="role-options"><legend>Explore as</legend>${['student','alumni','admin'].map(r=>`<button data-action="demoRole" data-id="${r}" aria-pressed="${demo.role===r}">${roleName(r)}</button>`).join('')}</fieldset>
 ${state.previewOnly?'<p class="hint">Live accounts require the connected school server.</p>':`<div class="dialog-actions">${actionBtn('Member sign in','enterAccount','','btn','login')}${actionBtn('Create account','startRegister','','soft')}</div>`}`);
}
function atlasSearch(){
 readDialog('Search the network',`<label class="searchbox"><span class="sr-only">Name, profession, school or city</span><input type="search" id="global-search" placeholder="Name, profession, school or city" autocomplete="off"></label><div id="global-results"></div>`);
 searchResults('');document.querySelector('#global-search').focus();
}
function searchResults(value){
 const key=value.trim().toLowerCase();
 const rows=state.data.alumni.filter(a=>[a.name,a.profession,a.school,a.city].join(' ').toLowerCase().includes(key)).slice(0,8);
 document.querySelector('#global-results').innerHTML=rows.length?rows.map(a=>`<button class="search-result" data-action="person" data-id="${e(a.id)}">${icon('people')}<span><b>${e(a.name)}</b><small>${e(a.profession)} · ${e(a.school)}</small></span></button>`).join(''):empty('No alumni match that search.');
}
function openProfile(id){
 const a=state.data.alumni.find(row=>row.id===id);if(!a)return;
 const active=state.data.requests.find(r=>r.student===state.data.me.id&&r.mentor===a.owner&&['Pending','Approved'].includes(r.status));
 readDialog(a.name,`<p class="profile-profession">${e(a.profession)}</p><dl class="mini-profile">${[['School',a.school],['Graduation year',a.batch],['City',a.city||'Unlisted'],['Mentorship',a.mentoring?'Available':'Unavailable']].map(([k,v])=>`<div><dt>${k}</dt><dd>${e(v)}</dd></div>`).join('')}</dl>${a.mentoring&&a.owner&&state.data.me.role==='student'?`<div class="dialog-actions">${active?actionBtn('View mentorship','viewMentorship',active.id,'btn'):actionBtn('Request mentorship','ask',id,'btn')}</div>`:''}`);
}

