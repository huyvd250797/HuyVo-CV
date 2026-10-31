'use client';
export function PrintButton({language='vi'}:{language?:string}) { return <button className="button primary" onClick={async()=>{await document.fonts.ready;window.print();}}>{language==='en'?'Print / Save PDF ↓':'In / Lưu PDF ↓'}</button>; }
