import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const mapping = { '/': 'preview/index.html', '/index.html': 'preview/index.html', '/portfolio.html': 'preview/portfolio.html', '/styles.css': 'preview/styles.css' };
const types = { '.woff2':'font/woff2', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.pdf': 'application/pdf', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
export async function handlePreviewRequest(req, res) {
  try {
    const requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (['/portfolio', '/portfolio/'].includes(requested)) { res.writeHead(302, { Location: '/portfolio.html' }).end(); return; }
    let relative = mapping[requested];
    if (requested.startsWith('/public/')) relative = requested.slice(1);
    if (['/opengraph-image.svg', '/og-image.png'].includes(requested)) relative = 'public' + requested;
    if (!relative) { res.writeHead(404).end('Not found'); return; }
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (requested.startsWith('/public/') && !target.startsWith(path.join(root, 'public') + path.sep)) { res.writeHead(403).end(); return; }
    const bytes = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(bytes);
  } catch { res.writeHead(404).end('Not found'); }
}
