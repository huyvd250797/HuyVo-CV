'use client';
import {useEffect,useRef,useState} from 'react';
/** Crop locally before sending bytes. Original files never leave the browser. */
export function AppImageCropper({file,onSave,onCancel}:{file:File;onSave:(file:File)=>Promise<void>;onCancel:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),image=useRef<HTMLImageElement|null>(null);
 const [ready,setReady]=useState(false),[zoom,setZoom]=useState(1),[x,setX]=useState(50),[y,setY]=useState(50),[working,setWorking]=useState(false),[error,setError]=useState('');
 const cancelButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;cancelButton.current?.focus();return()=>previous?.focus();},[]);
 useEffect(()=>{
  const url=URL.createObjectURL(file);let alive=true;const img=new window.Image();img.onload=()=>{if(!alive)return;if(img.naturalWidth*img.naturalHeight>25_000_000){setError('Ảnh vượt quá 25 triệu điểm ảnh. Hãy giảm kích thước ảnh rồi chọn lại.');return;}image.current=img;setReady(true);};img.onerror=()=>{if(alive)setError('Không mở được ảnh. Chọn lại file JPG, PNG hoặc WebP còn nguyên vẹn.');};img.src=url;
  return()=>{alive=false;image.current=null;URL.revokeObjectURL(url);};
 },[file]);
 useEffect(()=>{const c=canvas.current,img=image.current,ctx=c?.getContext('2d');if(!c||!ctx||!img||!ready)return;const scale=Math.max(c.width/img.naturalWidth,c.height/img.naturalHeight)*zoom,w=img.naturalWidth*scale,h=img.naturalHeight*scale;ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#f3eee4';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,(c.width-w)*x/100,(c.height-h)*y/100,w,h);},[ready,zoom,x,y]);
 async function apply(){setWorking(true);setError('');try{const blob=await new Promise<Blob|null>(resolve=>canvas.current?.toBlob(resolve,'image/webp',.9));if(!blob)throw new Error('Trình duyệt chưa tạo được ảnh. Hãy thử lại.');await onSave(new File([blob],'app-screenshot.webp',{type:'image/webp'}));}catch(e){setError((e as Error).message||'Chưa tải được ảnh. Hãy thử lại.');}finally{setWorking(false);}}
 return <div className="publish-overlay crop-overlay" onKeyDown={e=>{
  if(e.key==='Escape'&&!working)onCancel();
  if(e.key==='Tab'){const elements=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')),first=elements[0],last=elements.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
 }}><div className="publish-dialog crop-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-title"><p className="micro">APP SHOWCASE / IMAGE STUDIO</p><h2 id="crop-title">Cắt ảnh minh họa.</h2><p>Khung 16:10 thống nhất trên CV. Điều chỉnh vùng hiển thị rồi tải ảnh lên.</p><canvas ref={canvas} width={1280} height={800} aria-label="Xem trước ảnh sau khi cắt"/>{ready&&<div className="crop-controls"><label>Thu phóng<input type="range" min="1" max="3" step="0.01" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label><label>Vị trí ngang<input type="range" min="0" max="100" value={x} onChange={e=>setX(Number(e.target.value))}/></label><label>Vị trí dọc<input type="range" min="0" max="100" value={y} onChange={e=>setY(Number(e.target.value))}/></label></div>}{error&&<p role="alert" className="crop-error">{error}</p>}<div className="dialog-actions"><button ref={cancelButton} type="button" disabled={working} onClick={onCancel}>Hủy</button><button className="editor-publish" type="button" disabled={!ready||working} onClick={()=>void apply()}>{working?'Đang tải ảnh…':'Dùng ảnh này'}</button></div></div></div>;
}
