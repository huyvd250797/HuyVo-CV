import {readFile} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import QRCode from 'qrcode';
import {serverCloud} from './cloud';
import type {Profile} from './types';
import {canonicalCvUrl} from './sharing.mjs';
export async function publicImage(source:string):Promise<Buffer|undefined>{
 if(!source)return;
 let bytes:Buffer;
 const media=source.match(/^\/api\/media\/([0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|png|webp))$/);
 if(media){const {data,error}=await serverCloud().storage.from('cv-assets').download(media[1]);if(error||!data)throw new Error('PORTRAIT_UNAVAILABLE');bytes=Buffer.from(await data.arrayBuffer());}
 else if(/^\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/.test(source)){bytes=await readFile(path.join(process.cwd(),'public',source.slice(1)));}
 else throw new Error('INVALID_PORTRAIT');
 if(bytes.length>3*1024*1024)throw new Error('PORTRAIT_TOO_LARGE');
 return sharp(bytes,{limitInputPixels:25_000_000}).rotate().resize({width:600,height:750,fit:'inside',withoutEnlargement:true}).flatten({background:'#f3eee4'}).jpeg({quality:85,mozjpeg:true}).toBuffer();
}
export async function profileQr(profile:Profile){const url=canonicalCvUrl(profile.siteUrl,profile.language);return url?QRCode.toBuffer(url,{type:'png',width:480,margin:4,errorCorrectionLevel:'M',color:{dark:'#302b24',light:'#ffffff'}}):undefined;}

export async function publicPortrait(profile:Profile){return publicImage(profile.portrait);}
export async function unitLogos(profile:Profile){const result:Record<string,Buffer>={};for(let i=0;i<profile.implementations.length;i+=4)await Promise.all(profile.implementations.slice(i,i+4).map(async(row,index)=>{if(row.logo){const image=await publicImage(row.logo);if(image)result[String(i+index)]=image;}}));return result;}
