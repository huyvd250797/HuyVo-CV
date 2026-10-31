-- Maison CV v1.4.0: application capability; no content rewrite or reset.
-- Run after 001 -> 002 -> 003. Reload old editor tabs after deployment.
begin;
create or replace function public.save_cv_draft(p_content jsonb, p_expected_version bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare saved public.cv_documents;
begin
  if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
  if p_expected_version is null or p_expected_version < 0 or jsonb_typeof(p_content) is distinct from 'object' or octet_length(p_content::text) > 250000 then
    raise exception 'INVALID_CV' using errcode='22023';
  end if;
  p_content := p_content || '{"publication":"draft","cvFile":"","schemaVersion":3}'::jsonb;
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

create or replace function public.cv_schema_version() returns integer language sql stable security definer set search_path='' as $$
 select case when public.is_cv_owner() then 4 else 0 end;
$$;
revoke all on function public.cv_schema_version() from public;
grant execute on function public.cv_schema_version() to authenticated;
insert into public.cv_migration_log(version) values('004_sharing') on conflict(version) do nothing;
commit;
