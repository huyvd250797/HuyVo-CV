import type {Branding} from '@/lib/types';
export function BrandMark({branding,source}:{branding?:Branding;source?:string}){return branding?.logo?<img className="brand-logo" src={source||branding.logo} alt={branding.name||'Logo'}/>:<>{branding?.name||'maison.'}</>;}
