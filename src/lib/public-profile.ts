import { cache } from 'react';
import { cloudConfig, serverCloud } from './cloud';
import { validateCv } from './validation.mjs';
import type { Profile } from './types';
export const loadPublicCv = cache(async (): Promise<{ profile: Profile | null; status: 'ready'|'unconfigured'|'empty'|'error'; version?: number }> => {
  if (!cloudConfig().ready) return { profile:null, status:'unconfigured' };
  try {
    const { data, error } = await serverCloud().from('cv_publications').select('content,document_version').eq('id',true).maybeSingle();
    if (error) return { profile:null, status:'error' };
    if (!data) return { profile:null, status:'empty' };
    const parsed = validateCv(data.content);
    if (parsed.errors.length || !parsed.data) return { profile:null,status:'error' };
    return { profile:{ ...parsed.data, publication:'published' },status:'ready',version:Number(data.document_version) };
  } catch { return { profile:null,status:'error' }; }
});
