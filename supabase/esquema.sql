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

-- 3) Solicitudes del pase libre (apoyo al creador): la persona manda capturas por WhatsApp
--    y el dueño aprueba o rechaza desde el panel de revisión.
create table if not exists public.solicitudes_apoyo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  codigo text not null,
  instagram text,
  tiktok text,
  comentario text,
  correo text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  nota text,
  creado timestamptz not null default now(),
  revisado timestamptz
);

create unique index if not exists una_solicitud_pendiente on public.solicitudes_apoyo (user_id) where estado = 'pendiente';

alter table public.solicitudes_apoyo enable row level security;
revoke all on public.solicitudes_apoyo from anon;
grant select, insert, update on public.solicitudes_apoyo to authenticated;

drop policy if exists "ver mis solicitudes" on public.solicitudes_apoyo;
create policy "ver mis solicitudes" on public.solicitudes_apoyo
  for select to authenticated
  using ((select auth.uid()) = user_id or (select auth.jwt() ->> 'email') = 'chongdaniel91@gmail.com');

drop policy if exists "crear mi solicitud" on public.solicitudes_apoyo;
create policy "crear mi solicitud" on public.solicitudes_apoyo
  for insert to authenticated
  with check ((select auth.uid()) = user_id and estado = 'pendiente');

-- Solo el dueño puede aprobar o rechazar.
drop policy if exists "el dueno revisa" on public.solicitudes_apoyo;
create policy "el dueno revisa" on public.solicitudes_apoyo
  for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'chongdaniel91@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'chongdaniel91@gmail.com');
