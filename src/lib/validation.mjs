const groups = {
  education: ['school','degree','period','detail'],
  skills: ['name','description'],
  experience: ['role','company','period','summary','highlights'],
  implementations: ['name','description'],
  projects: ['name','description','role','year','technologies','demoUrl','sourceUrl'],
  certificates: ['name','issuer','year','url'],
};
const fields = ['name','role','summary','objective','email','phone','website','address','portrait','portraitAlt','siteUrl'];
export function validWebUrl(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
}
export function validateCv(input, publishing = false) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { errors: ['Dữ liệu CV không hợp lệ.'], data: null };
  const data = { publication: 'draft', language: 'vi', cvFile: '', schemaVersion: 1 };
  function string(value, label, max = 6000) {
    if (typeof value !== 'string') { errors.push(`${label}: cần là văn bản.`); return ''; }
    if (value.length > max) errors.push(`${label}: tối đa ${max} ký tự.`);
    return value.trim();
  }
  for (const field of fields) data[field] = string(input[field] ?? '', field, ['summary','objective'].includes(field) ? 6000 : 500);
  if (data.email && !/^[^\s<>"'@?&#]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(data.email)) errors.push('Email không hợp lệ.');
  if (data.phone && !/^\+?[0-9 ()-]{7,25}$/.test(data.phone)) errors.push('Số điện thoại không hợp lệ.');
  for (const key of ['website','siteUrl']) if (data[key] && !validWebUrl(data[key])) errors.push(`${key}: nhập đường dẫn http/https hợp lệ.`);
  if (data.portrait && !/^\/(?:api\/media\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|png|webp)|[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp))$/.test(data.portrait)) errors.push('Ảnh chân dung không hợp lệ. Hãy tải ảnh bằng nút Thay ảnh.');
  for (const [group, keys] of Object.entries(groups)) {
    const items = input[group];
    if (!Array.isArray(items) || items.length > 50) { errors.push(`${group}: tối đa 50 mục.`); data[group] = []; continue; }
    data[group] = items.map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) { errors.push(`${group} ${index+1}: mục không hợp lệ.`); item = {}; }
      const row = {};
      for (const key of keys) {
        const label = `${group} ${index+1} / ${key}`;
        if (['highlights','technologies'].includes(key)) {
          if (!Array.isArray(item[key]) || item[key].length > 40) { errors.push(`${label}: tối đa 40 dòng.`); row[key] = []; }
          else row[key] = item[key].map(v => string(v,label,1500)).filter(Boolean);
        } else row[key] = string(item[key] ?? '',label);
        if (['url','demoUrl','sourceUrl'].includes(key) && row[key] && !validWebUrl(row[key])) errors.push(`${label}: đường dẫn không hợp lệ.`);
      }
      return row;
    });
  }
  if (new TextEncoder().encode(JSON.stringify(data)).byteLength > 180000) errors.push('Nội dung CV quá dài. Vui lòng rút gọn.');
  if (publishing) {
    if (!data.name || /\[.*\]/.test(data.name)) errors.push('Điền họ và tên trước khi xuất bản.');
    if (!data.role || /\[.*\]/.test(data.role)) errors.push('Điền vị trí công việc trước khi xuất bản.');
    if (!data.email && !data.phone) errors.push('Cần ít nhất email hoặc số điện thoại để liên hệ.');
    for (const [group,required] of Object.entries({education:['school'],skills:['name'],certificates:['name'],experience:['role','company'],implementations:['name'],projects:['name']})) {
      data[group].forEach((item,index)=>{if(required.some(key=>!item[key]))errors.push(`${group} ${index+1}: điền tên mục hoặc xóa mục đang để trống.`);});
    }
    const hasPlaceholder = value => typeof value === 'string' ? /\[[^\]]+\]/.test(value) : Array.isArray(value) ? value.some(hasPlaceholder) : value && typeof value === 'object' ? Object.values(value).some(hasPlaceholder) : false;
    if (hasPlaceholder(data)) errors.push('CV còn nội dung mẫu trong dấu [ ]. Hãy thay hoặc xóa các mục chưa dùng.');
  }
  return { errors, data };
}
export function imageType(bytes) {
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b)) return { mime:'image/png', extension:'png' };
  if (bytes.length >= 3 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return { mime:'image/jpeg', extension:'jpg' };
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP') return { mime:'image/webp', extension:'webp' };
  return null;
}
