'use client';
import {useEffect,useRef,type PointerEvent as ReactPointerEvent} from 'react';
import type {SectionId} from './types';
export function useCanvasDrag(onMove:(from:SectionId,to:SectionId)=>void){
 const drag=useRef<{from:SectionId;to:SectionId;handle:HTMLElement;pointerId:number;x:number;y:number}|null>(null),frame=useRef(0),highlight=useRef<HTMLElement|null>(null),move=useRef(onMove);move.current=onMove;
 function clean(){const current=drag.current;drag.current=null;cancelAnimationFrame(frame.current);highlight.current?.classList.remove('cv-drop-target');highlight.current=null;if(current){current.handle.classList.remove('is-dragging');if(current.handle.hasPointerCapture?.(current.pointerId))current.handle.releasePointerCapture(current.pointerId);}}
 useEffect(()=>()=>clean(),[]);
 function locate(){const current=drag.current;if(!current)return;const target=document.elementFromPoint(current.x,current.y)?.closest<HTMLElement>('[data-cv-block]');if(target){current.to=target.dataset.cvBlock as SectionId;highlight.current?.classList.remove('cv-drop-target');highlight.current=target;target.classList.add('cv-drop-target');}else{current.to=current.from;highlight.current?.classList.remove('cv-drop-target');highlight.current=null;}}
 function tick(){const current=drag.current;if(!current)return;const pane=current.handle.closest<HTMLElement>('.editor-canvas'),rect=pane?.getBoundingClientRect();
  if(pane&&rect&&pane.scrollHeight>pane.clientHeight+1){if(current.y>Math.min(rect.bottom,window.innerHeight)-55)pane.scrollTop+=12;else if(current.y<Math.max(rect.top,0)+55)pane.scrollTop-=12;}
  else if(current.y>window.innerHeight-55)window.scrollBy(0,12);else if(current.y<75)window.scrollBy(0,-12);
  locate();frame.current=requestAnimationFrame(tick);
 }
 function onPointerDown(event:ReactPointerEvent<HTMLDivElement>){
  const handle=(event.target as HTMLElement).closest<HTMLElement>('[data-cv-action="drag-block"]');if(!handle||event.button!==0)return;
  event.preventDefault();event.stopPropagation();clean();const from=handle.dataset.section as SectionId;drag.current={from,to:from,handle,pointerId:event.pointerId,x:event.clientX,y:event.clientY};handle.classList.add('is-dragging');handle.setPointerCapture?.(event.pointerId);frame.current=requestAnimationFrame(tick);
 }
 function onPointerMove(event:ReactPointerEvent<HTMLDivElement>){if(!drag.current||drag.current.pointerId!==event.pointerId)return;event.preventDefault();drag.current.x=event.clientX;drag.current.y=event.clientY;locate();}
 function onPointerUp(event:ReactPointerEvent<HTMLDivElement>){const current=drag.current;if(!current||current.pointerId!==event.pointerId)return;event.preventDefault();locate();const {from,to}=current;clean();if(from!==to)move.current(from,to);}
 return {onPointerDown,onPointerMove,onPointerUp,onPointerCancel:clean,onLostPointerCapture:()=>{if(drag.current)clean();}};
}
