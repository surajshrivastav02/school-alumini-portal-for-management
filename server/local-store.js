import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { emptyDatabase } from './store.js';

// Only used by the local, single-process development server.
export function localStore(folder) {
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  const filename = join(folder, 'records.json');
  const ephemeral = new Map();
  const now = () => Math.floor(Date.now() / 1000);
  const timer = setInterval(() => {
    for (const [key, record] of ephemeral) if (record.until <= now()) ephemeral.delete(key);
  }, 60000);
  timer.unref();
  function read() {
    try { return JSON.parse(readFileSync(filename, 'utf8')); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      return { version: 0, data: emptyDatabase() };
    }
  }
  function get(key) {
    const record = ephemeral.get(key);
    return record && record.until > now() ? record.value : null;
  }
  return {
    read, get,
    commit(version, data) {
      if (version !== read().version) return false;
      writeFileSync(filename + '.tmp', JSON.stringify({ version: version + 1, data }), { mode: 0o600 });
      renameSync(filename + '.tmp', filename);
      return true;
    },
    set(key, value, ttl) { ephemeral.set(key, { value, until: now() + ttl }); },
    remove(key) { ephemeral.delete(key); },
    increment(key, ttl) {
      const previous = get(key);
      const value = (previous || 0) + 1;
      ephemeral.set(key, { value, until: previous ? ephemeral.get(key).until : now() + ttl });
      return value;
    }
  };
}
