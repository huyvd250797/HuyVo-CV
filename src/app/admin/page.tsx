import type { Metadata } from 'next';
import {loadPublicBranding} from '@/lib/public-profile';
import { Editor } from '@/components/Editor';
export const dynamic='force-dynamic';
export const metadata: Metadata = { title:'Quản lý CV',robots:{index:false,follow:false} };
export default async function AdminPage() { return <Editor initialBranding={await loadPublicBranding()}/>; }
