import type {Metadata} from 'next';
import {loadPublicCv} from '@/lib/public-profile';
import {publishedMetadata} from '@/lib/sharing.mjs';
import {PublicCvPage} from '@/components/PublicCvPage';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{const {profile,version}=await loadPublicCv('vi',true);return profile?publishedMetadata(profile,version):{title:'CV đang hoàn thiện',robots:{index:false,follow:false}};}
export default function HomePage(){return <PublicCvPage fallback/>;}
