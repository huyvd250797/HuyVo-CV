-- Maison CV v1.7.0 — App Showcase. Run after 001..006. No rows are rewritten.
begin;
create or replace function public.cv_has_media(p_content jsonb,p_name text) returns boolean language sql immutable set search_path='' as $$
 select coalesce(
  jsonb_path_exists(p_content,'$.**.portrait ? (@ == $url)',jsonb_build_object('url','/api/media/'||p_name)) or
  jsonb_path_exists(p_content,'$.**.logo ? (@ == $url)',jsonb_build_object('url','/api/media/'||p_name)) or
  jsonb_path_exists(p_content,'$.**.favicon ? (@ == $url)',jsonb_build_object('url','/api/media/'||p_name)) or
  jsonb_path_exists(p_content,'$.**.cover ? (@ == $url)',jsonb_build_object('url','/api/media/'||p_name)) or
  jsonb_path_exists(p_content,'$.**.images[*].src ? (@ == $url)',jsonb_build_object('url','/api/media/'||p_name)),false);
$$;
revoke all on function public.cv_has_media(jsonb,text) from public;
grant execute on function public.cv_has_media(jsonb,text) to anon,authenticated;
-- Defence in depth for owner RPC clients. API returns translated, navigable field details.
create or replace function public.check_cv_english(p_content jsonb) returns void language plpgsql immutable set search_path='' as $$
declare en jsonb:=p_content#>'{translations,en}'; spec record; vi_row jsonb; en_row jsonb; row_position bigint; key text; expected integer; actual integer; section text;
begin
 if jsonb_typeof(en) is distinct from 'object' then raise exception 'EN_TRANSLATION_MISSING' using errcode='22023';end if;
 foreach key in array array['role','summary','objective'] loop
  if key='objective' and coalesce(en#>'{layout,hidden}','[]'::jsonb)?'objective' then continue;end if;
  if coalesce(trim(p_content->>key),'')<>'' and coalesce(trim(en->>key),'')='' then raise exception 'EN_TRANSLATION_MISSING: %',key using errcode='22023';end if;
 end loop;
 for spec in select * from (values
  ('education',array['school','degree','period','detail']),('skills',array['name','description']),('certificates',array['name','issuer','year']),
  ('experience',array['role','company','period','summary','highlights']),('implementations',array['name','description','period']),
  ('projects',array['name','description','role','platform','year','technologies','coverAlt'])
 ) as groups(group_name,fields) loop
  section:=case when spec.group_name='implementations' then 'delivery' else spec.group_name end;
  if coalesce(en#>'{layout,hidden}','[]'::jsonb)?section then continue;end if;
  for vi_row,row_position in select value,ordinality from jsonb_array_elements(coalesce(p_content->spec.group_name,'[]'::jsonb)) with ordinality loop
   if spec.group_name='projects' and coalesce(vi_row->>'hidden','false')='true' then continue;end if;
   select value into en_row from jsonb_array_elements(coalesce(en->spec.group_name,'[]'::jsonb)) with ordinality where case when vi_row->>'id' is not null and value->>'id' is not null then value->>'id'=vi_row->>'id' else ordinality=row_position end limit 1;
   if en_row is null then raise exception 'EN_TRANSLATION_MISSING: % / row %',spec.group_name,row_position using errcode='22023';end if;
   if spec.group_name='projects' and coalesce(en_row->>'hidden','false')='true' then continue;end if;
   foreach key in array spec.fields loop
    if jsonb_typeof(vi_row->key)='array' then
     select count(*) into expected from jsonb_array_elements_text(vi_row->key) x where trim(x)<>'';
     select count(*) into actual from jsonb_array_elements_text(coalesce(en_row->key,'[]'::jsonb)) x where trim(x)<>'';
     if actual<expected then raise exception 'EN_TRANSLATION_MISSING: % / row % / %',spec.group_name,row_position,key using errcode='22023';end if;
    elsif coalesce(trim(vi_row->>key),'')<>'' and coalesce(trim(en_row->>key),'')='' then raise exception 'EN_TRANSLATION_MISSING: % / row % / %',spec.group_name,row_position,key using errcode='22023';end if;
   end loop;
  end loop;
 end loop;
end;$$;
revoke all on function public.check_cv_english(jsonb) from public;
create or replace function public.save_cv_draft(p_content jsonb, p_expected_version bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare saved public.cv_documents;
begin
  if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
  if p_expected_version is null or p_expected_version < 0 or jsonb_typeof(p_content) is distinct from 'object' or octet_length(p_content::text) > 600000 then
    raise exception 'INVALID_CV' using errcode='22023';
  end if;
  p_content := p_content || '{"publication":"draft","cvFile":"","schemaVersion":6}'::jsonb;
  if p_expected_version = 0 then
    insert into public.cv_documents (id,content,version) values (true,p_content,1)
      on conflict (id) do nothing returning * into saved;
  else
    update public.cv_documents set content=p_content,version=version+1,updated_at=clock_timestamp()
      where id=true and version=p_expected_version returning * into saved;
  end if;
  if saved.id is null then raise exception 'CV_CONFLICT' using errcode='40001'; end if;
  return jsonb_build_object('content',saved.content,'version',saved.version,'updated_at',saved.updated_at);
end;
$$;
revoke all on function public.save_cv_draft(jsonb,bigint) from public;
grant execute on function public.save_cv_draft(jsonb,bigint) to authenticated;


create or replace function public.publish_cv(p_expected_version bigint,p_languages text[] default array['vi']) returns jsonb language plpgsql security definer set search_path='' as $$
declare draft public.cv_documents;target jsonb;visible jsonb;lang text;section_id text;rev uuid;published public.cv_publications;result jsonb='[]'::jsonb;
begin
 if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 if p_languages is null or cardinality(p_languages)<1 or cardinality(p_languages)>2 or not p_languages<@array['vi','en'] then raise exception 'INVALID_LANGUAGE' using errcode='22023';end if;
 select * into draft from public.cv_documents where id=true for update;
 if draft.id is null or draft.version is distinct from p_expected_version then raise exception 'CV_CONFLICT' using errcode='40001';end if;
 foreach lang in array p_languages loop
  target:=case when lang='en' then draft.content#>'{translations,en}' else draft.content end;
  if jsonb_typeof(target) is distinct from 'object' or coalesce(trim(target->>'name'),'')='' or coalesce(trim(target->>'role'),'')='' or (not coalesce(target#>'{layout,hidden}','[]'::jsonb)?'personal' and coalesce(target->>'email','')='' and coalesce(target->>'phone','')='') then raise exception 'INCOMPLETE_CV' using errcode='22023';end if;
  if lang='en' then perform public.check_cv_english(draft.content);end if;
  visible:=(target-'translations'-'branding')||jsonb_build_object('publication','published','language',lang,'cvFile','');
  for section_id in select jsonb_array_elements_text(coalesce(target#>'{layout,hidden}','[]'::jsonb)) loop
   visible:=visible#-array['layout','titles',section_id];
   case section_id
    when 'objective' then visible:=visible||'{"objective":""}'::jsonb;
    when 'personal' then visible:=visible||'{"email":"","phone":"","website":"","address":""}'::jsonb;
    when 'education' then visible:=visible||'{"education":[]}'::jsonb;
    when 'skills' then visible:=visible||'{"skills":[]}'::jsonb;
    when 'certificates' then visible:=visible||'{"certificates":[]}'::jsonb;
    when 'experience' then visible:=visible||'{"experience":[]}'::jsonb;
    when 'delivery' then visible:=visible||'{"implementations":[]}'::jsonb;
    when 'projects' then visible:=visible||'{"projects":[]}'::jsonb;
    else null;
   end case;
  end loop;
  visible:=jsonb_set(visible,'{projects}',coalesce((select jsonb_agg(item order by position) from jsonb_array_elements(coalesce(visible->'projects','[]'::jsonb)) with ordinality as app(item,position) where coalesce(item->>'hidden','false')<>'true'),'[]'::jsonb));
  insert into public.cv_publications(id,language,content,document_version,published_at) values(true,lang,visible,draft.version,clock_timestamp()) on conflict(id,language) do update set content=excluded.content,document_version=excluded.document_version,published_at=excluded.published_at returning * into published;
  result:=result||jsonb_build_array(jsonb_build_object('language',lang,'document_version',published.document_version,'published_at',published.published_at));
 end loop;
 insert into public.cv_revisions(kind,label,document_version,content,created_by) values('published','Xuất bản CV · '||array_to_string(p_languages,' + ')||' · v'||draft.version,draft.version,draft.content,auth.uid()) on conflict(document_version) where kind='published' do nothing returning id into rev;
 return jsonb_build_object('document_version',draft.version,'published_at',published.published_at,'revision_id',rev,'publications',result);
end;$$;
revoke all on function public.publish_cv(bigint,text[]) from public;grant execute on function public.publish_cv(bigint,text[]) to authenticated;
create or replace function public.cv_schema_version() returns integer language sql stable security definer set search_path='' as $$select case when public.is_cv_owner() then 7 else 0 end;$$;
revoke all on function public.cv_schema_version() from public;grant execute on function public.cv_schema_version() to authenticated;
insert into public.cv_migration_log(version) values('007_app_showcase') on conflict(version) do nothing;
commit;
