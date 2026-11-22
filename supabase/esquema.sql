-- Auxi: tablas y permisos en Supabase.
-- Pégalo completo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.

-- 1) Avance de cada persona (lecciones, racha, monedas, cofres, misiones, cursos, entregas…)
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  estado jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

alter table public.perfiles enable row level security;

-- Acceso por la API solo para personas con sesión (nunca para visitantes anónimos).
revoke all on public.perfiles from anon;
grant select, insert, update on public.perfiles to authenticated;

-- Cada persona solo ve y cambia lo suyo.
drop policy if exists "ver mi perfil" on public.perfiles;
create policy "ver mi perfil" on public.perfiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "crear mi perfil" on public.perfiles;
create policy "crear mi perfil" on public.perfiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "cambiar mi perfil" on public.perfiles;
create policy "cambiar mi perfil" on public.perfiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- 2) PDF de cada tema: carpeta privada por persona (archivos/<id de usuario>/<archivo>)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('archivos', 'archivos', false, 26214400, array['application/pdf'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ver mis archivos" on storage.objects;
create policy "ver mis archivos" on storage.objects
  for select to authenticated
  using (bucket_id = 'archivos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "subir mis archivos" on storage.objects;
create policy "subir mis archivos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'archivos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "cambiar mis archivos" on storage.objects;
create policy "cambiar mis archivos" on storage.objects
  for update to authenticated
  using (bucket_id = 'archivos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "borrar mis archivos" on storage.objects;
create policy "borrar mis archivos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'archivos' and (storage.foldername(name))[1] = (select auth.uid())::text);
