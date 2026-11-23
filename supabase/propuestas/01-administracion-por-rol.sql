-- PROPUESTA (NO EJECUTADA). Requiere aprobación de Daniel antes de correrla en Supabase → SQL Editor.
-- Objetivo: que el panel de revisión del pase libre no dependa del correo dentro de la sesión,
-- sino de una lista de administradores que solo se puede cambiar desde el panel de Supabase.
-- Es idempotente (se puede correr más de una vez) y no borra datos.
--
-- Después de correrla:
--   1) Agrega tu usuario:  insert into public.administradores (user_id) select id from auth.users where email = '<tu correo>';
--   2) Avísame para cambiar el código de la app (esDueno) a la nueva comprobación.
-- Reversión: vuelve a correr la sección 3) de supabase/esquema.sql (políticas por correo).

-- 1) Lista de administradores: nadie la puede leer ni cambiar desde la app.
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  creado timestamptz not null default now()
);
alter table public.administradores enable row level security;
revoke all on public.administradores from anon, authenticated;

-- 2) ¿La persona con sesión es administradora? (se evalúa en el servidor)
create or replace function public.es_administrador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.administradores where user_id = auth.uid());
$$;
revoke all on function public.es_administrador() from public, anon;
grant execute on function public.es_administrador() to authenticated;

-- 3) Las políticas de solicitudes usan la lista, no el correo.
drop policy if exists "ver mis solicitudes" on public.solicitudes_apoyo;
create policy "ver mis solicitudes" on public.solicitudes_apoyo
  for select to authenticated
  using ((select auth.uid()) = user_id or (select public.es_administrador()));

drop policy if exists "el dueno revisa" on public.solicitudes_apoyo;
create policy "el dueno revisa" on public.solicitudes_apoyo
  for update to authenticated
  using ((select public.es_administrador()))
  with check ((select public.es_administrador()));

-- 4) Al revisar, la administración solo puede cambiar estado, nota y fecha de revisión.
revoke update on public.solicitudes_apoyo from authenticated;
grant update (estado, nota, revisado) on public.solicitudes_apoyo to authenticated;
