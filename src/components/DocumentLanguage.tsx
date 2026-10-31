'use client';
import {useEffect} from 'react';
export function DocumentLanguage({language}:{language:string}){
 useEffect(()=>{document.documentElement.lang=language==='en'?'en':'vi';const skip=document.querySelector('.skip');if(skip)skip.textContent=language==='en'?'Skip to content':'Đến nội dung chính';},[language]);return null;
}
