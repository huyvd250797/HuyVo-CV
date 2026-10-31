-- Maison CV v1.3.0. Run after 001 and 002. No reset, no owner transfer.
begin;
create table if not exists public.cv_revisions (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('published','manual','before_restore','restore','before_import','import','baseline_draft','baseline_public')),
 label text not null check(char_length(label) between 1 and 120),
 note text not null default '' check(char_length(note)<=1000),
 document_version bigint not null check(document_version>0),
 content jsonb not null check(jsonb_typeof(content)='object' and octet_length(content::text)<=250000),
 parent_revision_id uuid references public.cv_revisions(id) on delete restrict,
 origin_key text unique,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default clock_timestamp(),
 size_bytes integer generated always as (octet_length(content::text)) stored
);
create index if not exists cv_revisions_timeline on public.cv_revisions(created_at desc,id desc);
create unique index if not exists cv_revisions_publication_version on public.cv_revisions(document_version) where kind='published';
alter table public.cv_revisions enable row level security;
revoke all on public.cv_revisions from anon,authenticated;
grant select on public.cv_revisions to authenticated;
drop policy if exists cv_revisions_owner_read on public.cv_revisions;
create policy cv_revisions_owner_read on public.cv_revisions for select to authenticated using ((select public.is_cv_owner()));

create table if not exists public.cv_migration_log (version text primary key,applied_at timestamptz not null default clock_timestamp());
alter table public.cv_migration_log enable row level security;
revoke all on public.cv_migration_log from anon,authenticated;
-- Capture only the states that really exist at upgrade time. Reruns do not add fake history.
insert into public.cv_revisions(kind,label,document_version,content,origin_key)
 select 'baseline_draft','Bản nháp trước nâng cấp v1.3',version,content,'migration_003_draft' from public.cv_documents where id=true and not exists(select 1 from public.cv_migration_log where version='003_history')
 on conflict(origin_key) do nothing;
insert into public.cv_revisions(kind,label,document_version,content,origin_key)
 select 'baseline_public','Bản công khai trước nâng cấp v1.3',document_version,content,'migration_003_public' from public.cv_publications where id=true and not exists(select 1 from public.cv_migration_log where version='003_history')
 on conflict(origin_key) do nothing;

insert into public.cv_migration_log(version) values('003_history') on conflict(version) do nothing;

create or replace function public.create_cv_checkpoint(p_expected_version bigint,p_label text,p_note text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare draft public.cv_documents; saved public.cv_revisions;
begin
 if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
 select * into draft from public.cv_documents where id=true for update;
 if draft.id is null or p_expected_version is null or draft.version<>p_expected_version then raise exception 'CV_CONFLICT' using errcode='40001'; end if;
 if char_length(coalesce(p_label,''))>120 or char_length(coalesce(p_note,''))>1000 then raise exception 'INVALID_REVISION_LABEL' using errcode='22023'; end if;
 insert into public.cv_revisions(kind,label,note,document_version,content,created_by)
 values ('manual',coalesce(nullif(trim(p_label),''),'Mốc CV · v'||draft.version),coalesce(p_note,''),draft.version,draft.content,auth.uid()) returning * into saved;
 return jsonb_build_object('id',saved.id,'kind',saved.kind,'label',saved.label,'document_version',saved.document_version,'created_at',saved.created_at);
end;
$$;
revoke all on function public.create_cv_checkpoint(bigint,text,text) from public;
grant execute on function public.create_cv_checkpoint(bigint,text,text) to authenticated;

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
 if jsonb_typeof(target) is distinct from 'object' or octet_length(target::text)>250000 then raise exception 'INVALID_CV' using errcode='22023'; end if;
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

-- Keep portraits that are still referenced by any draft/publication/revision.
drop policy if exists cv_storage_owner_delete on storage.objects;
create policy cv_storage_owner_delete on storage.objects for delete to authenticated using (
 bucket_id='cv-assets' and (select public.is_cv_owner()) and (storage.foldername(name))[1]=(select auth.uid())::text
 and not exists(select 1 from public.cv_documents d where d.content->>'portrait'='/api/media/'||storage.objects.name)
 and not exists(select 1 from public.cv_publications p where p.content->>'portrait'='/api/media/'||storage.objects.name)
 and not exists(select 1 from public.cv_revisions r where r.content->>'portrait'='/api/media/'||storage.objects.name)
);
create or replace function public.publish_cv(p_expected_version bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare draft public.cv_documents; published public.cv_publications; visible jsonb; section_id text; revision_id uuid;
begin
  if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
  select * into draft from public.cv_documents where id=true for update;
  if draft.id is null or p_expected_version is null or draft.version <> p_expected_version then raise exception 'CV_CONFLICT' using errcode='40001'; end if;
  if coalesce(trim(draft.content->>'name'),'')='' or coalesce(trim(draft.content->>'role'),'')='' or
     (not coalesce(draft.content#>'{layout,hidden}','[]'::jsonb) ? 'personal' and coalesce(trim(draft.content->>'email'),'')='' and coalesce(trim(draft.content->>'phone'),'')='') then
    raise exception 'INCOMPLETE_CV' using errcode='22023';
  end if;
  insert into public.cv_revisions(kind,label,document_version,content,created_by)
    values ('published','Xuất bản CV · v' || draft.version,draft.version,draft.content,auth.uid())
    on conflict (document_version) where kind='published' do nothing returning id into revision_id;
  if revision_id is null then select id into revision_id from public.cv_revisions where kind='published' and document_version=draft.version; end if;
  visible := draft.content || '{"publication":"published","cvFile":""}'::jsonb;
  for section_id in select jsonb_array_elements_text(coalesce(draft.content#>'{layout,hidden}','[]'::jsonb)) loop
    case section_id
      when 'objective' then visible := visible || '{"objective":""}'::jsonb;
      when 'personal' then visible := visible || '{"email":"","phone":"","website":"","address":""}'::jsonb;
      when 'education' then visible := visible || '{"education":[]}'::jsonb;
      when 'skills' then visible := visible || '{"skills":[]}'::jsonb;
      when 'certificates' then visible := visible || '{"certificates":[]}'::jsonb;
      when 'experience' then visible := visible || '{"experience":[]}'::jsonb;
      when 'delivery' then visible := visible || '{"implementations":[]}'::jsonb;
      when 'projects' then visible := visible || '{"projects":[]}'::jsonb;
      else null;
    end case;
  end loop;
  insert into public.cv_publications (id,content,document_version,published_at)
    values (true,visible,draft.version,clock_timestamp())
    on conflict (id) do update set content=excluded.content,document_version=excluded.document_version,published_at=excluded.published_at
    returning * into published;
  return jsonb_build_object('document_version',published.document_version,'published_at',published.published_at,'revision_id',revision_id);
end;
$$;
revoke all on function public.publish_cv(bigint) from public;
grant execute on function public.publish_cv(bigint) to authenticated;

create or replace function public.cv_schema_version() returns integer language sql stable security definer set search_path='' as $$
 select case when public.is_cv_owner() then 3 else 0 end;
$$;
revoke all on function public.cv_schema_version() from public;
grant execute on function public.cv_schema_version() to authenticated;
commit;
