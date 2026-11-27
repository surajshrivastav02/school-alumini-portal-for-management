import { randomUUID as id } from 'node:crypto';
import { Problem } from './store.js';

const dateNow = () => new Date().toISOString();
const indiaDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
const today = () => indiaDate.format(new Date());
const maxYear = () => Number(today().slice(0, 4));
export function check(condition, message, status = 400) {
  if (!condition) throw new Problem(status, message);
}
export function field(value, label, min = 1, max = 100) {
  const text = typeof value === 'string' ? value.trim() : '';
  check(text.length >= min && text.length <= max, label + ' must be ' + min + '–' + max + ' characters.');
  return text;
}
export function email(value) {
  const text = field(value, 'Email', 3, 254).toLowerCase();
  check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text), 'Enter a valid email address.');
  return text;
}
function date(value, label) {
  check(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value), 'Choose a valid ' + label + '.');
  const parsed = new Date(value + 'T00:00:00Z');
  check(!isNaN(parsed) && parsed.toISOString().startsWith(value), 'Choose a valid ' + label + '.');
  return value;
}
function find(list, key, label) {
  const row = list.find(r => r.id === key);
  check(row, label + ' could not be found.', 404);
  return row;
}
function only(ok) { check(ok, 'This action is unavailable for your account.', 403); }
function notify(db, to, message) { db.notifications.unshift({ id: id(), to, message, at: dateNow() }); }
function canonicalSchool(db, raw) {
  const school = field(raw, 'School name', 2, 120).replace(/\s+/g, ' ');
  return schools(db).find(s => s.toLowerCase() === school.toLowerCase()) || school;
}
export function schools(db) {
  return [...new Set([...db.users, ...db.alumni].map(p => p.school).filter(Boolean))].sort((a,b) => a.localeCompare(b));
}
function profileFields(db, input) {
  const batch = Number(input.batch);
  check(Number.isInteger(batch) && batch >= 1900 && batch <= maxYear(), 'Enter a graduation year from 1900 to ' + maxYear() + '.');
  return {
    name: field(input.name, 'Name', 2, 80), school: canonicalSchool(db, input.school), batch,
    profession: field(input.profession, 'Profession or field of study', 2, 90),
    city: field(input.city, 'City', 0, 80), mentoring: input.mentoring === true
  };
}
export function addUser(db, input, hash, adminEmail) {
  const address = email(input.email);
  check(address !== adminEmail && !db.users.some(u => u.email === address), 'This email is unavailable. Try signing in.', 409);
  check(['student','alumni'].includes(input.role), 'Select a student or alumni account.');
  const name = field(input.name, 'Name', 2, 80);
  const school = canonicalSchool(db, input.school);
  const user = { id: id(), name, email: address, school, hash, role: input.role };
  if (user.role === 'alumni') {
    db.alumni.push({ id: id(), owner: user.id, ...profileFields(db, input) });
  }
  db.users.push(user);
  notify(db, 'admin', name + ' registered with ' + school + '.');
  return user.id;
}
export function snapshot(db, user) {
  const admin = user.role === 'admin';
  const requests = db.requests.filter(r => admin || r.student === user.id || r.mentor === user.id);
  const registrations = db.registrations.filter(r => admin || r.member === user.id);
  const events = db.events.map(event => ({ ...event, taken: db.registrations.filter(r =>
    r.event === event.id && ['Pending','Confirmed'].includes(r.status)).length }));
  return {
    me: { id: user.id, name: user.name, role: user.role, school: user.school || '', email: user.email },
    schools: schools(db), alumni: db.alumni, events, registrations, requests,
    notifications: db.notifications.filter(n => n.to === user.id).slice(0, 100)
  };
}
function saveProfile(db, user, body) {
  const profile = body.id ? find(db.alumni, body.id, 'Alumni profile') : null;
  only(user.role === 'admin' || (profile && profile.owner === user.id));
  const fields = profileFields(db, body);
  if (!profile) {
    db.alumni.push({ id: id(), owner: null, ...fields, mentoring: false });
    return;
  }
  Object.assign(profile, fields);
  if (!profile.owner) profile.mentoring = false;
  const member = db.users.find(u => u.id === profile.owner);
  if (member) Object.assign(member, { name: fields.name, school: fields.school });
}
function requestMentor(db, user, body) {
  only(user.role === 'student');
  const profile = find(db.alumni, body.id, 'Mentor');
  check(profile.owner && profile.mentoring, 'This alumnus is unavailable for mentoring.', 409);
  check(!db.requests.some(r => r.student === user.id && r.mentor === profile.owner &&
    ['Pending','Approved'].includes(r.status)), 'You already have an open request with this mentor.', 409);
  const topic = field(body.topic, 'Topic', 3, 100);
  db.requests.unshift({ id: id(), student: user.id, studentName: user.name, mentor: profile.owner, mentorName: profile.name,
    school: profile.school, topic, message: field(body.message, 'Message', 10, 1600),
    status: 'Pending', at: dateNow(), history: [{ status: 'Pending', at: dateNow(), by: user.name }], sessions: [] });
  notify(db, profile.owner, user.name + ' requested mentorship on “' + topic + '”.');
  notify(db, user.id, 'Request sent to ' + profile.name + '.');
}
function changeMentorship(db, user, body, action) {
  const record = find(db.requests, body.id, 'Mentorship');
  const mentor = record.mentor === user.id;
  const student = record.student === user.id;
  only(mentor || student);
  if (action === 'session') {
    check(record.status === 'Approved', 'Sessions can be logged for approved mentorships.', 409);
    const when = date(body.date, 'session date');
    check(when <= today(), 'A completed session needs today’s date or an earlier date.');
    const topics = field(body.notes, 'Session notes', 5, 1600);
    const next = field(body.next, 'Next step', 0, 500);
    const sessionId = field(body.entryId, 'Session reference', 8, 80);
    if (record.sessions.some(s => s.id === sessionId)) return;
    record.sessions.unshift({ id: sessionId, date: when, notes: topics, next, by: user.name, at: dateNow() });
    notify(db, mentor ? record.student : record.mentor, user.name + ' logged a mentorship session.');
    return;
  }
  const next = body.status;
  const allowed = (mentor && record.status === 'Pending' && ['Approved','Rejected'].includes(next))
    || (student && record.status === 'Pending' && next === 'Cancelled')
    || (record.status === 'Approved' && next === 'Completed');
  check(allowed, 'This status change is unavailable. Refresh to see the current record.', 409);
  record.status = next;
  record.history.push({ status: next, by: user.name, at: dateNow() });
  notify(db, mentor ? record.student : record.mentor, record.topic + ' is now ' + next.toLowerCase() + '.');
}
function saveEvent(db, user, body) {
  only(user.role === 'admin');
  const existing = body.id ? find(db.events, body.id, 'Event') : null;
  const seats = Number(body.seats);
  check(Number.isInteger(seats) && seats >= 1 && seats <= 100000, 'Seat count must be from 1 to 100,000.');
  const reserved = db.registrations.filter(r => r.event === body.id && ['Pending','Confirmed'].includes(r.status)).length;
  check(seats >= reserved, 'Capacity must include all reserved seats.');
  const values = { title: field(body.title, 'Event title', 3, 120), date: date(body.date, 'event date'),
    venue: field(body.venue, 'Venue', 2, 140), seats };
  if (existing) Object.assign(existing, values);
  else {
    db.events.push({ id: id(), ...values });
    for (const member of db.users) notify(db, member.id, 'New event: ' + values.title + '.');
  }
}
function registerEvent(db, user, body) {
  only(user.role !== 'admin');
  const event = find(db.events, body.id, 'Event');
  const reserved = db.registrations.filter(r => r.event === event.id && ['Pending','Confirmed'].includes(r.status));
  check(event.date >= today(), 'This event has already taken place.', 409);
  check(!reserved.some(r => r.member === user.id), 'You have already registered.', 409);
  check(reserved.length < event.seats, 'All seats are reserved.', 409);
  db.registrations.unshift({ id: id(), event: event.id, title: event.title, member: user.id, name: user.name, status: 'Pending' });
  notify(db, 'admin', user.name + ' registered for ' + event.title + '.');
  notify(db, user.id, 'Registration submitted for ' + event.title + '.');
}
export function mutate(db, user, action, body) {
  switch (action) {
    case 'profile': return saveProfile(db, user, body);
    case 'removeProfile': {
      only(user.role === 'admin');
      const p = find(db.alumni, body.id, 'Profile');
      db.alumni = db.alumni.filter(a => a.id !== p.id);
      if (p.owner) notify(db, p.owner, 'Your directory listing was removed by the administrator.');
      return;
    }
    case 'request': return requestMentor(db, user, body);
    case 'status': case 'session': return changeMentorship(db, user, body, action);
    case 'event': return saveEvent(db, user, body);
    case 'removeEvent': {
      only(user.role === 'admin');
      const event = find(db.events, body.id, 'Event');
      db.events = db.events.filter(e => e.id !== event.id);
      for (const r of db.registrations.filter(r => r.event === event.id && ['Pending','Confirmed'].includes(r.status))) {
        r.status = 'Cancelled';
        notify(db, r.member, event.title + ' was cancelled.');
      }
      return;
    }
    case 'attend': return registerEvent(db, user, body);
    case 'attendance': {
      const record = find(db.registrations, body.id, 'Registration');
      const cancel = body.status === 'Cancelled' && user.id === record.member && ['Pending','Confirmed'].includes(record.status);
      const review = user.role === 'admin' && record.status === 'Pending' && ['Confirmed','Rejected'].includes(body.status);
      only(cancel || review);
      record.status = body.status;
      notify(db, record.member, record.title + ' registration is ' + record.status.toLowerCase() + '.');
      return;
    }
    default: throw new Problem(400, 'Unknown action.');
  }
}
