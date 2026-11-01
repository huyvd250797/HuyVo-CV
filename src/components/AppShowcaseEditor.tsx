'use client';
import type {Project} from '@/lib/types';
import {moveItem} from '@/lib/layout.mjs';
import {SortHandle} from './SortHandle';
import {appStatusLabel,appStatuses} from '@/lib/showcase.mjs';
type Props={rows:Project[];assets:Record<string,string>;onChange:(rows:Project[],key?:string)=>void;onUpload:(id:string,kind:'cover'|'gallery')=>void};
export function AppShowcaseMedia({row,index,assets,onChange,onUpload}:{row:Project;index:number;assets:Props['assets'];onChange:(patch:Partial<Project>)=>void;onUpload:Props['onUpload']}){
 const images=row.images||[],path=(src:string)=>assets[src]||src;
 return <div className="showcase-media-editor">
  <div className="app-cover-control">{row.cover?<img src={path(row.cover)} alt={row.coverAlt||'Ảnh bìa đang chỉnh'}/>:<div className="app-cover-placeholder">Ảnh màn hình ứng dụng · 16:10</div>}<div className="media-editor-actions"><button type="button" onClick={()=>onUpload(row.id!, 'cover')}>{row.cover?'Thay / cắt ảnh bìa':'＋ Ảnh bìa'}</button>{row.cover&&<button type="button" onClick={()=>onChange({cover:''})}>Bỏ ảnh bìa</button>}</div></div>
  <label className="editor-field"><span>Mô tả ảnh bìa</span><input data-field-key="coverAlt" value={row.coverAlt||''} maxLength={500} onChange={e=>onChange({coverAlt:e.target.value})}/></label>
  <div className="showcase-flags"><label><input type="checkbox" checked={!!row.featured} onChange={e=>onChange({featured:e.target.checked})}/> Ứng dụng nổi bật</label><label><input type="checkbox" checked={!!row.hidden} onChange={e=>onChange({hidden:e.target.checked})}/> Ẩn ứng dụng trên CV</label></div>
  <label className="editor-field"><span>Trạng thái ứng dụng</span><select data-field-key="status" value={row.status||'developing'} onChange={e=>onChange({status:e.target.value as Project['status']})}>{appStatuses.map(status=><option key={status} value={status}>{appStatusLabel(status)}</option>)}</select></label>
  <div className="gallery-editor" data-field-key="images"><h4>Thư viện ảnh <small>{images.length}/8</small></h4><p className="panel-description">Ảnh và liên kết dùng chung VI/EN. Mô tả ảnh được viết riêng theo ngôn ngữ; cần điền trước khi xuất bản.</p>{images.map((image,n)=><div className="gallery-editor-item" key={image.id}><img src={path(image.src)} alt={image.alt||`Ảnh ${n+1}`}/><div><label className="editor-field"><span>Mô tả ảnh {n+1}</span><input value={image.alt} maxLength={500} onChange={e=>onChange({images:images.map((item,i)=>i===n?{...item,alt:e.target.value}:item)})}/></label><div className="gallery-image-actions"><SortHandle group={`images:${row.id}`} index={n} count={images.length} label={`ảnh ${n+1} ứng dụng ${index+1}`} onMove={(from,to)=>onChange({images:moveItem(images,from,to)})}/><button type="button" onClick={()=>onChange({cover:image.src,coverAlt:image.alt})}>Làm ảnh bìa</button><button type="button" className="text-danger" aria-label={`Bỏ ảnh ${n+1}`} onClick={()=>onChange({images:images.filter((_,i)=>i!==n)})}>Bỏ</button></div></div></div>)}<button type="button" className="add-item" disabled={images.length>=8} onClick={()=>onUpload(row.id!,'gallery')}>＋ Thêm ảnh minh họa</button></div>
 </div>;
}
