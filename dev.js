import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { createHandler } from './server/handler.js';
import { localStore } from './server/local-store.js';

const root = fileURLToPath(new URL('.', import.meta.url));
if (existsSync(resolve(root, '.env'))) process.loadEnvFile(resolve(root, '.env'));
const pub = resolve(root, 'public');
const handle = createHandler(localStore(resolve(root, '.data')));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const args = process.argv.slice(2);
const arg = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const port = Number(arg('--port') || process.env.PORT || 3000);
const host = arg('--host') || '127.0.0.1';
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://' + req.headers.host);
    if (url.pathname === '/api/network') {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 16000) { res.writeHead(413); res.end(); return; }
        chunks.push(chunk);
      }
      const body = req.method === 'POST' ? Buffer.concat(chunks) : undefined;
      const result = await handle(new Request(url, { method: req.method, headers: req.headers, body }));
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(await result.text());
      return;
    }
    const path = resolve(pub, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!path.startsWith(pub + sep)) { res.writeHead(404); res.end(); return; }
    const bytes = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    res.end(bytes);
  } catch { res.writeHead(404); res.end('File unavailable.'); }
});
server.listen(port, host, () => console.log('School Alumini Portal for Management is running at http://' + host + ':' + port));
