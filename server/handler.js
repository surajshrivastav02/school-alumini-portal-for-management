import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { transaction, Problem } from './store.js';
import { addUser, check, email, mutate, schools, snapshot } from './records.js';

const derive = promisify(scrypt);
const digest = value => createHash('sha256').update(value).digest('hex');
const lifetime = 60 * 60 * 24 * 7;
async function encodePassword(password, salt = randomBytes(16).toString('hex')) {
  const key = await derive(password, salt, 64);
  return salt + ':' + key.toString('hex');
}
function same(left, right) {
  return timingSafeEqual(Buffer.from(digest(left)), Buffer.from(digest(right)));
}
function adminConfig() {
  const address = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!address || !password || password.length < 12) return null;
  return { id: 'admin', role: 'admin', name: 'Administrator', email: address, password };
}
function member(db, identity, admin) {
  if (admin && identity === 'admin:' + digest(admin.email + '\0' + admin.password)) return admin;
  return db.users.find(u => u.id === identity);
}
function sessionKey(req) {
  const token = req.headers.get('cookie')?.match(/(?:^|;\s*)alumni_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  return token ? 'session:' + digest(token) : null;
}
function reply(body, status = 200, cookie) {
  const headers = {'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', 'Vary': 'Cookie'};
  if (cookie) headers['Set-Cookie'] = cookie;
  return new Response(JSON.stringify(body), {status, headers});
}
function cookie(req, token, age) {
  const secure = new URL(req.url).protocol === 'https:' || Boolean(process.env.VERCEL);
  return 'alumni_session=' + token + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + age + (secure ? '; Secure' : '');
}
async function issueSession(req, store, identity) {
  const token = randomBytes(32).toString('hex');
  await store.set('session:' + digest(token), identity, lifetime);
  return cookie(req, token, lifetime);
}
async function limit(store, action, address, remote) {
  const window = 15 * 60;
  const hits = await store.increment('limit:' + action + ':ip:' + digest(remote), window);
  check(hits <= (action === 'login' ? 80 : 35), 'Too many attempts. Try again in 15 minutes.', 429);
  if (action === 'login') {
    const perEmail = await store.increment('limit:login:email:' + digest(address), window);
    check(perEmail <= 15, 'Too many sign-in attempts for this email. Try again in 15 minutes.', 429);
  }
}

export function createHandler(store) {
  return async function handle(req) {
    try {
      const key = sessionKey(req);
      const admin = adminConfig();
      if (req.method === 'GET') {
        if (store.configured === false) return reply({ me: null, schools: [], previewOnly: true });
        const { data } = await store.read();
        const who = key && member(data, await store.get(key), admin);
        return reply(who ? snapshot(data, who) : { me: null, schools: schools(data) });
      }
      check(req.method === 'POST', 'Method unavailable.', 405);
      const origin = req.headers.get('origin');
      check(!origin || new URL(req.url).origin === origin, 'Please use the form on this website.', 403);
      check(req.headers.get('content-type')?.split(';')[0] === 'application/json', 'Send a JSON form.', 415);
      check(Number(req.headers.get('content-length') || 0) <= 16000, 'Form is too large.', 413);
      const raw = await req.text();
      check(Buffer.byteLength(raw) <= 16000, 'Form is too large.', 413);
      let body;
      try { body = JSON.parse(raw); } catch { throw new Problem(400, 'Invalid form.'); }
      check(body && typeof body === 'object' && !Array.isArray(body), 'Invalid form.');
      const action = body.action;
      if (action === 'logout') {
        if (key) await store.remove(key);
        return reply({ me: null }, 200, cookie(req, '', 0));
      }
      if (action === 'register' || action === 'login') {
        const address = email(body.email);
        const remote = req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() || 'local';
        await limit(store, action, address, remote);
        check(typeof body.password === 'string' && body.password.length > 0 && body.password.length <= 200,
          'Enter a password with up to 200 characters.');
        let identity;
        let view;
        if (action === 'register') {
          check(body.password.length >= 10, 'Choose a password of at least 10 characters.');
          const hash = await encodePassword(body.password);
          view = await transaction(store, db => {
            const userId = addUser(db, body, hash, admin?.email);
            return snapshot(db, member(db, userId, admin));
          });
          identity = view.me.id;
        } else {
          const { data } = await store.read();
          if (admin && address === admin.email && same(admin.password, body.password)) {
            identity = 'admin:' + digest(admin.email + '\0' + admin.password);
          } else {
            const user = data.users.find(u => u.email === address && u.email !== admin?.email);
            const derived = await encodePassword(body.password, user?.hash.split(':')[0] || '6a7545c147ed325bcf47568a12d491f5');
            check(user && same(derived, user.hash), 'The email or password is incorrect.', 401);
            identity = user.id;
          }
          view = snapshot(data, member(data, identity, admin));
        }
        return reply(view, 200, await issueSession(req, store, identity));
      }
      const identity = key && await store.get(key);
      check(identity, 'Your session has ended. Please log in.', 401);
      const result = await transaction(store, db => {
        const who = member(db, identity, admin);
        check(who, 'Your session has ended. Please log in.', 401);
        mutate(db, who, action, body);
        return snapshot(db, who);
      });
      return reply(result);
    } catch (error) {
      if (error instanceof Problem) return reply({ error: error.message }, error.status);
      console.error('Alumni API request failed:', error.name);
      return reply({ error: 'The server could not complete this request. Please try again.' }, 503);
    }
  };
}
