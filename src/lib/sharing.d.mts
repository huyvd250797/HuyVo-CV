import type {Metadata} from 'next';
import type {Profile} from './types';
export function canonicalCvUrl(value:unknown):string|null;
export function pdfFilename(name:string,version:number):string;
export function publishedMetadata(profile:Profile,version?:number):Metadata;
