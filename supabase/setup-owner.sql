-- 1. Authentication > Users > Add user. Create Boss's user and confirm email.
-- 2. Copy the User UID and replace the value below. Run AFTER the migration.
-- This script will not silently transfer an existing owner's rights.
do $$
declare target uuid := 'REPLACE_WITH_AUTH_USER_UUID'; existing uuid;
begin
  if not exists (select 1 from auth.users where id=target) then raise exception 'User UID does not exist in Authentication'; end if;
  select user_id into existing from public.cv_owner where id=true;
  if existing is not null and existing <> target then raise exception 'CV already has an owner. Explicit ownership transfer is required.'; end if;
  insert into public.cv_owner (id,user_id) values (true,target) on conflict (id) do nothing;
end $$;
