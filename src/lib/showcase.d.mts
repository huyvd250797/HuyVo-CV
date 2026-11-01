import type {Profile,Project,Locale} from './types';
export const appStatuses:string[];
export const sharedAppFields:string[];
export function appStatusLabel(status?:string,language?:string):string;
export function englishApp(source:Project):Project;
export function shareAppAssets(source:Project,target:Project):Project;
export function syncAppAssets(bundle:Profile,language:Locale):Profile;
export function completeEnglishApps(bundle:Profile):Profile;
export function visibleApps(profile:Profile):Project[];
