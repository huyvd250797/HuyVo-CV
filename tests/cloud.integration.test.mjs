import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const migration=await readFile(new URL('../supabase/migrations/202610310001_cv_cloud.sql',import.meta.url),'utf8');
const owner='11111111-1111-4111-8111-111111111111', stranger='22222222-2222-4222-8222-222222222222';

test('Postgres migration: explicit owner, RLS, atomic saves, published snapshots and private images',async t=>{
 const db=new PGlite();
 await db.exec(`
  create role anon; create role authenticated;
  create schema auth; create schema storage;
  create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  grant usage on schema public,auth,storage to anon,authenticated;
  grant execute on function auth.uid() to anon,authenticated;
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table storage.objects(id bigint generated always as identity primary key,bucket_id text,name text);
  alter table storage.objects enable row level security;
  grant select,insert,delete on storage.objects to anon,authenticated;
  grant usage on sequence storage.objects_id_seq to anon,authenticated;
  create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
  insert into auth.users values ('${owner}'),('${stranger}');
 `);
 await db.exec(migration); await db.exec(migration);
 async function as(role,user='') {await db.exec(`reset role;select set_config('request.jwt.claim.sub','${user}',false);set role ${role};`);}
 async function scalar(query,args=[]) {return (await db.query(query,args)).rows[0]?.value;}
 const content={name:'Tên kiểm thử',role:'IT PM / BA',email:'test@example.com',phone:'',portrait:`/api/media/${owner}/33333333-3333-4333-8333-333333333333.png`,publication:'draft'};
 await t.test('No first-login ownership or automatic public seed',async()=>{
  await as('authenticated',stranger);
  assert.equal(await scalar('select public.is_cv_owner() as value'),false);
  await assert.rejects(db.query('select public.save_cv_draft($1::jsonb,0)',[JSON.stringify(content)]),/OWNER_REQUIRED/);
  assert.equal((await db.query('select * from public.cv_publications')).rows.length,0);
  await as('postgres');await db.query('insert into public.cv_owner(id,user_id) values(true,$1)',[owner]);
 });
 await t.test('Owner can save first draft; duplicate seed and stale version are rejected',async()=>{
  await as('authenticated',owner);
  const first=await scalar('select public.save_cv_draft($1::jsonb,0) as value',[JSON.stringify(content)]);
  assert.equal(first.version,1);assert.equal(first.content.publication,'draft');assert.equal(first.content.cvFile,'');
  await assert.rejects(db.query('select public.save_cv_draft($1::jsonb,0)',[JSON.stringify(content)]),/CV_CONFLICT/);
  const next=await scalar('select public.save_cv_draft($1::jsonb,1) as value',[JSON.stringify({...content,summary:'Saved on device A'})]);
  assert.equal(next.version,2);
  await assert.rejects(db.query('select public.save_cv_draft($1::jsonb,1)',[JSON.stringify({...content,summary:'Device B stale'})]),/CV_CONFLICT/);
  assert.equal((await db.query('select content from public.cv_documents')).rows[0].content.summary,'Saved on device A');
 });
 await t.test('Anonymous cannot read drafts or claim ownership; other signed-in user sees no draft',async()=>{
  await as('anon');await assert.rejects(db.query('select * from public.cv_documents'),/permission denied/);
  await assert.rejects(db.query('select * from public.cv_owner'),/permission denied/);
  await assert.rejects(db.query('select public.publish_cv(2)'),/permission denied/);
  await as('authenticated',stranger);
  assert.equal((await db.query('select * from public.cv_documents')).rows.length,0);
  assert.equal((await db.query('select * from public.cv_owner')).rows.length,0);
  await assert.rejects(db.query('update public.cv_owner set user_id=$1',[stranger]),/permission denied/);
  await assert.rejects(db.query('select public.publish_cv(2)'),/OWNER_REQUIRED/);
  await as('authenticated',owner);
  await assert.rejects(db.query("update public.cv_documents set content='{}'"),/permission denied/);
  await assert.rejects(db.query("insert into public.cv_publications values(true,'{}',99,now())"),/permission denied/);
 });
 const imagePath=content.portrait.slice('/api/media/'.length), otherPath=`${owner}/44444444-4444-4444-8444-444444444444.png`;
 await t.test('Draft images are private and storage writes require explicit owner',async()=>{
  await as('authenticated',stranger);
  await assert.rejects(db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['cv-assets',`${stranger}/bad.png`]),/row-level security/);
  await as('authenticated',owner);
  await db.query('insert into storage.objects(bucket_id,name) values($1,$2),($1,$3)',['cv-assets',imagePath,otherPath]);
  assert.equal((await db.query('select * from storage.objects')).rows.length,2);
  await as('anon');assert.equal((await db.query('select * from storage.objects')).rows.length,0);
  await as('authenticated',stranger);assert.equal((await db.query('select * from storage.objects')).rows.length,0);
 });
 await t.test('Only published snapshot and referenced portrait become public; drafts remain isolated',async()=>{
  await as('authenticated',owner);
  await assert.rejects(db.query('select public.publish_cv(1)'),/CV_CONFLICT/);
  const published=await scalar('select public.publish_cv(2) as value');assert.equal(published.document_version,2);
  await as('anon');
  const publicRows=(await db.query('select content from public.cv_publications')).rows;
  assert.equal(publicRows.length,1);assert.equal(publicRows[0].content.publication,'published');
  assert.deepEqual((await db.query('select name from storage.objects')).rows.map(r=>r.name),[imagePath]);
  await as('authenticated',owner);
  await scalar('select public.save_cv_draft($1::jsonb,2) as value',[JSON.stringify({...content,name:'PRIVATE DRAFT',portrait:`/api/media/${otherPath}`})]);
  await as('anon');assert.equal((await db.query('select content from public.cv_publications')).rows[0].content.name,'Tên kiểm thử');
  assert.deepEqual((await db.query('select name from storage.objects')).rows.map(r=>r.name),[imagePath]);
  await as('authenticated',owner);await db.query('select public.publish_cv(3)');
  await as('anon');assert.deepEqual((await db.query('select name from storage.objects')).rows.map(r=>r.name),[otherPath]);
 });
 await db.close();
});
