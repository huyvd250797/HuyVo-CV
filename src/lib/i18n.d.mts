import type {Profile,Locale,PublicationIssue} from './types';
export const languages:Locale[];
export const languageName:Record<Locale,string>;
export const englishTitles:Record<string,string>;
export function localeOf(value:unknown):Locale;
export function textFor(profile:Profile,vi:string,en:string):string;
export function localizedProfile(bundle:Profile|null,language?:Locale):Profile|null;
export function updateLocalized(bundle:Profile,language:Locale,updater:Profile|((p:Profile)=>Profile)):Profile;
export function createEnglishProfile(profile:Profile):Profile;
export function formatPeriod(value:string,language:string):string;
export function englishGaps(bundle:Profile):string[];
export function mediaPaths(profile:Profile):string[];

export function englishIssues(bundle:Profile):PublicationIssue[];

export function completeEnglishSection(bundle:Profile,group:string):Profile;
