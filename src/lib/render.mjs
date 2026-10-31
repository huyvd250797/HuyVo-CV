import { normalizeLayout } from './layout.mjs';
/** Shared server-side view functions. Content is always text; raw HTML is never accepted. */
export const escapeHtml = value => String(value ?? '').normalize('NFC').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const e = escapeHtml;
export function safeWebUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value.trim())) return null;
  try { const url = new URL(value.trim()); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function safeEmail(value) {
  if (typeof value !== 'string' || !/^[^\s<>"'@?&#]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value.trim())) return null;
  return 'mailto:' + encodeURIComponent(value.trim()).replace('%40', '@');
}
export function safePhone(value) {
  if (typeof value !== 'string' || !/^\+?[0-9 ()-]{6,25}$/.test(value.trim())) return null;
  const normalized = value.replace(/[ ()-]/g, '');
  return normalized.replace('+', '').length >= 7 ? 'tel:' + normalized : null;
}
export function assetPath(value, prefix = '') {
  if (typeof value !== 'string' || !/^\/[a-zA-Z0-9/_ .-]+$/.test(value) || value.startsWith('//') || value.includes('..')) return null;
  return prefix.replace(/\/$/, '') + value;
}
const iconPaths = {
  phone: '<path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
  web: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  arrow: '<path d="M5 19 19 5M5 5h14v14"/>',
  star: '<path d="m12 2 2.8 6.2 6.7.8-5 4.5L18 20l-6-3.4L6 20l1.5-6.5L2 9l6.7-.8L12 2Z"/>',
  edu: '<path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v6c4 3 8 3 12 0v-6M22 9v8"/>',
};
const icon = key => `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[key] || iconPaths.arrow}</svg>`;
const sectionTitle = (small, title) => `<div class="section-heading"><p class="micro">${e(small)}</p><h2>${e(title)}</h2></div>`;
const external = (href, label, className = '') => `<a class="${e(className)}" href="${e(href)}" target="_blank" rel="noopener noreferrer">${e(label)}</a>`;
const empty = (profile, draft, publicText) => `<div class="empty-state">${e(profile.publication === 'draft' ? draft : publicText)}</div>`;

function header(profile, options, isPortfolio = false) {
  const home = options.homeHref || '/';
  const contact = isPortfolio ? `${home}#personal` : '#personal';
  const hidden=new Set(normalizeLayout(profile.layout).hidden);
  return `<header class="header"><a href="${e(isPortfolio ? home : '#home')}" class="wordmark" aria-label="Về trang CV">maison.<span>PERSONAL PORTFOLIO</span></a><nav aria-label="Điều hướng chính">${isPortfolio ? `<a href="${e(home)}">CV của tôi</a>` : `${hidden.has('experience')?'':'<a href="#experience">Kinh nghiệm</a>'}${hidden.has('projects')?'':'<a href="#projects">Sản phẩm</a>'}`}${hidden.has('personal')?'':`<a href="${e(contact)}" class="nav-contact">Liên hệ ${icon('arrow')}</a>`}</nav></header>`;
}
function draftNote(profile) {
  return profile.publication === 'draft' ? '<div class="draft-note" role="note">Bản nháp · Hồ sơ đang hoàn thiện nội dung cá nhân.</div>' : '';
}
function portrait(profile, options) {
  const src = assetPath(profile.portrait, options.assetPrefix);
  const graphic = '<svg class="portrait-art" viewBox="0 0 400 500" role="img" aria-label="Vị trí ảnh chân dung đang chờ cập nhật"><defs><linearGradient id="portrait-gradient" x2="1" y2="1"><stop stop-color="#d5d6bf"/><stop offset="1" stop-color="#a8b59e"/></linearGradient></defs><rect width="400" height="500" fill="url(#portrait-gradient)"/><circle cx="200" cy="211" r="67" fill="#edf0df" fill-opacity=".6"/><path d="M65 500v-93c0-87 61-140 135-140s135 53 135 140v93" fill="#edf0df" fill-opacity=".6"/><circle cx="200" cy="230" r="165" stroke="#fff" stroke-opacity=".25" fill="none"/><path d="M0 440C90 340 290 490 400 365" stroke="#fff" stroke-opacity=".4" fill="none"/></svg>';
  return `<div class="portrait"><div class="portrait-inner">${src ? `<img class="portrait-photo" src="${e(src)}" alt="${e(profile.portraitAlt)}" width="400" height="500" fetchpriority="high">` : graphic}${!src && profile.publication === 'draft' ? '<div class="portrait-label">Ảnh chân dung<span>Chờ ảnh của bạn</span></div>' : ''}</div><span class="portrait-caption">YOUR STORY. YOUR NEXT CHAPTER.</span></div>`;
}
function contacts(profile) {
  const fields = [
    ['phone', 'Điện thoại', profile.phone, safePhone(profile.phone), '[Số điện thoại]'],
    ['email', 'Email', profile.email, safeEmail(profile.email), '[Email của bạn]'],
    ['web', 'Website', profile.website, safeWebUrl(profile.website), '[Website cá nhân]'],
    ['pin', 'Địa chỉ', profile.address, null, '[Quận / Thành phố]'],
  ];
  return `<dl class="contacts">${fields.filter(([, , text]) => text || profile.publication === 'draft').map(([key, label, text, href, placeholder]) => `<div>${icon(key)}<div><dt>${e(label)}</dt><dd>${href ? `<a class="contact-link" href="${e(href)}"${key === 'web' ? ' target="_blank" rel="noopener noreferrer"' : ''}>${e(text)}</a>` : e(text || placeholder)}</dd></div></div>`).join('')}</dl>`;
}
function education(profile) {
  return profile.education.length ? profile.education.map(item => `<article class="education"><div class="symbol">${icon('edu')}</div><div><p class="micro">${e(item.period)}</p><h3>${e(item.school)}</h3><p>${e(item.degree)}</p>${item.detail ? `<p class="fine">${e(item.detail)}</p>` : ''}</div></article>`).join('') : empty(profile, 'Bổ sung thông tin học vấn trong hồ sơ.', 'Thông tin học vấn chưa được công khai.');
}
function skills(profile) {
  return profile.skills.length ? `<div class="skills">${profile.skills.map(item => `<div class="skill"><span class="skill-dot"></span><div><h3>${e(item.name)}</h3><p>${e(item.description)}</p></div></div>`).join('')}</div>` : empty(profile, 'Bổ sung kỹ năng của bạn trong hồ sơ.', 'Kỹ năng sẽ được cập nhật.');
}
function certificates(profile) {
  return profile.certificates.length ? `<div class="certs">${profile.certificates.map(item => { const url = safeWebUrl(item.url); return `<article class="cert"><div class="symbol">${icon('star')}</div><div><h3>${url ? external(url, item.name) : e(item.name)}</h3><p>${e([item.issuer, item.year].filter(Boolean).join(' · '))}</p></div></article>`; }).join('')}</div>` : empty(profile, 'Chưa có dữ liệu chứng chỉ. Chỉ bổ sung chứng chỉ thực tế của bạn.', 'Chưa có chứng chỉ được công khai.');
}
function experience(profile) {
  return profile.experience.length ? `<div class="timeline">${profile.experience.map(item => `<article class="job"><div class="job-date">${e(item.period)}</div><div class="job-main"><span class="timeline-dot"></span><h3>${e(item.role)}</h3><p class="company">${e(item.company)}</p><p>${e(item.summary)}</p>${item.highlights.length ? `<ul>${item.highlights.map(point => `<li>${e(point)}</li>`).join('')}</ul>` : ''}</div></article>`).join('')}</div>` : empty(profile, 'Bổ sung các giai đoạn làm việc theo thứ tự gần nhất trước.', 'Quá trình làm việc sẽ được cập nhật.');
}
function implementations(profile) {
  return `<div class="unit-list">${profile.implementations.map(item => `<details><summary>${e(item.name)}</summary><p>${e(item.description)}</p></details>`).join('')}</div>`;
}
function projectArt(index) {
  return `<div class="project-art art-${index % 2}" aria-hidden="true">${index % 2 ? '<div class="mini-app"><span class="mini-dot"></span><div class="app-row"></div><div class="app-row short"></div><div class="app-grid"><i></i><i></i><i></i></div></div>' : '<div class="glass-stack stack-back"></div><div class="glass-stack stack-front"><i></i><i></i><i></i></div>'}<span class="art-label">PERSONAL PROJECT / ${String(index + 1).padStart(2, '0')}</span></div>`;
}
function projects(profile) {
  return profile.projects.length ? `<div class="projects">${profile.projects.map((item, index) => { const demo = safeWebUrl(item.demoUrl), code = safeWebUrl(item.sourceUrl); return `<article class="personal-project">${projectArt(index)}<div class="project-copy"><p class="project-type">${e([item.role, item.year].filter(Boolean).join(' / '))}</p><h3>${e(item.name)}</h3><p>${e(item.description)}</p><div class="tags" style="margin-top:15px">${item.technologies.map(technology => `<span class="tag">${e(technology)}</span>`).join('')}</div><div class="project-bottom">${demo ? external(demo, 'Xem demo ↗', 'button') : ''}${code ? external(code, 'Mã nguồn ↗', 'button') : ''}</div></div></article>`; }).join('')}</div>` : empty(profile, 'Sản phẩm cá nhân đang chờ bạn cung cấp. Đây là khu vực riêng với các dự án triển khai tại đơn vị.', 'Chưa có sản phẩm cá nhân được công khai.');
}
function footer(profile) {
  return `<footer><span>${e(profile.name)} · ${e(profile.role)}</span><span>CV Online Maison Espresso · v1.2.0</span></footer>`;
}
function contactActions(profile) {
  const email = safeEmail(profile.email), phone = safePhone(profile.phone);
  return `<div class="contact-actions">${email ? `<a class="button primary" href="${e(email)}">Gửi email ${icon('arrow')}</a>` : ''}${phone ? `<a class="button" href="${e(phone)}">Gọi điện ${icon('phone')}</a>` : ''}</div>`;
}
function renderCvBase(profile, options = {}) {
  const layout=normalizeLayout(profile.layout),hidden=new Set(layout.hidden);
  const field = key => options.editing ? `<span contenteditable="true" role="textbox" aria-label="${e(key)}" data-cv-field="${key}" spellcheck="false">${e(profile[key])}</span>` : e(profile[key]);
  const pdf = assetPath(profile.cvFile, options.assetPrefix);
  const portfolio = options.portfolioHref || '/portfolio';
  const chapterOrder=[...layout.order.intro,...layout.order.aside,...layout.order.career,'projects'].filter(id=>id!=='personal'&&!hidden.has(id));
  const chapterNumbers=Object.fromEntries(chapterOrder.map((id,index)=>[id,String(index+1).padStart(2,'0')]));
  const block=(id,small,title,body,extra='')=>hidden.has(id)?'':`<section id="${id}" ${extra}>${small?sectionTitle(small.replace(/^\d+/,chapterNumbers[id]),title):''}${body}</section>`;
  const parts={
    objective:()=>block('objective','01 / MỤC TIÊU NGHỀ NGHIỆP','Từng bước, có định hướng.',`<div class="goal-copy"><p>${field('objective')}</p></div>`),
    personal:()=>block('personal','','',contacts(profile),'aria-label="Thông tin cá nhân"'),
    education:()=>block('education','02 / NỀN TẢNG','Học vấn.',education(profile)),
    skills:()=>block('skills','03 / NĂNG LỰC','Kỹ năng cá nhân.',skills(profile)),
    certificates:()=>block('certificates','04 / PHÁT TRIỂN BẢN THÂN','Chứng chỉ.',certificates(profile)),
    experience:()=>block('experience','05 / CAREER JOURNEY','Quá trình làm việc.',experience(profile)),
    delivery:()=>block('delivery','06 / IMPLEMENTATION','Kinh nghiệm triển khai.',`<p class="units-note">Tham gia triển khai hệ thống quản trị tại các đơn vị. Chọn để xem thêm.</p>${implementations(profile)}`,'class="delivery"'),
    projects:()=>block('projects','07 / PERSONAL COLLECTION','Những điều tôi tự tay xây dựng.',projects(profile),'class="portfolio-section"'),
  };
  const zone=id=>layout.order[id].map(key=>parts[key]()).join('');
  const intro=zone('intro'),aside=zone('aside'),career=zone('career');
  const paper=(intro||aside||career)?`<div class="resume-paper">${intro?`<div class="paper-top ${layout.order.intro.filter(id=>!hidden.has(id)).length===1?'single-column':''}">${intro}</div>`:''}${aside||career?`<div class="resume-body ${!aside||!career?'single-column':''}">${aside?`<aside class="resume-aside">${aside}</aside>`:''}${career?`<div class="resume-career">${career}</div>`:''}</div>`:''}</div>`:'';
  const actions=!hidden.has('personal')&&(safeEmail(profile.email)||safePhone(profile.phone))?contactActions(profile):`<a class="button primary" href="${e(portfolio)}">Mở Portfolio ↗</a>`;
  return `${draftNote(profile)}<div class="page" id="home">${header(profile, options)}<main id="main"><section class="hero" aria-labelledby="profile-name"><div class="hero-copy"><p class="micro">HỒ SƠ CÁ NHÂN / THE NEXT CHAPTER</p><h1 id="profile-name">${field('name')}</h1><span class="role">${field('role')}</span><p>${field('summary')}</p><div class="buttons">${!hidden.has('experience')?`<a class="button primary" href="#experience">Tìm hiểu hồ sơ ${icon('arrow')}</a>`:''}${options.printHref?`<a class="button" href="${e(options.printHref)}">In / Lưu PDF ↓</a>`:pdf?`<a class="button" href="${e(pdf)}" download="CV-Maison-Espresso.pdf">Tải CV PDF ↓</a>`:''}</div></div>${portrait(profile, options)}</section><div class="chapter-label"><span>THE RÉSUMÉ / HỒ SƠ NĂNG LỰC</span><span>PEOPLE · PROCESS · TECHNOLOGY</span></div>${paper}${parts.projects()}<section class="closing" id="contact"><div><p class="micro">LET’S CONNECT</p><h2>Cùng bắt đầu<br><em>một chặng đường mới.</em></h2><p>Tôi mong được trao đổi về cơ hội phù hợp với kinh nghiệm và định hướng của mình.</p></div>${actions}</section><section class="portfolio-gate" id="portfolio" aria-labelledby="portfolio-title"><div><p class="micro">BEYOND THE RÉSUMÉ</p><h2 id="portfolio-title">Khám phá câu chuyện<br><em>sau mỗi dự án.</em></h2><p>Không gian dành cho dự án triển khai và sản phẩm cá nhân, với bối cảnh, vai trò và những điều đúc kết từ thực tế.</p><p class="gate-label">PORTFOLIO · ĐANG HOÀN THIỆN</p></div><a class="button primary" href="${e(portfolio)}">Mở Portfolio ${icon('arrow')}</a></section></main>${footer(profile)}</div>`;
}
export function renderCv(profile, options = {}) {
  const html = renderCvBase(profile, options);
  return options.editing ? html.replace(/(<section[^>]*id="(objective|personal|education|skills|certificates|experience|delivery|projects)"[^>]*)(>)/g, '$1 data-cv-section="$2"$3').replace('<section class="hero"', '<section data-cv-section="personal" class="hero"') : html;
}
export function renderPortfolio(profile, options = {}) {
  const home = options.homeHref || '/';
  return `${draftNote(profile)}<div class="page" id="home">${header(profile, options, true)}<main id="main"><section class="coming-soon"><div class="coming-content"><p class="micro">PORTFOLIO / COMING SOON</p><h1>Mỗi dự án,<br><em>một câu chuyện riêng.</em></h1><p>Trang Portfolio đang được hoàn thiện để giới thiệu sâu hơn về kinh nghiệm triển khai, cách tiếp cận công việc và các sản phẩm cá nhân.</p><div class="coming-topics"><span>Dự án triển khai</span><span>Sản phẩm cá nhân</span><span>Bài học thực tế</span></div><div class="coming-divider"></div><p>Trong thời gian chờ, bạn có thể xem hồ sơ và trao đổi với tôi về cơ hội phù hợp.</p><div class="buttons"><a class="button primary" href="${e(home)}">Quay lại CV ${icon('arrow')}</a>${normalizeLayout(profile.layout).hidden.includes('personal')?'':`<a class="button" href="${e(home)}#personal">Thông tin liên hệ</a>`}</div>${contactActions(profile)}</div></section></main>${footer(profile)}</div>`;
}
/** Offline review document generated from exactly the same renderer as Next.js. */
export function renderDocument(profile, kind = 'cv', options = {}) {
  const title = kind === 'portfolio' ? 'Portfolio — Đang hoàn thiện' : `${profile.name} — ${profile.role}`;
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${e(profile.summary)}"><title>${e(title)}</title><link rel="stylesheet" href="styles.css"></head><body><a class="skip" href="#main">Đến nội dung chính</a>${kind === 'portfolio' ? renderPortfolio(profile, options) : renderCv(profile, options)}</body></html>`;
}
