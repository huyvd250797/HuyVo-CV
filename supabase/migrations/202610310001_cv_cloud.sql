-- Maison CV v1.1.0. Run once in Supabase SQL Editor; safe to rerun.
-- No owner is inferred from the first login. Assign explicitly with setup-owner.sql.
begin;
create table if not exists public.cv_owner (
  id boolean primary key default true check (id),
  user_id uuid not null unique references auth.users(id) on delete restrict
);
alter table public.cv_owner enable row level security;
revoke all on public.cv_owner from anon, authenticated;
grant select on public.cv_owner to authenticated;
drop policy if exists cv_owner_self on public.cv_owner;
create policy cv_owner_self on public.cv_owner for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_cv_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.cv_owner where user_id = (select auth.uid()));
$$;
revoke all on function public.is_cv_owner() from public;
grant execute on function public.is_cv_owner() to authenticated;

create table if not exists public.cv_documents (
  id boolean primary key default true check (id),
  content jsonb not null check (jsonb_typeof(content) = 'object' and octet_length(content::text) <= 250000),
  version bigint not null check (version > 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.cv_publications (
  id boolean primary key default true check (id),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  document_version bigint not null,
  published_at timestamptz not null default now()
);
create table if not exists public.cv_assets (
  path text primary key,
  owner_id uuid not null references auth.users(id),
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 3145728),
  created_at timestamptz not null default now()
);
alter table public.cv_documents enable row level security;
alter table public.cv_publications enable row level security;
alter table public.cv_assets enable row level security;
revoke all on public.cv_documents, public.cv_publications, public.cv_assets from anon, authenticated;
grant select on public.cv_documents to authenticated;
grant select on public.cv_publications to anon, authenticated;
grant select, insert on public.cv_assets to authenticated;
drop policy if exists cv_draft_owner on public.cv_documents;
create policy cv_draft_owner on public.cv_documents for select to authenticated using ((select public.is_cv_owner()));
drop policy if exists cv_public_read on public.cv_publications;
create policy cv_public_read on public.cv_publications for select to anon, authenticated using (true);
drop policy if exists cv_assets_owner_read on public.cv_assets;
create policy cv_assets_owner_read on public.cv_assets for select to authenticated using (owner_id=(select auth.uid()) and (select public.is_cv_owner()));
drop policy if exists cv_assets_owner_insert on public.cv_assets;
create policy cv_assets_owner_insert on public.cv_assets for insert to authenticated with check (owner_id=(select auth.uid()) and (select public.is_cv_owner()) and path like (auth.uid()::text || '/%'));

create or replace function public.save_cv_draft(p_content jsonb, p_expected_version bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare saved public.cv_documents;
begin
  if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
  if p_expected_version is null or p_expected_version < 0 or jsonb_typeof(p_content) is distinct from 'object' or octet_length(p_content::text) > 250000 then
    raise exception 'INVALID_CV' using errcode='22023';
  end if;
  p_content := p_content || '{"publication":"draft","cvFile":"","schemaVersion":1}'::jsonb;
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

create or replace function public.publish_cv(p_expected_version bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare draft public.cv_documents; published public.cv_publications;
begin
  if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
  select * into draft from public.cv_documents where id=true for update;
  if draft.id is null or p_expected_version is null or draft.version <> p_expected_version then raise exception 'CV_CONFLICT' using errcode='40001'; end if;
  if coalesce(trim(draft.content->>'name'),'')='' or coalesce(trim(draft.content->>'role'),'')='' or
     (coalesce(trim(draft.content->>'email'),'')='' and coalesce(trim(draft.content->>'phone'),'')='') then
    raise exception 'INCOMPLETE_CV' using errcode='22023';
  end if;
  insert into public.cv_publications (id,content,document_version,published_at)
    values (true,draft.content || '{"publication":"published","cvFile":""}'::jsonb,draft.version,clock_timestamp())
    on conflict (id) do update set content=excluded.content,document_version=excluded.document_version,published_at=excluded.published_at
    returning * into published;
  return jsonb_build_object('document_version',published.document_version,'published_at',published.published_at);
end;
$$;
revoke all on function public.publish_cv(bigint) from public;
grant execute on function public.publish_cv(bigint) to authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('cv-assets','cv-assets',false,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=3145728,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists cv_storage_owner_read on storage.objects;
create policy cv_storage_owner_read on storage.objects for select to authenticated using (
  bucket_id='cv-assets' and (select public.is_cv_owner()) and (storage.foldername(name))[1]=(select auth.uid())::text
);
drop policy if exists cv_storage_owner_insert on storage.objects;
create policy cv_storage_owner_insert on storage.objects for insert to authenticated with check (
  bucket_id='cv-assets' and (select public.is_cv_owner()) and (storage.foldername(name))[1]=(select auth.uid())::text
);
drop policy if exists cv_storage_owner_delete on storage.objects;
create policy cv_storage_owner_delete on storage.objects for delete to authenticated using (
  bucket_id='cv-assets' and (select public.is_cv_owner()) and (storage.foldername(name))[1]=(select auth.uid())::text
);
drop policy if exists cv_storage_published_read on storage.objects;
create policy cv_storage_published_read on storage.objects for select to anon, authenticated using (
  bucket_id='cv-assets' and exists (
    select 1 from public.cv_publications p where p.id=true and p.content->>'portrait' = '/api/media/' || storage.objects.name
  )
);
commit;
