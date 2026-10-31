'use client';
export function PrintButton() { return <button className="button primary" onClick={async()=>{await document.fonts.ready;window.print();}}>In / Lưu PDF ↓</button>; }
