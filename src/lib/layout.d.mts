import type { Profile,CvLayout,SectionId } from './types';
export const layoutZones:Record<'intro'|'aside'|'career',SectionId[]>;
export const sectionIds:SectionId[];
export function normalizeLayout(value?:unknown):CvLayout;
export function publicContent(profile:Profile):Profile;
export function moveItem<T>(items:T[],from:number,to:number):T[];
