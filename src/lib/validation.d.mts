import type { Profile,PublicationIssue } from './types';
export function validateCv(input: unknown, publishing?: boolean): { errors: string[]; data: Profile | null };
export function validWebUrl(value: string): boolean;
export function imageType(bytes: Uint8Array): { mime: string; extension: string } | null;

export function validatePublication(profile:Profile,language:'vi'|'en'):{errors:string[];issues:PublicationIssue[];data:Profile|null};
