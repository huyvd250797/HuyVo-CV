import assert from 'node:assert/strict';
const base=(process.env.SITE_URL||'http://localhost:3000').replace(/\/$/,'');
for(const route of ['/','/admin','/portfolio','/print']){
 const response=await fetch(base+route);assert.equal(response.status,200,route);assert(response.headers.get('content-type')?.includes('text/html'));console.log('PASS '+route);
}
for(const route of ['/api/admin/cv','/api/admin/publish']){
 const response=await fetch(base+route,route.endsWith('publish')?{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}:{});
 assert([401,503].includes(response.status),route+': must reject anonymous request');console.log('PASS anonymous blocked: '+route);
}
for(const route of ['/package.json','/src/data/profile.json','/cv.pdf']){
 const response=await fetch(base+route);assert.equal(response.status,404,route);console.log('PASS private/stale path rejected: '+route);
}
