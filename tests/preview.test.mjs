import test from 'node:test';
import assert from 'node:assert/strict';
import { handlePreviewRequest } from '../scripts/preview-handler.mjs';
async function request(url) {
  const response = { status: 0, headers: {}, body: undefined, writeHead(status, headers = {}) { this.status = status; this.headers = headers; return this; }, end(body) { this.body = body; return this; } };
  await handlePreviewRequest({ url }, response);
  return response;
}
test('Preview routes serve real files with the correct content type, without opening a socket', async () => {
  for (const [route, type] of [['/', 'text/html'], ['/index.html', 'text/html'], ['/portfolio.html', 'text/html'], ['/styles.css', 'text/css'], ['/public/og-image.png', 'image/png']]) {
    const response = await request(route);
    assert.equal(response.status, 200, route);
    assert(response.headers['Content-Type'].includes(type), route);
    assert(response.body.length > 100, route);
  }
});
test('Preview Portfolio aliases redirect to the correct static document', async () => {
  for (const route of ['/portfolio','/portfolio/']) {
    const response = await request(route);
    assert.equal(response.status, 302);
    assert.equal(response.headers.Location, '/portfolio.html');
  }
});
test('Preview does not serve source files or traversal outside public assets', async () => {
  for (const route of ['/cv.pdf', '/public/cv.pdf', '/missing', '/package.json', '/src/data/profile.json', '/public/..%2fsrc/data/profile.json', '/public/..%2f..%2fsecret', '/%invalid']) {
    const response = await request(route);
    assert([403, 404].includes(response.status), route);
  }
});
