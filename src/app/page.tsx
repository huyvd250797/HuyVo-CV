import type { Metadata } from 'next';
import { loadPublicCv } from '@/lib/public-profile';
import { renderCv } from '@/lib/render.mjs';
import { PublicMarkup } from '@/components/PublicMarkup';
import { ShareTools } from '@/components/ShareTools';
import {canonicalCvUrl,publishedMetadata} from '@/lib/sharing.mjs';
import { HoldingPage } from '@/components/HoldingPage';
export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> {
 const {profile,version}=await loadPublicCv();
 return profile?publishedMetadata(profile,version):{title:'CV đang hoàn thiện',robots:{index:false,follow:false}};
}
export default async function HomePage() {
  const { profile, status,version=1 } = await loadPublicCv();
  if (!profile) return <HoldingPage error={status==='error'} />;
  return <><PublicMarkup html={renderCv(profile,{ printHref:'/print',pdfHref:'/api/cv/pdf',responsivePortrait:true })} /><ShareTools name={profile.name} role={profile.role} url={canonicalCvUrl(profile.siteUrl)} version={version}/><a className="owner-entry" href="/admin">Quản lý CV</a></>;
}
