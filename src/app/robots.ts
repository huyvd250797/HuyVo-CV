import type { MetadataRoute } from 'next';
import { loadPublicCv } from '@/lib/public-profile';
export const dynamic='force-dynamic';
export default async function robots(): Promise<MetadataRoute.Robots> {
 const { profile:p }=await loadPublicCv();
 return { rules:{ userAgent:'*',allow:p?'/':undefined,disallow:p?['/admin','/auth','/api','/print','/portfolio']:'/' },...(p?.siteUrl?{sitemap:p.siteUrl.replace(/\/$/,'')+'/sitemap.xml'}:{}) };
}
