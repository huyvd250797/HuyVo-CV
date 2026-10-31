import type { MetadataRoute } from 'next';
import { loadPublicCv } from '@/lib/public-profile';
export const dynamic='force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const snapshots=await Promise.all([loadPublicCv('vi'),loadPublicCv('en')]);
 return snapshots.filter(s=>s.profile?.siteUrl).map(s=>({url:new URL(s.profile!.language==='en'?'/en':'/',s.profile!.siteUrl).href,changeFrequency:'monthly' as const,priority:1}));
}
