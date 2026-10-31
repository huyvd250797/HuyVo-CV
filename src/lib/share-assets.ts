import {readFile} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import QRCode from 'qrcode';
import {serverCloud} from './cloud';
import type {Profile} from './types';
import {canonicalCvUrl} from './sharing.mjs';
export async function publicPortrait(profile:Profile):Promise<Buffer|undefined>{
 if(!profile.portrait)return;
 let bytes:Buffer;
 const media=profile.portrait.match(/^\/api\/media\/([0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|png|webp))$/);
 if(media){const {data,error}=await serverCloud().storage.from('cv-assets').download(media[1]);if(error||!data)throw new Error('PORTRAIT_UNAVAILABLE');bytes=Buffer.from(await data.arrayBuffer());}
 else if(/^\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/.test(profile.portrait)){bytes=await readFile(path.join(process.cwd(),'public',profile.portrait.slice(1)));}
 else throw new Error('INVALID_PORTRAIT');
 if(bytes.length>3*1024*1024)throw new Error('PORTRAIT_TOO_LARGE');
 return sharp(bytes,{limitInputPixels:25_000_000}).rotate().resize({width:600,height:750,fit:'inside',withoutEnlargement:true}).flatten({background:'#f3eee4'}).jpeg({quality:85,mozjpeg:true}).toBuffer();
}
export async function profileQr(profile:Profile){const url=canonicalCvUrl(profile.siteUrl);return url?QRCode.toBuffer(url,{type:'png',width:480,margin:4,errorCorrectionLevel:'M',color:{dark:'#302b24',light:'#ffffff'}}):undefined;}
