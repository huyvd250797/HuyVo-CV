import {appStatusLabel} from './showcase.mjs';
import {formatPeriod,textFor} from './i18n.mjs';
import { normalizeLayout,sectionOrder,sectionTitle as blockTitle } from './layout.mjs';
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
const sectionHeading = (small, title) => `<div class="section-heading"><p class="micro">${e(small)}</p><h2>${e(title)}</h2></div>`;
const external = (href, label, className = '') => `<a class="${e(className)}" href="${e(href)}" target="_blank" rel="noopener noreferrer">${e(label)}</a>`;
const empty = (profile, draft, publicText) => `<div class="empty-state">${e(profile.publication === 'draft' ? draft : publicText)}</div>`;

function header(profile, options, isPortfolio = false) {
  const home = options.homeHref || '/';
  const contact = isPortfolio ? `${home}#personal` : '#personal';
  const hidden=new Set(normalizeLayout(profile.layout).hidden);
  return `<header class="header"><a href="${e(isPortfolio ? home : '#home')}" class="wordmark" aria-label="Về trang CV">${profile.branding?.logo?`<img class="brand-logo" src="${e(assetPath(profile.branding.logo,options.assetPrefix)||'')}" alt="${e(profile.branding.name||'Logo')}">`:e(profile.branding?.name||'maison.')}<span>PERSONAL PORTFOLIO</span></a><nav aria-label="Điều hướng chính">${isPortfolio ? `<a href="${e(home)}">CV của tôi</a>` : `${hidden.has('experience')?'':'<a href="#experience">Kinh nghiệm</a>'}${hidden.has('projects')?'':'<a href="#projects">Sản phẩm</a>'}`}${hidden.has('personal')?'':`<a href="${e(contact)}" class="nav-contact">Liên hệ ${icon('arrow')}</a>`}</nav></header>`;
}
function draftNote(profile) {
  return profile.publication === 'draft' ? '<div class="draft-note" role="note">Bản nháp · Hồ sơ đang hoàn thiện nội dung cá nhân.</div>' : '';
}
function portrait(profile, options) {
  const src = assetPath(profile.portrait, options.assetPrefix);
  const graphic = '<svg class="portrait-art" viewBox="0 0 400 500" role="img" aria-label="Vị trí ảnh chân dung đang chờ cập nhật"><defs><linearGradient id="portrait-gradient" x2="1" y2="1"><stop stop-color="#d5d6bf"/><stop offset="1" stop-color="#a8b59e"/></linearGradient></defs><rect width="400" height="500" fill="url(#portrait-gradient)"/><circle cx="200" cy="211" r="67" fill="#edf0df" fill-opacity=".6"/><path d="M65 500v-93c0-87 61-140 135-140s135 53 135 140v93" fill="#edf0df" fill-opacity=".6"/><circle cx="200" cy="230" r="165" stroke="#fff" stroke-opacity=".25" fill="none"/><path d="M0 440C90 340 290 490 400 365" stroke="#fff" stroke-opacity=".4" fill="none"/></svg>';
  return `<div class="portrait"><div class="portrait-inner">${src ? `<img class="portrait-photo" src="${e(src)}" alt="${e(profile.portraitAlt)}" ${options.responsivePortrait&&src.startsWith('/api/media/')?`srcset="${e(src)}?w=400 400w, ${e(src)}?w=800 800w" sizes="(max-width: 640px) 200px, 320px"`:""} width="400" height="500" fetchpriority="high">` : graphic}${!src && profile.publication === 'draft' ? '<div class="portrait-label">Ảnh chân dung<span>Chờ ảnh của bạn</span></div>' : ''}</div><span class="portrait-caption">YOUR STORY. YOUR NEXT CHAPTER.</span></div>`;
}
function contacts(profile,options) {
  const fields = [
    ['phone', 'Điện thoại', profile.phone, safePhone(profile.phone), '[Số điện thoại]'],
    ['email', 'Email', profile.email, safeEmail(profile.email), '[Email của bạn]'],
    ['web', 'Website', profile.website, safeWebUrl(profile.website), '[Website cá nhân]'],
    ['pin', 'Địa chỉ', profile.address, null, '[Quận / Thành phố]'],
  ];
  return `<dl class="contacts">${fields.filter(([, , text]) => text || profile.publication === 'draft').map(([key, label, text, href, placeholder]) => `<div>${icon(key)}<div><dt>${e(label)}</dt><dd>${href ? `<a class="contact-link" href="${e(href)}"${key === 'web' ? ' target="_blank" rel="noopener noreferrer"' : ''}>${editable(profile,options,text,key==='web'?'website':key==='pin'?'address':key,'personal')}</a>` : editable(profile,options,text||placeholder,key==='web'?'website':key==='pin'?'address':key,'personal')}</dd></div></div>`).join('')}</dl>`;
}
const editable=(profile,options,value,path,section)=>options.editing?`<span data-inline-path="${e(path)}" data-inline-section="${section}">${e(value)}</span>`:e(value);
const rowId=(item,index)=>item.id||String(index);
function rowTools(profile,options,id,index,count){
 if(!options.editing||options.activeSection!==id)return '';
 const label=blockTitle(profile.layout,id,profile.language);
 return `<span class="cv-row-tools" contenteditable="false"><button type="button" data-cv-action="row-up" data-section="${id}" data-index="${index}" aria-label="Đưa dòng ${index+1} của ${e(label)} lên" ${index===0?'disabled':''}>↑</button><button type="button" data-cv-action="row-down" data-section="${id}" data-index="${index}" aria-label="Đưa dòng ${index+1} của ${e(label)} xuống" ${index===count-1?'disabled':''}>↓</button></span>`;
}
function blockTools(profile,options,id){
 if(!options.editing||options.activeSection!==id)return '';
 const order=sectionOrder(profile.layout).filter(key=>!normalizeLayout(profile.layout).hidden.includes(key)),index=order.indexOf(id),label=blockTitle(profile.layout,id,profile.language);
 return `<div class="cv-block-tools" contenteditable="false" role="group" aria-label="Thao tác ${e(label)}"><button type="button" class="cv-block-drag" data-cv-action="drag-block" data-section="${id}" aria-label="Kéo block ${e(label)}" title="Kéo để di chuyển block">⋮⋮</button><button type="button" data-cv-action="block-up" data-section="${id}" aria-label="Đưa block ${e(label)} lên" ${index===0?'disabled':''}>↑</button><button type="button" data-cv-action="block-down" data-section="${id}" aria-label="Đưa block ${e(label)} xuống" ${index===order.length-1?'disabled':''}>↓</button><button type="button" class="cv-block-add" data-cv-action="add-row" data-section="${id}" aria-label="Thêm dữ liệu ${e(label)}" title="Bổ sung nội dung">+</button></div>`;
}
function education(profile,options) {
  return profile.education.length ? profile.education.map((item,index) => `<article class="education" data-motion-key="row:education:${e(rowId(item,index))}">${rowTools(profile,options,'education',index,profile.education.length)}<div class="symbol">${icon('edu')}</div><div><p class="micro">${editable(profile,options,formatPeriod(item.period,profile.language),`education.${index}.period`,'education')}</p><h3>${editable(profile,options,item.school,`education.${index}.school`,'education')}</h3><p>${editable(profile,options,item.degree,`education.${index}.degree`,'education')}</p>${item.detail ? `<p class="fine">${editable(profile,options,item.detail,`education.${index}.detail`,'education')}</p>` : ''}</div></article>`).join('') : empty(profile, 'Bổ sung thông tin học vấn trong hồ sơ.', 'Thông tin học vấn chưa được công khai.');
}
function skills(profile,options) {
  return profile.skills.length ? `<div class="skills">${profile.skills.map((item,index) => `<div class="skill" data-motion-key="row:skills:${e(rowId(item,index))}">${rowTools(profile,options,'skills',index,profile.skills.length)}<span class="skill-dot"></span><div><h3>${editable(profile,options,item.name,`skills.${index}.name`,'skills')}</h3><p>${editable(profile,options,item.description,`skills.${index}.description`,'skills')}</p></div></div>`).join('')}</div>` : empty(profile, 'Bổ sung kỹ năng của bạn trong hồ sơ.', 'Kỹ năng sẽ được cập nhật.');
}
function certificates(profile,options) {
  return profile.certificates.length ? `<div class="certs">${profile.certificates.map((item,index) => { const url = safeWebUrl(item.url); return `<article class="cert" data-motion-key="row:certificates:${e(rowId(item,index))}">${rowTools(profile,options,'certificates',index,profile.certificates.length)}<div class="symbol">${icon('star')}</div><div><h3>${url ? `<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${editable(profile,options,item.name,`certificates.${index}.name`,'certificates')}</a>` : editable(profile,options,item.name,`certificates.${index}.name`,'certificates')}</h3><p>${editable(profile,options,item.issuer,`certificates.${index}.issuer`,'certificates')} · ${editable(profile,options,formatPeriod(item.year,profile.language),`certificates.${index}.year`,'certificates')}</p></div></article>`; }).join('')}</div>` : empty(profile, 'Chưa có dữ liệu chứng chỉ. Chỉ bổ sung chứng chỉ thực tế của bạn.', 'Chưa có chứng chỉ được công khai.');
}
function experience(profile,options) {
  return profile.experience.length ? `<div class="timeline">${profile.experience.map((item,index) => `<article class="job" data-motion-key="row:experience:${e(rowId(item,index))}">${rowTools(profile,options,'experience',index,profile.experience.length)}<div class="job-date">${editable(profile,options,formatPeriod(item.period,profile.language),`experience.${index}.period`,'experience')}</div><div class="job-main"><span class="timeline-dot"></span><h3>${editable(profile,options,item.role,`experience.${index}.role`,'experience')}</h3><p class="company">${editable(profile,options,item.company,`experience.${index}.company`,'experience')}</p><p>${editable(profile,options,item.summary,`experience.${index}.summary`,'experience')}</p>${item.highlights.length ? `<ul>${item.highlights.map((point,n) => `<li>${editable(profile,options,point,`experience.${index}.highlights.${n}`,'experience')}</li>`).join('')}</ul>` : ''}</div></article>`).join('')}</div>` : empty(profile, 'Bổ sung các giai đoạn làm việc theo thứ tự gần nhất trước.', 'Quá trình làm việc sẽ được cập nhật.');
}
function implementations(profile,options) {
  return `<div class="unit-list">${profile.implementations.map((item,index) => `<details data-motion-key="row:implementations:${e(rowId(item,index))}"><summary><span class="unit-heading">${item.logo?`<img class="unit-logo" src="${e(assetPath(item.logo,options.assetPrefix)||'')}" alt="${e(item.code||item.name)}" width="44" height="44" loading="lazy">`:''}<span class="unit-identity">${item.code?`<strong class="unit-code">${editable(profile,options,item.code,`implementations.${index}.code`,'delivery')}</strong><span class="unit-name">${editable(profile,options,item.name,`implementations.${index}.name`,'delivery')}</span>`:`<span class="unit-name unit-name-only">${editable(profile,options,item.name,`implementations.${index}.name`,'delivery')}</span>`}</span></span>${rowTools(profile,options,'delivery',index,profile.implementations.length)}</summary>${item.period?`<p class="unit-period">${editable(profile,options,formatPeriod(item.period,profile.language),`implementations.${index}.period`,'delivery')}</p>`:''}<p>${editable(profile,options,item.description,`implementations.${index}.description`,'delivery')}</p></details>`).join('')}</div>`;
}
function projects(profile,options) {
 const en=profile.language==='en',items=profile.projects.map((item,index)=>({item,index})).filter(({item})=>options.editing||!item.hidden);
 if(!items.length)return empty(profile,'Sản phẩm cá nhân đang chờ bạn cung cấp. Đây là khu vực riêng với các dự án triển khai tại đơn vị.','Chưa có sản phẩm cá nhân được công khai.');
 return `<div class="projects app-showcase">${items.map(({item,index})=>{
  const field=key=>editable(profile,options,item[key]||'',`projects.${index}.${key}`,'projects'),demo=safeWebUrl(item.demoUrl),code=safeWebUrl(item.sourceUrl),cover=assetPath(item.cover,options.assetPrefix);
  const images=(item.images||[]).filter(image=>assetPath(image.src,options.assetPrefix));
  const imageMarkup=(src,alt,className)=>`<img class="${className}" src="${e(src)}" alt="${e(alt)}" width="1280" height="800" loading="lazy" decoding="async">`;
  const gallery=images.length?`<details class="app-gallery"><summary>${en?'Screenshots':'Ảnh ứng dụng'} <span>${images.length}</span></summary><div class="app-gallery-grid">${images.map(image=>{const src=assetPath(image.src,options.assetPrefix);return `<figure><a href="${e(src)}" target="_blank" rel="noopener noreferrer" aria-label="${e((en?'Open image: ':'Mở ảnh: ')+image.alt)}">${imageMarkup(src,image.alt,'gallery-thumbnail')}</a><figcaption>${e(image.alt)}</figcaption></figure>`;}).join('')}</div></details>`:'';
  return `<article class="personal-project app-card ${item.featured?'app-featured':''} ${item.hidden?'app-hidden':''}" data-motion-key="row:projects:${e(rowId(item,index))}">${rowTools(profile,options,'projects',index,profile.projects.length)}<div class="app-cover">${cover?imageMarkup(cover,item.coverAlt||item.name,'app-cover-image'):`<div class="app-no-image"><span>${e(item.name||'APP')}</span><small>${en?'Screenshot not added':'Chưa thêm ảnh màn hình'}</small></div>`}<div class="app-badges">${item.featured?`<span class="app-featured-badge">✦ ${en?'Featured':'Nổi bật'}</span>`:''}${item.hidden?`<span>${en?'Hidden from public CV':'Đang ẩn trên CV'}</span>`:''}</div></div><div class="project-copy"><div class="app-meta"><span class="app-status status-${e(item.status||'developing')}">${e(appStatusLabel(item.status||'developing',profile.language))}</span>${item.platform?`<span>${field('platform')}</span>`:''}</div><h3>${field('name')}</h3><p class="project-type">${field('role')}${item.year?` · ${editable(profile,options,formatPeriod(item.year,profile.language),`projects.${index}.year`,'projects')}`:''}</p><p class="app-description">${field('description')}</p><div class="tags">${item.technologies.map((technology,n)=>`<span class="tag">${editable(profile,options,technology,`projects.${index}.technologies.${n}`,'projects')}</span>`).join('')}</div>${gallery}<div class="project-bottom">${demo?external(demo,en?'View demo ↗':'Xem demo ↗','button'):''}${code?external(code,en?'Source code ↗':'Mã nguồn ↗','button'):''}</div></div></article>`;
 }).join('')}</div>`;
}
function footer(profile) {
  return `<footer><span>${e(profile.name)} · ${e(profile.role)}</span><span>CV Online Maison Espresso · v1.7.0</span></footer>`;
}
function contactActions(profile) {
  const email = safeEmail(profile.email), phone = safePhone(profile.phone);
  return `<div class="contact-actions">${email ? `<a class="button primary" href="${e(email)}">Gửi email ${icon('arrow')}</a>` : ''}${phone ? `<a class="button" href="${e(phone)}">Gọi điện ${icon('phone')}</a>` : ''}</div>`;
}
function renderCvBase(profile, options = {}) {
  const layout=normalizeLayout(profile.layout),hidden=new Set(layout.hidden);
  const field=key=>editable(profile,options,profile[key],key,key==='objective'?'objective':'personal');
  const pdf = assetPath(profile.cvFile, options.assetPrefix);
  const portfolio = options.portfolioHref || '/portfolio';
  const chapterOrder=sectionOrder(layout).filter(id=>id!=='personal'&&!hidden.has(id));
  const chapterNumbers=Object.fromEntries(chapterOrder.map((id,index)=>[id,String(index+1).padStart(2,'0')]));
  const block=(id,small,title,body,extra='')=>hidden.has(id)?'':`<section id="${id}" data-motion-key="block:${id}" class="cv-block ${id==='projects'?'portfolio-section':id==='delivery'?'delivery':''}" ${extra} ${options.editing?`data-cv-block="${id}"`:''} ${layout.mode==='grid'?`data-grid-span="${layout.grid.spans[id]}" style="--block-span:${layout.grid.spans[id]}"`:''}>${blockTools(profile,options,id)}${small?sectionHeading(small.replace(/^\d+/,chapterNumbers[id]),blockTitle(layout,id,profile.language)).replace('<h2>',options.editing?`<h2 data-inline-path="layout.titles.${id}" data-inline-section="${id}">`:'<h2>'):layout.mode==='grid'||layout.titles[id]?sectionHeading('',blockTitle(layout,id,profile.language)).replace('<h2>',options.editing?`<h2 data-inline-path="layout.titles.${id}" data-inline-section="${id}">`:'<h2>'):''}${body}${options.editing&&options.activeSection===id&&['education','skills','certificates','experience','delivery','projects'].includes(id)?`<div class="cv-bottom-add"><button type="button" data-cv-action="add-row" data-section="${id}" aria-label="Thêm ở cuối ${e(blockTitle(layout,id,profile.language))}">+</button></div>`:''}</section>`;
  const parts={
    objective:()=>block('objective','01 / MỤC TIÊU NGHỀ NGHIỆP','Từng bước, có định hướng.',`<div class="goal-copy"><p>${field('objective')}</p></div>`),
    personal:()=>block('personal','','',contacts(profile,options),'aria-label="Thông tin cá nhân"'),
    education:()=>block('education','02 / NỀN TẢNG','Học vấn.',education(profile,options)),
    skills:()=>block('skills','03 / NĂNG LỰC','Kỹ năng cá nhân.',skills(profile,options)),
    certificates:()=>block('certificates','04 / PHÁT TRIỂN BẢN THÂN','Chứng chỉ.',certificates(profile,options)),
    experience:()=>block('experience','05 / CAREER JOURNEY','Quá trình làm việc.',experience(profile,options)),
    delivery:()=>block('delivery','06 / IMPLEMENTATION','Kinh nghiệm triển khai.',`<p class="units-note">Tham gia triển khai hệ thống quản trị tại các đơn vị. Chọn để xem thêm.</p>${implementations(profile,options)}`),
    projects:()=>block('projects','07 / PERSONAL COLLECTION','Những điều tôi tự tay xây dựng.',projects(profile,options)),
  };
  const zone=id=>layout.order[id].map(key=>parts[key]()).join('');
  const intro=zone('intro'),aside=zone('aside'),career=zone('career');
  const grid=layout.mode==='grid'?`<div class="resume-paper flexible-paper"><div class="cv-grid">${sectionOrder(layout).map(id=>parts[id]()).join('')}</div></div>`:'';
  const bodyMarkup=layout.mode==='grid'?grid:null;
  const paper=(intro||aside||career)?`<div class="resume-paper">${intro?`<div class="paper-top ${layout.order.intro.filter(id=>!hidden.has(id)).length===1?'single-column':''}">${intro}</div>`:''}${aside||career?`<div class="resume-body ${!aside||!career?'single-column':''}">${aside?`<aside class="resume-aside">${aside}</aside>`:''}${career?`<div class="resume-career">${career}</div>`:''}</div>`:''}</div>`:'';
  const actions=!hidden.has('personal')&&(safeEmail(profile.email)||safePhone(profile.phone))?contactActions(profile):`<a class="button primary" href="${e(portfolio)}">Mở Portfolio ↗</a>`;
  return `${draftNote(profile)}<div class="page" id="home">${header(profile, options)}<main id="main"><section class="hero" aria-labelledby="profile-name"><div class="hero-copy"><p class="micro">HỒ SƠ CÁ NHÂN / THE NEXT CHAPTER</p><h1 id="profile-name">${field('name')}</h1><span class="role">${field('role')}</span><p>${field('summary')}</p><div class="buttons">${!hidden.has('experience')?`<a class="button primary" href="#experience">Tìm hiểu hồ sơ ${icon('arrow')}</a>`:''}${options.pdfHref?`<a class="button" href="${e(options.pdfHref)}">Tải CV PDF ↓</a>`:''}${options.printHref?`<a class="button" href="${e(options.printHref)}">In / Lưu PDF ↓</a>`:pdf?`<a class="button" href="${e(pdf)}" download="CV-Maison-Espresso.pdf">Tải CV PDF ↓</a>`:''}</div></div>${portrait(profile, options)}</section><div class="chapter-label"><span>THE RÉSUMÉ / HỒ SƠ NĂNG LỰC</span><span>PEOPLE · PROCESS · TECHNOLOGY</span></div>${bodyMarkup??(paper+zone('tail'))}<section class="closing" id="contact"><div><p class="micro">LET’S CONNECT</p><h2>Cùng bắt đầu<br><em>một chặng đường mới.</em></h2><p>Tôi mong được trao đổi về cơ hội phù hợp với kinh nghiệm và định hướng của mình.</p></div>${actions}</section><section class="portfolio-gate" id="portfolio" aria-labelledby="portfolio-title"><div><p class="micro">BEYOND THE RÉSUMÉ</p><h2 id="portfolio-title">Khám phá câu chuyện<br><em>sau mỗi dự án.</em></h2><p>Không gian dành cho dự án triển khai và sản phẩm cá nhân, với bối cảnh, vai trò và những điều đúc kết từ thực tế.</p><p class="gate-label">PORTFOLIO · ĐANG HOÀN THIỆN</p></div><a class="button primary" href="${e(portfolio)}">Mở Portfolio ${icon('arrow')}</a></section></main>${footer(profile)}</div>`;
}
function localizeUi(html,profile){
 if(profile.language!=='en')return html;
 const map={
 'aria-label="Về trang CV"':'aria-label="CV home"','aria-label="Điều hướng chính"':'aria-label="Main navigation"','aria-label="Thông tin cá nhân"':'aria-label="Contact information"','aria-label="Vị trí ảnh chân dung đang chờ cập nhật"':'aria-label="Portrait placeholder"',
 'Bản nháp · Hồ sơ đang hoàn thiện nội dung cá nhân.':'Draft · Personal profile in progress.','Ảnh chân dung<span>Chờ ảnh của bạn':'Portrait<span>Add your photo','[Số điện thoại]':'[Phone number]','[Email của bạn]':'[Your email]','[Website cá nhân]':'[Personal website]','[Quận / Thành phố]':'[City / Country]',
 'Bổ sung thông tin học vấn trong hồ sơ.':'Add your education.','Bổ sung kỹ năng của bạn trong hồ sơ.':'Add your skills.','Chưa có dữ liệu chứng chỉ. Chỉ bổ sung chứng chỉ thực tế của bạn.':'Add certifications you have earned.','Bổ sung các giai đoạn làm việc theo thứ tự gần nhất trước.':'Add your work experience, most recent first.','Sản phẩm cá nhân đang chờ bạn cung cấp. Đây là khu vực riêng với các dự án triển khai tại đơn vị.':'Add your applications and personal projects.',
 'HỒ SƠ CÁ NHÂN / THE NEXT CHAPTER':'PERSONAL PROFILE / THE NEXT CHAPTER','THE RÉSUMÉ / HỒ SƠ NĂNG LỰC':'THE RÉSUMÉ / PROFESSIONAL PROFILE',
 '>Kinh nghiệm</a>':'>Experience</a>','>Sản phẩm</a>':'>Projects</a>','>Liên hệ <svg':'>Contact <svg','>CV của tôi</a>':'>My CV</a>',
 '>Tìm hiểu hồ sơ <svg':'>Explore my profile <svg','>Tải CV PDF ↓</a>':'>Download CV PDF ↓</a>','>In / Lưu PDF ↓</a>':'>Print / Save PDF ↓</a>',
 '>Điện thoại</dt>':'>Phone</dt>','>Email</dt>':'>Email</dt>','>Địa chỉ</dt>':'>Location</dt>',
 '/ NỀN TẢNG</p>':'/ EDUCATION</p>','/ NĂNG LỰC</p>':'/ CAPABILITIES</p>','/ PHÁT TRIỂN BẢN THÂN</p>':'/ CONTINUOUS LEARNING</p>','/ MỤC TIÊU NGHỀ NGHIỆP</p>':'/ CAREER OBJECTIVE</p>',
 'Tham gia triển khai hệ thống quản trị tại các đơn vị. Chọn để xem thêm.':'Enterprise system implementation. Select an organization to read more.',
 '>Gửi email <svg':'>Send email <svg','>Gọi điện <svg':'>Call me <svg','>Mở Portfolio <svg':'>Open Portfolio <svg','>Mở Portfolio ↗</a>':'>Open Portfolio ↗</a>',
 'Cùng bắt đầu<br><em>một chặng đường mới.</em>':'Let’s start<br><em>a new chapter.</em>','Tôi mong được trao đổi về cơ hội phù hợp với kinh nghiệm và định hướng của mình.':'I welcome opportunities that align with my experience and professional goals.',
 'Khám phá câu chuyện<br><em>sau mỗi dự án.</em>':'Discover the story<br><em>behind each project.</em>',
 'Không gian dành cho dự án triển khai và sản phẩm cá nhân, với bối cảnh, vai trò và những điều đúc kết từ thực tế.':'Explore implementation projects and applications, including context, responsibilities and practical lessons.',
 'PORTFOLIO · ĐANG HOÀN THIỆN':'PORTFOLIO · COMING SOON','>Xem demo ↗</a>':'>View demo ↗</a>','>Mã nguồn ↗</a>':'>Source code ↗</a>',
 'Thông tin học vấn chưa được công khai.':'Education has not been published.','Kỹ năng sẽ được cập nhật.':'Skills will be updated.','Chưa có chứng chỉ được công khai.':'No certifications have been published.','Quá trình làm việc sẽ được cập nhật.':'Professional experience will be updated.','Chưa có sản phẩm cá nhân được công khai.':'No applications have been published.',
 'Mỗi dự án,<br><em>một câu chuyện riêng.</em>':'Every project,<br><em>a story of its own.</em>',
 'Trang Portfolio đang được hoàn thiện để giới thiệu sâu hơn về kinh nghiệm triển khai, cách tiếp cận công việc và các sản phẩm cá nhân.':'The portfolio is being prepared to showcase implementation experience, working approaches and applications.',
 'Dự án triển khai</span>':'Implementation projects</span>','Sản phẩm cá nhân</span>':'Applications</span>','Bài học thực tế</span>':'Practical lessons</span>',
 'Trong thời gian chờ, bạn có thể xem hồ sơ và trao đổi với tôi về cơ hội phù hợp.':'You can view my résumé and get in touch about suitable opportunities.',
 '>Quay lại CV <svg':'>Back to CV <svg','>Thông tin liên hệ</a>':'>Contact information</a>'
 };
 for(const [vi,en] of Object.entries(map))html=html.replaceAll(vi,en);return html;
}
export function renderCv(profile, options = {}) {
  const html = localizeUi(renderCvBase(profile, options),profile);
  return options.editing ? html.replace(/(<section[^>]*id="(objective|personal|education|skills|certificates|experience|delivery|projects)"[^>]*)(>)/g, '$1 data-cv-section="$2"$3').replace('<section class="hero"', '<section data-cv-section="personal" class="hero"') : html;
}
function renderPortfolioBase(profile, options = {}) {
  const home = options.homeHref || '/';
  return `${draftNote(profile)}<div class="page" id="home">${header(profile, options, true)}<main id="main"><section class="coming-soon"><div class="coming-content"><p class="micro">PORTFOLIO / COMING SOON</p><h1>Mỗi dự án,<br><em>một câu chuyện riêng.</em></h1><p>Trang Portfolio đang được hoàn thiện để giới thiệu sâu hơn về kinh nghiệm triển khai, cách tiếp cận công việc và các sản phẩm cá nhân.</p><div class="coming-topics"><span>Dự án triển khai</span><span>Sản phẩm cá nhân</span><span>Bài học thực tế</span></div><div class="coming-divider"></div><p>Trong thời gian chờ, bạn có thể xem hồ sơ và trao đổi với tôi về cơ hội phù hợp.</p><div class="buttons"><a class="button primary" href="${e(home)}">Quay lại CV ${icon('arrow')}</a>${normalizeLayout(profile.layout).hidden.includes('personal')?'':`<a class="button" href="${e(home)}#personal">Thông tin liên hệ</a>`}</div>${contactActions(profile)}</div></section></main>${footer(profile)}</div>`;
}
export function renderPortfolio(profile,options={}){return localizeUi(renderPortfolioBase(profile,options),profile);}
/** Offline review document generated from exactly the same renderer as Next.js. */
export function renderDocument(profile, kind = 'cv', options = {}) {
  const title = kind === 'portfolio' ? 'Portfolio — Đang hoàn thiện' : `${profile.name} — ${profile.role}`;
  return `<!doctype html><html lang="${profile.language==='en'?'en':'vi'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${e(profile.summary)}"><title>${e(title)}</title><link rel="stylesheet" href="styles.css"></head><body><a class="skip" href="#main">${profile.language==='en'?'Skip to content':'Đến nội dung chính'}</a>${kind === 'portfolio' ? renderPortfolio(profile, options) : renderCv(profile, options)}</body></html>`;
}
