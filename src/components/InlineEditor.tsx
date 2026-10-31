'use client';
import {useEffect,useRef} from 'react';
export type InlineEdit={path:string;value:string;left:number;top:number;width:number;label:string};
export function InlineEditor({edit,onChange,onCommit,onCancel}:{edit:InlineEdit;onChange:(value:string)=>void;onCommit:(cloud:boolean)=>void;onCancel:()=>void}){
 const pane=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{input.current?.focus({preventScroll:true});input.current?.select();const outside=(e:PointerEvent)=>{if(!pane.current?.contains(e.target as Node))onCommit(false);};const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onCancel();}};document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',key);};},[]);
 return <div ref={pane} className="inline-popover" role="dialog" aria-label="Chỉnh sửa trực tiếp" style={{left:Math.max(12,Math.min(edit.left,window.innerWidth-320)),top:Math.max(12,Math.min(edit.top,window.innerHeight-250)),width:Math.min(560,Math.max(296,edit.width),window.innerWidth-24)}}><label>{edit.label}<textarea ref={input} value={edit.value} onChange={e=>onChange(e.target.value)} maxLength={edit.path.startsWith('layout.titles.')?100:6000} rows={5}/></label><div><span>Bấm ra ngoài để cập nhật nháp</span><button aria-label="Hủy sửa trực tiếp" onClick={onCancel}>×</button><button className="editor-publish" aria-label="Lưu nội dung trực tiếp" onClick={()=>onCommit(true)}>✓</button></div></div>;
}
