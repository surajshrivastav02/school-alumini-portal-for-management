// A versioned snapshot suits a modest school directory. A compare-and-swap
// keeps concurrent registrations, seat reservations and session notes intact.
export const emptyDatabase = () => ({
  users: [], alumni: [], events: [], registrations: [], requests: [], notifications: []
});

export class Problem extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function transaction(store, change) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const { version, data } = await store.read();
    const result = change(data);
    if (await store.commit(version, data)) return result;
  }
  throw new Problem(409, 'Several records changed at once. Please try again.');
}

const saveIfCurrent = `
  local version = tonumber(redis.call('HGET', KEYS[1], 'version') or '0')
  if version ~= tonumber(ARGV[1]) then return 0 end
  redis.call('HSET', KEYS[1], 'version', version+1, 'data', ARGV[2])
  return 1`;
const countAttempt = `
  local hits = redis.call('INCR', KEYS[1])
  if hits == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
  return hits`;

export function redisStore() {
  const prefix = 'school-alumni:v1:';
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  async function command(...args) {
    if (!url || !token) throw new Problem(503, 'Shared storage needs setup. Add the two Upstash variables in Vercel and redeploy. You can still explore the sample.');
    const res = await fetch(url, {
      method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(args), signal: AbortSignal.timeout(8000), cache: 'no-store'
    });
    if (!res.ok) throw new Problem(503, 'Cannot reach shared storage. Check the database connection, then try again.');
    const { result, error } = await res.json();
    if (error) throw new Problem(503, 'Shared storage could not complete this request. Check the database and its write token.');
    return result;
  }
  return {
    configured: Boolean(url && token),
    async read() {
      const [version, data] = await command('HMGET', prefix + 'records', 'version', 'data');
      return {version: Number(version || 0), data: data ? JSON.parse(data) : emptyDatabase()};
    },
    async commit(version, data) {
      return (await command('EVAL', saveIfCurrent, 1, prefix + 'records', version, JSON.stringify(data))) === 1;
    },
    get: key => command('GET', prefix + key),
    set: (key, value, ttl) => command('SET', prefix + key, value, 'EX', ttl),
    remove: key => command('DEL', prefix + key),
    increment: (key, ttl) => command('EVAL', countAttempt, 1, prefix + key, ttl)
  };
}
