'use client';
import {useEffect,useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
export function usePrivateMedia(paths:string[],client:SupabaseClient|null){
 const [assets,setAssets]=useState<Record<string,string>>({}),key=[...new Set(paths.filter(p=>p.startsWith('/api/media/')))].sort().join('|');
 useEffect(()=>{let alive=true;const urls:string[]=[];setAssets({});if(!client||!key)return;void(async()=>{const {data}=await client.auth.getSession();const token=data.session?.access_token;if(!token)return;const pairs=await Promise.all(key.split('|').map(async source=>{try{const r=await fetch(source,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});if(!r.ok)return null;const url=URL.createObjectURL(await r.blob());urls.push(url);return [source,url];}catch{return null;}}));if(alive)setAssets(Object.fromEntries(pairs.filter(Boolean) as string[][]));else urls.forEach(url=>URL.revokeObjectURL(url));})().catch(()=>{});return()=>{alive=false;urls.forEach(url=>URL.revokeObjectURL(url));};},[client,key]);return assets;
}
