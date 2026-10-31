import type { MetadataRoute } from 'next';
import { loadPublicCv } from '@/lib/public-profile';
export const dynamic='force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const { profile:p }=await loadPublicCv();
 return p?.siteUrl?[{url:p.siteUrl.replace(/\/$/,''),changeFrequency:'monthly',priority:1}]:[];
}
