import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {loadPublicBranding} from '@/lib/public-profile';
import {serverCloud} from '@/lib/cloud';
export const dynamic='force-dynamic';export const runtime='nodejs';
export async function GET(){const branding=await loadPublicBranding();if(branding.favicon.startsWith('/api/media/'))try{const {data,error}=await serverCloud().storage.from('cv-assets').download(branding.favicon.slice(11));if(!error&&data)return new Response(data,{headers:{'Content-Type':data.type,'Cache-Control':'no-store'}});}catch{}
 return new Response(await readFile(path.join(process.cwd(),'public/favicon-default.svg')),{headers:{'Content-Type':'image/svg+xml','Cache-Control':'no-store'}});
}
