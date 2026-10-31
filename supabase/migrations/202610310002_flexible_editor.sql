-- Maison CV v1.2.0: additive function upgrades only. Run AFTER 001. No reset or reseed.
begin;
create or replace function public.save_cv_draft(p_content jsonb, p_expected_version bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare saved public.cv_documents;
begin
  if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
  if p_expected_version is null or p_expected_version < 0 or jsonb_typeof(p_content) is distinct from 'object' or octet_length(p_content::text) > 250000 then
    raise exception 'INVALID_CV' using errcode='22023';
  end if;
  p_content := p_content || '{"publication":"draft","cvFile":"","schemaVersion":2}'::jsonb;
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
declare draft public.cv_documents; published public.cv_publications; visible jsonb; section_id text;
begin
  if not public.is_cv_owner() then raise exception 'OWNER_REQUIRED' using errcode='42501'; end if;
  select * into draft from public.cv_documents where id=true for update;
  if draft.id is null or p_expected_version is null or draft.version <> p_expected_version then raise exception 'CV_CONFLICT' using errcode='40001'; end if;
  if coalesce(trim(draft.content->>'name'),'')='' or coalesce(trim(draft.content->>'role'),'')='' or
     (not coalesce(draft.content#>'{layout,hidden}','[]'::jsonb) ? 'personal' and coalesce(trim(draft.content->>'email'),'')='' and coalesce(trim(draft.content->>'phone'),'')='') then
    raise exception 'INCOMPLETE_CV' using errcode='22023';
  end if;
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
  return jsonb_build_object('document_version',published.document_version,'published_at',published.published_at);
end;
$$;
revoke all on function public.publish_cv(bigint) from public;
grant execute on function public.publish_cv(bigint) to authenticated;

create or replace function public.cv_schema_version() returns integer
language sql stable security definer set search_path = '' as $$
 select case when public.is_cv_owner() then 2 else 0 end;
$$;
revoke all on function public.cv_schema_version() from public;
grant execute on function public.cv_schema_version() to authenticated;
commit;
