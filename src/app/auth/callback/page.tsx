'use client';
import { useEffect, useState } from 'react';
import { browserCloud } from '@/lib/browser-cloud';
let exchange: Promise<unknown> | null=null;
export default function AuthCallback() {
 const [error,setError]=useState('');
 useEffect(()=>{
  const client=browserCloud();if(!client){setError('Chưa cấu hình Supabase.');return;}
  const params=new URLSearchParams(window.location.search);const code=params.get('code');
  if(params.has('error')||!code){setError('Liên kết khôi phục không hợp lệ hoặc đã hết hạn. Hãy yêu cầu email mới.');return;}
  if(!exchange)exchange=client.auth.exchangeCodeForSession(code).then(({error:e})=>{if(e)throw e;});
  void exchange.then(()=>{window.location.replace('/admin?recovery=1');}).catch(()=>setError('Liên kết đã hết hạn hoặc đang mở ở trình duyệt khác. Hãy yêu cầu lại từ trang đăng nhập trên thiết bị này.'));
 },[]);
 return <main id="main" className="auth-page"><div className="auth-card"><p className="micro">ACCOUNT RECOVERY</p><h1>Khôi phục tài khoản.</h1><p role={error?'alert':'status'}>{error||'Đang xác minh liên kết…'}</p>{error&&<a className="button primary" href="/admin">Quay lại đăng nhập</a>}</div></main>;
}
