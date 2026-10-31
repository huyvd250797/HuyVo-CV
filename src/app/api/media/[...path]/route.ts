import { serverCloud, cloudConfig } from '@/lib/cloud';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const parts = (await context.params).path;
  const path = parts.join('/');
  if (!cloudConfig().ready || !/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path)) return new Response('Not found',{ status:404 });
  try {
    const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
    const db = serverCloud(token);
    // Storage RLS allows the owner, or the exact currently published portrait only.
    const { data, error } = await db.storage.from('cv-assets').download(path);
    if (error || !data) return new Response('Not found',{ status:404,headers:{'Cache-Control':'no-store'} });
    return new Response(data,{ headers:{ 'Content-Type':data.type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Vary':'Authorization' } });
  } catch { return new Response('Image unavailable',{ status:503,headers:{'Cache-Control':'no-store'} }); }
}
