import type { Profile } from './types';
export function validateCv(input: unknown, publishing?: boolean): { errors: string[]; data: Profile | null };
export function validWebUrl(value: string): boolean;
export function imageType(bytes: Uint8Array): { mime: string; extension: string } | null;
