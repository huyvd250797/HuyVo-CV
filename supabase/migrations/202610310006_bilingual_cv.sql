-- Maison CV v1.6.0. Run after 001..005. Existing VI content is not rewritten.
begin;
alter table public.cv_documents drop constraint if exists cv_documents_content_check;
alter table public.cv_documents add constraint cv_documents_content_check check(jsonb_typeof(content)='object' and octet_length(content::text)<=600000);
alter table public.cv_publications add column if not exists language text not null default 'vi';
alter table public.cv_publications drop constraint if exists cv_publications_pkey;
alter table public.cv_publications add constraint cv_publications_pkey primary key(id,language);
alter table public.cv_publications drop constraint if exists cv_publications_language_check;
alter table public.cv_publications add constraint cv_publications_language_check check(language in ('vi','en'));
alter table public.cv_revisions drop constraint if exists cv_revisions_content_check;
alter table public.cv_revisions add constraint cv_revisions_content_check check(jsonb_typeof(content)='object' and octet_length(content::text)<=600000);
alter table public.cv_revisions drop constraint if exists cv_revisions_parent_revision_id_fkey;
alter table public.cv_revisions add constraint cv_revisions_parent_revision_id_fkey foreign key(parent_revision_id) references public.cv_revisions(id) on delete set null;
create table if not exists public.cv_preferences(id boolean primary key default true check(id),content jsonb not null default '{"autoSave":true,"branding":{"name":"maison.","logo":"","favicon":""}}',version bigint not null default 1,updated_at timestamptz not null default clock_timestamp());
insert into public.cv_preferences(id) values(true) on conflict(id) do nothing;
alter table public.cv_preferences enable row level security;
revoke all on public.cv_preferences from anon,authenticated;grant select on public.cv_preferences to authenticated;
drop policy if exists cv_preferences_owner_read on public.cv_preferences;
create policy cv_preferences_owner_read on public.cv_preferences for select to authenticated using((select public.is_cv_owner()));
create or replace function public.public_cv_branding() returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce((select content->'branding' from public.cv_preferences where id=true),'{"name":"maison.","logo":"","favicon":""}'::jsonb);
$$;
revoke all on function public.public_cv_branding() from public;grant execute on function public.public_cv_branding() to anon,authenticated;
create or replace function public.save_cv_preferences(p_content jsonb,p_expected_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.cv_preferences; asset text;
begin
 if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 if jsonb_typeof(p_content->'autoSave') is distinct from 'boolean' or jsonb_typeof(p_content->'branding') is distinct from 'object' or char_length(coalesce(p_content#>>'{branding,name}',''))>80 then raise exception 'INVALID_SETTINGS' using errcode='22023';end if;
 foreach asset in array array[coalesce(p_content#>>'{branding,logo}',''),coalesce(p_content#>>'{branding,favicon}','')] loop
  if asset<>'' and (asset not like '/api/media/'||auth.uid()::text||'/%' or asset !~ '^/api/media/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$') then raise exception 'INVALID_ASSET' using errcode='22023';end if;
 end loop;
 update public.cv_preferences set content=jsonb_build_object('autoSave',p_content->'autoSave','branding',jsonb_build_object('name',coalesce(nullif(trim(p_content#>>'{branding,name}'),''),'maison.'),'logo',coalesce(p_content#>>'{branding,logo}',''),'favicon',coalesce(p_content#>>'{branding,favicon}',''))),version=version+1,updated_at=clock_timestamp() where id=true and version=p_expected_version returning * into saved;
 if saved.id is null then raise exception 'CV_CONFLICT' using errcode='40001';end if;
 return jsonb_build_object('content',saved.content,'version',saved.version,'updated_at',saved.updated_at);
end;$$;
revoke all on function public.save_cv_preferences(jsonb,bigint) from public;grant execute on function public.save_cv_preferences(jsonb,bigint) to authenticated;
create or replace function public.cv_has_media(p_content jsonb,p_name text) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_path_exists(p_content,'$.**.portrait ? (@ == $url)',jsonb_build_object('url','/api/media/'||p_name)) or jsonb_path_exists(p_content,'$.**.logo ? (@ == $url)',jsonb_build_object('url','/api/media/'||p_name)) or jsonb_path_exists(p_content,'$.**.favicon ? (@ == $url)',jsonb_build_object('url','/api/media/'||p_name)),false);
$$;
revoke all on function public.cv_has_media(jsonb,text) from public;grant execute on function public.cv_has_media(jsonb,text) to anon,authenticated;
drop policy if exists cv_storage_published_read on storage.objects;
create policy cv_storage_published_read on storage.objects for select to anon,authenticated using(bucket_id='cv-assets' and (exists(select 1 from public.cv_publications p where public.cv_has_media(p.content,storage.objects.name)) or public.cv_has_media(public.public_cv_branding(),storage.objects.name)));
drop policy if exists cv_storage_owner_delete on storage.objects;
create policy cv_storage_owner_delete on storage.objects for delete to authenticated using(bucket_id='cv-assets' and (select public.is_cv_owner()) and (storage.foldername(name))[1]=(select auth.uid())::text and not exists(select 1 from public.cv_documents d where public.cv_has_media(d.content,storage.objects.name)) and not exists(select 1 from public.cv_publications p where public.cv_has_media(p.content,storage.objects.name)) and not exists(select 1 from public.cv_revisions r where public.cv_has_media(r.content,storage.objects.name)) and not public.cv_has_media(public.public_cv_branding(),storage.objects.name));
create or replace function public.save_cv_draft(p_content jsonb, p_expected_version bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare saved public.cv_documents;
begin
  if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
  if p_expected_version is null or p_expected_version < 0 or jsonb_typeof(p_content) is distinct from 'object' or octet_length(p_content::text) > 600000 then
    raise exception 'INVALID_CV' using errcode='22023';
  end if;
  p_content := p_content || '{"publication":"draft","cvFile":"","schemaVersion":5}'::jsonb;
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


create or replace function public.apply_cv_recovery(p_expected_version bigint,p_source text,p_content jsonb default null,p_revision_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare draft public.cv_documents; target jsonb; original_id uuid; result jsonb; new_id uuid; selected public.cv_revisions;
begin
 if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
 if p_source not in ('restore','import') or p_source is null then raise exception 'INVALID_RECOVERY_SOURCE' using errcode='22023'; end if;
 select * into draft from public.cv_documents where id=true for update;
 if p_expected_version is null or p_expected_version<0 or
    (draft.id is null and p_expected_version<>0) or
    (draft.id is not null and draft.version<>p_expected_version) then raise exception 'CV_CONFLICT' using errcode='40001'; end if;
 if p_source='restore' then
  select * into selected from public.cv_revisions where id=p_revision_id;
  if selected.id is null then raise exception 'REVISION_NOT_FOUND' using errcode='P0002'; end if;
  target:=selected.content;
 else target:=p_content;
 end if;
 if jsonb_typeof(target) is distinct from 'object' or octet_length(target::text)>600000 then raise exception 'INVALID_CV' using errcode='22023'; end if;
 if draft.id is not null then
  insert into public.cv_revisions(kind,label,document_version,content,created_by,parent_revision_id)
  values ('before_'||p_source,case when p_source='restore' then 'Trước khi khôi phục' else 'Trước khi nhập JSON' end,draft.version,draft.content,auth.uid(),case when p_source='restore' then selected.id else null end)
  returning id into original_id;
 end if;
 result:=public.save_cv_draft(target,p_expected_version);
 insert into public.cv_revisions(kind,label,document_version,content,created_by,parent_revision_id)
 values(p_source,case when p_source='restore' then 'Khôi phục: '||left(selected.label,90) else 'Nhập từ file JSON' end,(result->>'version')::bigint,result->'content',auth.uid(),case when p_source='restore' then selected.id else original_id end)
 returning id into new_id;
 return jsonb_build_object('document',result,'before_revision_id',original_id,'revision_id',new_id);
end;
$$;
revoke all on function public.apply_cv_recovery(bigint,text,jsonb,uuid) from public;
grant execute on function public.apply_cv_recovery(bigint,text,jsonb,uuid) to authenticated;


drop function if exists public.publish_cv(bigint);
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
  insert into public.cv_publications(id,language,content,document_version,published_at) values(true,lang,visible,draft.version,clock_timestamp()) on conflict(id,language) do update set content=excluded.content,document_version=excluded.document_version,published_at=excluded.published_at returning * into published;
  result:=result||jsonb_build_array(jsonb_build_object('language',lang,'document_version',published.document_version,'published_at',published.published_at));
 end loop;
 insert into public.cv_revisions(kind,label,document_version,content,created_by) values('published','Xuất bản CV · '||array_to_string(p_languages,' + ')||' · v'||draft.version,draft.version,draft.content,auth.uid()) on conflict(document_version) where kind='published' do nothing returning id into rev;
 return jsonb_build_object('document_version',draft.version,'published_at',published.published_at,'revision_id',rev,'publications',result);
end;$$;
revoke all on function public.publish_cv(bigint,text[]) from public;grant execute on function public.publish_cv(bigint,text[]) to authenticated;
create or replace function public.delete_cv_history(p_id uuid default null,p_all boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare removed bigint;
begin
 if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501';end if;
 if (p_all and p_id is not null) or (not p_all and p_id is null) then raise exception 'INVALID_DELETE' using errcode='22023';end if;
 perform 1 from public.cv_documents where id=true for update;
 lock table public.cv_revisions in share row exclusive mode;
 if p_all then delete from public.cv_revisions;else delete from public.cv_revisions where id=p_id;end if;
 get diagnostics removed=row_count;return jsonb_build_object('deleted',removed);
end;$$;
revoke all on function public.delete_cv_history(uuid,boolean) from public;grant execute on function public.delete_cv_history(uuid,boolean) to authenticated;
create or replace function public.cv_schema_version() returns integer language sql stable security definer set search_path='' as $$select case when public.is_cv_owner() then 6 else 0 end;$$;
revoke all on function public.cv_schema_version() from public;grant execute on function public.cv_schema_version() to authenticated;
insert into public.cv_migration_log(version) values('006_bilingual') on conflict(version) do nothing;
commit;
