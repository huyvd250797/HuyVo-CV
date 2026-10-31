import type { Metadata } from 'next';
import { Editor } from '@/components/Editor';
export const metadata: Metadata = { title:'Quản lý CV',robots:{index:false,follow:false} };
export default function AdminPage() { return <Editor/>; }
