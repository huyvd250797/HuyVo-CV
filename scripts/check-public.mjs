import { existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { validateCv } from '../src/lib/validation.mjs';
if(existsSync('.env.local'))process.loadEnvFile('.env.local');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key){console.error('Chưa cấu hình Supabase. Điền .env.local theo .env.example hoặc đặt biến môi trường.');process.exit(1);}
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
let failures=0;
const {data,error}=await db.from('cv_publications').select('content,document_version').eq('id',true).maybeSingle();
if(error){console.error('Không đọc được bản công khai. Kiểm tra migration và kết nối.');failures++;}
else if(!data){console.error('Chưa xuất bản CV. Đăng nhập /admin, hoàn thiện thông tin rồi Xuất bản.');failures++;}
else {
 const parsed=validateCv(data.content,true);
 if(parsed.errors.length){console.error(parsed.errors.join('\n'));failures++;}
 else console.log(`Bản công khai: PASS, document version ${data.document_version}.`);
}
const draft=await db.from('cv_documents').select('version').limit(1);
if(!draft.error&&draft.data?.length){console.error('FAIL: khách có thể đọc bản nháp. Kiểm tra lại RLS/grants.');failures++;}
else console.log('Quyền đọc nháp của khách: bị chặn/không trả dữ liệu.');
process.exitCode=failures?1:0;
