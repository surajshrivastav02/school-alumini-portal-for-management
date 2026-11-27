/* Fictional network for the standalone preview. All edits last for this tab only. */
const sampleSchools = ['School of Computer Science & Engineering','Mittal School of Business','School of Design'];
const samplePeople = [
 ['Riya Sharma',0,2018,'Software engineer','Bengaluru',true],['Kabir Rao',2,2021,'Product designer','Pune',true],
 ['Ananya Bose',1,2019,'Strategy consultant','Mumbai',true],['Aarav Sethi',0,2020,'Data scientist','Hyderabad',true],
 ['Ira Malhotra',2,2017,'Architect','Jaipur',true],['Dev Iyer',1,2016,'Founder','Delhi',false],
 ['Neha Singh',0,2022,'Machine learning engineer','Pune',true],['Mehul Shah',1,2020,'Financial analyst','Mumbai',false],
 ['Sana Ali',2,2019,'Industrial designer','Chandigarh',false],['Rehan Das',0,2017,'Systems engineer','Bengaluru',false],
 ['Tanvi Gill',1,2021,'Brand manager','Delhi',true],['Vikram Sen',2,2018,'Art director','Chennai',false]
];
const sampleDay = (offset=0) => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()+offset*86400000));
const demo = {
 role:'student',
 alumni:samplePeople.map(([name,school,batch,profession,city,mentoring],i)=>({id:'alum-'+i,owner:'member-'+i,name,school:sampleSchools[school],batch,profession,city,mentoring})),
 events:[
 {id:'reunion',title:'Alumni Homecoming',date:sampleDay(12),venue:'LPU Open-Air Theatre',seats:120},
 {id:'talk',title:'From campus to career',date:sampleDay(20),venue:'Online · Career conversation',seats:60},
 {id:'meet',title:'Design alumni roundtable',date:sampleDay(29),venue:'School of Design',seats:32}
 ],
 requests:[{id:'req-a',student:'demo-student',studentName:'Isha Kapoor',mentor:'member-0',mentorName:'Riya Sharma',school:sampleSchools[0],topic:'Preparing for a software internship',message:'Could we discuss my portfolio and practise explaining my first project?',at:sampleDay(-7),status:'Approved',sessions:[{id:'session-1',date:sampleDay(-3),notes:'Reviewed a portfolio project and discussed the interview process.',next:'Prepare a two-minute project walkthrough.',by:'Riya Sharma'}],history:[{status:'Pending',by:'Isha Kapoor',at:sampleDay(-7)},{status:'Approved',by:'Riya Sharma',at:sampleDay(-6)}]}],
 registrations:[],notifications:[{to:'demo-student',at:sampleDay(-3),message:'Riya Sharma added a mentorship session.'}]
};
const demoAdmin={id:'demo-admin',name:'Demo administrator',role:'admin'};
function demoMember(){
 if(demo.role==='admin')return demoAdmin;
 if(demo.role==='alumni')return {id:'member-0',name:demo.alumni.find(a=>a.owner==='member-0')?.name||'Riya Sharma',role:'alumni',school:sampleSchools[0]};
 return {id:'demo-student',name:'Isha Kapoor',role:'student',school:sampleSchools[0]};
}
function sampleNetwork(){
 const me=demoMember(), admin=me.role==='admin';
 return {me,schools:[...new Set([...sampleSchools,...demo.alumni.map(a=>a.school)])],alumni:demo.alumni,
 events:demo.events.map(ev=>({...ev,taken:demo.registrations.filter(r=>r.event===ev.id&&['Pending','Confirmed'].includes(r.status)).length})),
 requests:demo.requests.filter(r=>admin||[r.student,r.mentor].includes(me.id)),
 registrations:demo.registrations.filter(r=>admin||r.member===me.id),notifications:demo.notifications.filter(n=>n.to===me.id)};
}
function sampleChange(action,b){
 const me=demoMember(), admin=me.role==='admin', id=crypto.randomUUID(), at=sampleDay();
 const note=(to,message)=>demo.notifications.unshift({to,message,at});
 const valid=(ok,message='This action is unavailable in this view.')=>{if(!ok)throw Error(message)};
 const row=demo.alumni.find(a=>a.id===b.id), ev=demo.events.find(a=>a.id===b.id);
 if(action==='request'){
  valid(me.role==='student'&&row?.mentoring&&row.owner);
  valid(!demo.requests.some(r=>r.student===me.id&&r.mentor===row.owner&&['Pending','Approved'].includes(r.status)),'You already have an open request.');
  demo.requests.unshift({id,student:me.id,studentName:me.name,mentor:row.owner,mentorName:row.name,school:row.school,topic:b.topic,message:b.message,at,status:'Pending',sessions:[],history:[{status:'Pending',by:me.name,at}]});note(row.owner,me.name+' requested mentorship.');
 }else if(action==='status'||action==='session'){
  const r=demo.requests.find(r=>r.id===b.id);valid(r&&[r.student,r.mentor].includes(me.id));
  if(action==='session'){valid(r.status==='Approved');r.sessions.unshift({id:b.entryId,by:me.name,date:b.date,notes:b.notes,next:b.next});}
  else{valid((r.status==='Approved'&&b.status==='Completed')||(r.status==='Pending'&&(me.id===r.mentor?['Approved','Rejected'].includes(b.status):b.status==='Cancelled')));r.status=b.status;r.history.push({status:b.status,by:me.name,at});}
  note(me.id===r.student?r.mentor:r.student,me.name+' updated '+r.topic+'.');
 }else if(action==='attend'){
  valid(!admin&&ev&&ev.date>=at);const active=demo.registrations.filter(r=>r.event===ev.id&&['Pending','Confirmed'].includes(r.status));
  valid(active.length<ev.seats&&!active.some(r=>r.member===me.id),'This seat is already reserved or the event is full.');
  demo.registrations.unshift({id,event:ev.id,member:me.id,name:me.name,title:ev.title,status:'Pending'});note(demoAdmin.id,'New registration for '+ev.title+'.');
 }else if(action==='attendance'){
  const r=demo.registrations.find(r=>r.id===b.id);
  valid(r&&((admin&&r.status==='Pending'&&['Rejected','Confirmed'].includes(b.status))||(r.member===me.id&&['Pending','Confirmed'].includes(r.status)&&b.status==='Cancelled')));
  r.status=b.status;note(r.member,r.title+' registration is '+b.status.toLowerCase()+'.');
 }else if(action==='profile'){
  valid(admin||row?.owner===me.id);const fields={name:b.name.trim(),school:b.school.trim(),profession:b.profession.trim(),city:b.city.trim(),batch:Number(b.batch),mentoring:!!row?.owner&&b.mentoring};
  if(row)Object.assign(row,fields);else demo.alumni.push({id,owner:null,...fields});
 }else if(action==='removeProfile'){valid(admin&&row);demo.alumni=demo.alumni.filter(a=>a.id!==row.id);}
 else if(action==='event'){
  valid(admin);const seats=Number(b.seats);valid(!ev||seats>=sampleNetwork().events.find(x=>x.id===ev.id).taken,'Capacity must include reserved seats.');
  const data={title:b.title,date:b.date,seats,venue:b.venue};if(ev)Object.assign(ev,data);else demo.events.push({id,...data});
 }else if(action==='removeEvent'){valid(admin&&ev);demo.events=demo.events.filter(a=>a.id!==ev.id);for(const r of demo.registrations.filter(r=>r.event===ev.id&&['Pending','Confirmed'].includes(r.status))){r.status='Cancelled';note(r.member,ev.title+' was cancelled.');}}
 else throw Error('Unknown preview action.');
 return sampleNetwork();
}
