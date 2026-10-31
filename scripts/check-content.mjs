import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { safeWebUrl, safeEmail, safePhone, assetPath } from '../src/lib/render.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
export function validateProfile(profile) {
  const errors = [], pending = [];
  if (!['draft', 'published'].includes(profile.publication)) errors.push('publication must be draft or published');
  for (const key of ['name','role','summary','objective','email','phone','website','address','portrait','portraitAlt','siteUrl','cvFile']) {
    if (typeof profile[key] !== 'string') errors.push(key + ' must be a string');
  }
  const definitions = {
    education: { school: 'string', degree: 'string', period: 'string', detail: 'string' },
    skills: { name: 'string', description: 'string' },
    experience: { role: 'string', company: 'string', period: 'string', summary: 'string', highlights: 'array' },
    implementations: { name: 'string', description: 'string' },
    projects: { name: 'string', description: 'string', role: 'string', year: 'string', technologies: 'array' },
    certificates: { name: 'string', issuer: 'string', year: 'string' },
  };
  for (const [collection, definition] of Object.entries(definitions)) {
    if (!Array.isArray(profile[collection])) { errors.push(collection + ' must be an array'); continue; }
    profile[collection].forEach((row, i) => {
      if (!row || typeof row !== 'object') { errors.push(`${collection}[${i}] must be an object`); return; }
      for (const [key, type] of Object.entries(definition)) {
        if (type === 'array' ? !Array.isArray(row[key]) || row[key].some(v => typeof v !== 'string') : typeof row[key] !== type) errors.push(`${collection}[${i}].${key} must be ${type}`);
      }
      for (const key of ['url', 'demoUrl', 'sourceUrl']) if (row[key] && !safeWebUrl(row[key])) errors.push(`${collection}[${i}].${key} must be an http(s) URL without credentials`);
    });
  }
  if (errors.length) return { errors, pending };
  for (const key of ['name','role','summary','objective']) if (!profile[key].trim()) pending.push(key + ' is missing');
  if (!profile.email && !profile.phone) pending.push('At least one real contact method is needed');
  if (profile.email && !safeEmail(profile.email)) errors.push('Invalid email');
  if (profile.phone && !safePhone(profile.phone)) errors.push('Invalid phone');
  for (const key of ['website','siteUrl']) if (profile[key] && !safeWebUrl(profile[key])) errors.push('Invalid ' + key);
  for (const key of ['portrait','cvFile']) if (profile[key] && !assetPath(profile[key])) errors.push('Invalid local asset path: ' + key);
  function scan(value, key = 'profile') {
    if (typeof value === 'string' && /\[[^\]]+\]/.test(value)) pending.push(key + ' contains a placeholder');
    else if (Array.isArray(value)) value.forEach((entry, i) => scan(entry, `${key}[${i}]`));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => scan(v, `${key}.${k}`));
  }
  scan(profile);
  if (!profile.education.length) pending.push('Education has not been provided');
  if (!profile.experience.length) pending.push('Work experience has not been provided');
  if (!profile.portrait) pending.push('Portrait has not been provided');
  // v1.1 uses the current /print route; no static PDF is required.
  return { errors, pending };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const profile = JSON.parse(await readFile(path.join(root, 'src/data/profile.json'), 'utf8'));
  const result = validateProfile(profile);
  for (const key of ['portrait', 'cvFile']) if (profile[key] && assetPath(profile[key])) {
    try { await access(path.join(root, 'public', profile[key])); } catch { result.errors.push('Missing file: ' + profile[key]); }
  }
  result.errors.forEach(v => console.error('ERROR: ' + v));
  result.pending.forEach(v => console.log('PENDING: ' + v));
  const release = process.argv.includes('--release') || profile.publication === 'published';
  if (release && profile.publication !== 'published') result.errors.push('Switch publication to published only after content is complete');
  if (release && !safeWebUrl(profile.siteUrl)) result.errors.push('A valid siteUrl is required for production SEO');
  const failed = result.errors.length || release && result.pending.length;
  console.log(failed ? 'Content check: NOT READY for publication.' : `Content structure: PASS (${profile.publication}; ${result.pending.length} content items pending).`);
  process.exitCode = failed ? 1 : 0;
}
