-- Auxi Vida en la cuenta: guarda los datos de Vida de cada persona para seguir en otro equipo.
-- Pégalo completo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
-- Mientras no se corra, Vida sigue funcionando solo en el equipo, como antes.

create table if not exists public.vida_datos (
  user_id uuid primary key references auth.users (id) on delete cascade,
  estado jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

alter table public.vida_datos enable row level security;

-- Solo personas con sesión, y cada una solo lo suyo. Los visitantes anónimos no tienen acceso.
revoke all on public.vida_datos from anon;
grant select, insert, update, delete on public.vida_datos to authenticated;

drop policy if exists "ver mi vida" on public.vida_datos;
create policy "ver mi vida" on public.vida_datos
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "crear mi vida" on public.vida_datos;
create policy "crear mi vida" on public.vida_datos
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "cambiar mi vida" on public.vida_datos;
create policy "cambiar mi vida" on public.vida_datos
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "borrar mi vida" on public.vida_datos;
create policy "borrar mi vida" on public.vida_datos
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Límite de tamaño para que nadie llene la base (1 MB por persona sobra para años de movimientos).
alter table public.vida_datos drop constraint if exists vida_datos_tamano;
alter table public.vida_datos add constraint vida_datos_tamano check (pg_column_size(estado) < 1048576);

-- Al borrar la cuenta (borrar_mi_cuenta), esta fila se borra sola por la cascada de auth.users.
