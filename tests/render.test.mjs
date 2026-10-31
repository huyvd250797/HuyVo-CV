import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderCv, renderPortfolio, safeWebUrl, safeEmail, safePhone, assetPath } from '../src/lib/render.mjs';
import { validateProfile } from '../scripts/check-content.mjs';
const base = JSON.parse(await readFile(new URL('../src/data/profile.json', import.meta.url), 'utf8'));

test('Draft is honest about missing content and includes all six verified units', () => {
  const html = renderCv(base);
  assert.match(html, /Hồ sơ đang hoàn thiện/);
  for (const unit of ['GDU','DTHU','HIU','EPU','DAU','INTRACOM']) assert.match(html, new RegExp(`<summary>[\\s\\S]*?>${unit}</(?:strong|span)>[\\s\\S]*?</summary>`));
  assert.doesNotMatch(html, /href="\/cv.pdf"/);
  assert.match(html, /href="\/portfolio"/);
  for (const id of ['education','skills','certificates','experience','projects','personal','objective']) assert.match(html, new RegExp(`id="${id}"`));
  assert.doesNotMatch(html, /contenteditable|data-edit=|data-photo|localStorage|<script/);
});

test('The final content section is the Portfolio entry, followed by footer', () => {
  const html = renderCv(base);
  assert(html.lastIndexOf('id="portfolio"') > html.lastIndexOf('id="contact"'));
  assert(html.indexOf('href="/portfolio"') < html.indexOf('</main>'));
});

test('Published contact links use real, validated destinations', () => {
  const p = structuredClone(base);
  Object.assign(p, { publication: 'published', name: 'Tên kiểm thử', email: 'person+cv@example.com', phone: '+84 912 345 678', website: 'https://example.com/cv', address: 'Hà Nội' });
  const html = renderCv(p);
  assert.doesNotMatch(html, /draft-note|\[Email của bạn\]/);
  assert.match(html, /mailto:person%2Bcv@example.com/);
  assert.match(html, /tel:\+84912345678/);
  assert.match(html, /href="https:\/\/example.com\/cv" target="_blank" rel="noopener noreferrer"/);
});

test('All content stays text; malicious URL schemes and attribute injection are rejected', () => {
  const p = structuredClone(base);
  p.name = '<script>alert(1)</script>';
  p.objective = '<img src=x onerror=alert(1)>';
  p.projects = [{ name: '<b>test</b>', description: '" onclick="alert(1)', role: 'Me', year: '2026', technologies: ['<svg/onload=alert(1)>'], demoUrl: 'javascript:alert(1)', sourceUrl: 'https://example.com/" onmouseover="evil' }];
  const html = renderCv(p);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<script|<img src=x|href="javascript:| onmouseover="evil/);
  for (const url of ['javascript:alert(1)','data:text/html,test','//example.com','https://user:secret@example.com']) assert.equal(safeWebUrl(url), null);
  assert.equal(safeEmail('x@example.com?subject=Injected'), null);
  assert.equal(safePhone('javascript:1234567'), null);
  for (const file of ['//evil.com/a.jpg','/../secret','/%2e%2e/secret','/a" onerror="x']) assert.equal(assetPath(file), null);
});

test('Portrait and project links render only when configured', () => {
  const p = structuredClone(base);
  p.portrait = '/portrait.jpg';
  p.projects = [{ name: 'Test', description: 'Real data', role: 'Builder', year: '2026', technologies: ['TypeScript'], demoUrl: 'https://example.com/demo', sourceUrl: 'https://example.com/repo' }];
  const html = renderCv(p, { assetPrefix: '../public' });
  assert.match(html, /src="..\/public\/portrait.jpg"/);
  assert.doesNotMatch(html, /Chờ ảnh của bạn/);
  assert.match(html, /Xem demo ↗/);
  assert.match(html, /Mã nguồn ↗/);
});

test('Portfolio placeholder has useful return and contact links, without an API dependency', () => {
  const html = renderPortfolio(base);
  assert.match(html, /đang được hoàn thiện/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/#personal"/);
  assert.doesNotMatch(html, /fetch\(|\/api\//);
  assert.match(renderPortfolio(base, { homeHref: 'index.html' }), /href="index.html#personal"/);
});

test('Content checks reject malformed data and identify unfinished release content', () => {
  const draft = validateProfile(base);
  assert.equal(draft.errors.length, 0);
  assert(draft.pending.some(s => s.includes('placeholder')));
  const broken = structuredClone(base); broken.projects = [{ name: 'broken' }];
  assert(validateProfile(broken).errors.length > 0);
});
