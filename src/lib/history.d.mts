import type {Profile} from './types';
export const BACKUP_FORMAT:string;export const BACKUP_VERSION:number;export const MAX_BACKUP_BYTES:number;
export const historyKinds:Record<string,string>;
export function parseBackup(input:unknown):{errors:string[];warnings:string[];data:Profile|null};
export function makeBackup(profile:Profile,documentVersion:number,exportedAt?:string):{format:string;formatVersion:number;appVersion:string;exportedAt:string;documentVersion:number;profile:Profile;media:{included:boolean;note:string}};
export function diffProfiles(before:Profile,after:Profile):{key:string;label:string;before:string;after:string}[];
