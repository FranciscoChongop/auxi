-- Auxi: seguridad de administración, monedas y borrado de cuenta.
-- Pégalo COMPLETO en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
-- No borra datos: conserva las monedas, cupos, pase libre y protectores que cada persona ya tiene.
--
-- Qué hace:
--   1) Administración por lista en el servidor (no por correo en la sesión).
--   2) Billetera en el servidor: nadie puede escribirse monedas ni comprar sin tenerlas.
--      Ganar tiene topes diarios; el cofre se sortea en el servidor con las probabilidades publicadas.
--   3) «Borrar mi cuenta»: la persona puede borrar su cuenta y todo lo que depende de ella.
--
-- Reversión (si algo saliera mal): supabase/migraciones/2026-11-23-seguridad-revertir.sql

-------------------------------------------------------------------------------
-- 1) ADMINISTRACIÓN POR LISTA
-------------------------------------------------------------------------------
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  creado timestamptz not null default now()
);
alter table public.administradores enable row level security;
revoke all on public.administradores from anon, authenticated;

-- El dueño actual pasa a la lista (si ya tiene cuenta).
insert into public.administradores (user_id)
select id from auth.users where lower(email) = 'chongdaniel91@gmail.com'
on conflict do nothing;

create or replace function public.es_administrador()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.administradores where user_id = auth.uid());
$$;
revoke all on function public.es_administrador() from public, anon;
grant execute on function public.es_administrador() to authenticated;

drop policy if exists "ver mis solicitudes" on public.solicitudes_apoyo;
create policy "ver mis solicitudes" on public.solicitudes_apoyo
  for select to authenticated
  using ((select auth.uid()) = user_id or (select public.es_administrador()));

drop policy if exists "el dueno revisa" on public.solicitudes_apoyo;
create policy "el dueno revisa" on public.solicitudes_apoyo
  for update to authenticated
  using ((select public.es_administrador()))
  with check ((select public.es_administrador()));

-- Al revisar solo se puede cambiar estado, nota y fecha de revisión.
alter table public.solicitudes_apoyo add column if not exists reclamado boolean not null default false;
revoke update on public.solicitudes_apoyo from authenticated;
grant update (estado, nota, revisado) on public.solicitudes_apoyo to authenticated;

-------------------------------------------------------------------------------
-- 2) BILLETERA EN EL SERVIDOR
-------------------------------------------------------------------------------
create table if not exists public.billeteras (
  user_id uuid primary key references auth.users (id) on delete cascade,
  monedas integer not null default 0 check (monedas >= 0),
  cupo_extra integer not null default 0 check (cupo_extra >= 0),
  pase_por_vida boolean not null default false,
  protectores integer not null default 1 check (protectores >= 0),
  cofre_dia date,
  actualizado timestamptz not null default now()
);

create table if not exists public.movimientos_monedas (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  motivo text not null,
  cantidad integer not null,
  dia date not null default ((now() at time zone 'America/Lima')::date),
  clave text not null,
  creado timestamptz not null default now(),
  unique (user_id, clave)
);
create index if not exists movimientos_monedas_por_dia on public.movimientos_monedas (user_id, motivo, dia);

alter table public.billeteras enable row level security;
alter table public.movimientos_monedas enable row level security;
revoke all on public.billeteras from anon, authenticated;
revoke all on public.movimientos_monedas from anon, authenticated;
grant select on public.billeteras to authenticated;
grant select on public.movimientos_monedas to authenticated;

drop policy if exists "ver mi billetera" on public.billeteras;
create policy "ver mi billetera" on public.billeteras for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "ver mis movimientos" on public.movimientos_monedas;
create policy "ver mis movimientos" on public.movimientos_monedas for select to authenticated using ((select auth.uid()) = user_id);

-- Foto inicial: se conserva lo que cada persona ya tenía guardado (solo la primera vez).
insert into public.billeteras (user_id, monedas, cupo_extra, pase_por_vida, protectores)
select
  p.id,
  greatest(0, coalesce(case when jsonb_typeof(p.estado->'monedas') = 'number' then (p.estado->>'monedas')::numeric::int end, 0)),
  greatest(0, coalesce(case when jsonb_typeof(p.estado->'cupoExtra') = 'number' then (p.estado->>'cupoExtra')::numeric::int end, 0)),
  coalesce((p.estado->>'pasePorVida')::boolean, false),
  greatest(0, coalesce(case when jsonb_typeof(p.estado->'racha'->'protectores') = 'number' then (p.estado->'racha'->>'protectores')::numeric::int end, 1))
from public.perfiles p
on conflict (user_id) do nothing;

-- Premios del pase libre ya entregados antes de esta versión: no se vuelven a entregar.
update public.solicitudes_apoyo s set reclamado = true
from public.perfiles p
where p.id = s.user_id and s.estado = 'aprobada' and p.estado->>'apoyoReclamado' = s.id::text and not s.reclamado;

create or replace function public.billetera_json(b public.billeteras)
returns jsonb language sql immutable as $$
  select jsonb_build_object('monedas', b.monedas, 'cupo_extra', b.cupo_extra, 'pase_por_vida', b.pase_por_vida,
                            'protectores', b.protectores, 'cofre_dia', b.cofre_dia);
$$;

-- Asegura la billetera de quien llama y la devuelve bloqueada para cambiarla.
create or replace function public.mi_billetera_para_cambiar()
returns public.billeteras language plpgsql security definer set search_path = public as $$
declare b public.billeteras; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sin sesión' using errcode = '42501'; end if;
  insert into public.billeteras (user_id) values (uid) on conflict do nothing;
  select * into b from public.billeteras where user_id = uid for update;
  return b;
end $$;
revoke all on function public.mi_billetera_para_cambiar() from public, anon, authenticated;

create or replace function public.mi_billetera()
returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.billeteras;
begin
  b := public.mi_billetera_para_cambiar();
  return public.billetera_json(b);
end $$;
revoke all on function public.mi_billetera() from public, anon;
grant execute on function public.mi_billetera() to authenticated;

-- Ganar monedas: el servidor decide cuánto y pone topes por día. «clave» evita sumar dos veces lo mismo.
create or replace function public.ganar_monedas(motivo text, valor integer, clave text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  b public.billeteras;
  uid uuid := auth.uid();
  hoy date := (now() at time zone 'America/Lima')::date;
  cantidad integer;
  tope integer;
  hechos integer;
begin
  b := public.mi_billetera_para_cambiar();
  if length(coalesce(clave, '')) not between 1 and 120 then raise exception 'Clave inválida' using errcode = '22023'; end if;
  if exists (select 1 from public.movimientos_monedas m where m.user_id = uid and m.clave = ganar_monedas.clave) then
    return public.billetera_json(b);
  end if;

  if motivo = 'leccion' then
    cantidad := 10 + case when coalesce(valor, 0) >= 90 then 5 else 0 end; tope := 30;
  elsif motivo = 'tomate' then
    cantidad := 5; tope := 3;
  elsif motivo = 'explica' then
    cantidad := 2 * least(3, greatest(1, coalesce(valor, 1))); tope := 5;
  elsif motivo = 'mision:compartir' then cantidad := 20; tope := null;
  elsif motivo = 'mision:invitar' then cantidad := 40; tope := null;
  elsif motivo = 'mision:opinar' then cantidad := 30; tope := null;
  else
    raise exception 'Motivo no permitido' using errcode = '22023';
  end if;

  if motivo like 'mision:%' then
    -- Cada misión paga una sola vez.
    if exists (select 1 from public.movimientos_monedas m where m.user_id = uid and m.motivo = ganar_monedas.motivo) then
      return public.billetera_json(b);
    end if;
  else
    select count(*) into hechos from public.movimientos_monedas m where m.user_id = uid and m.motivo = ganar_monedas.motivo and m.dia = hoy;
    if hechos >= tope then return public.billetera_json(b); end if;
  end if;

  insert into public.movimientos_monedas (user_id, motivo, cantidad, clave) values (uid, motivo, cantidad, clave);
  update public.billeteras set monedas = monedas + cantidad, actualizado = now() where user_id = uid returning * into b;
  return public.billetera_json(b);
end $$;
revoke all on function public.ganar_monedas(text, integer, text) from public, anon;
grant execute on function public.ganar_monedas(text, integer, text) to authenticated;

-- Comprar: precios en el servidor; solo descuenta si alcanza.
create or replace function public.comprar_con_monedas(item text, clave text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.billeteras; uid uuid := auth.uid(); precio integer;
begin
  b := public.mi_billetera_para_cambiar();
  if exists (select 1 from public.movimientos_monedas m where m.user_id = uid and m.clave = comprar_con_monedas.clave) then
    return jsonb_build_object('ok', true, 'billetera', public.billetera_json(b));
  end if;
  precio := case item when 'cupo' then 60 when 'pase' then 500 when 'protector' then 50 else null end;
  if precio is null then raise exception 'Producto no permitido' using errcode = '22023'; end if;
  if item = 'pase' and b.pase_por_vida then
    return jsonb_build_object('ok', true, 'billetera', public.billetera_json(b));
  end if;
  if b.monedas < precio then
    return jsonb_build_object('ok', false, 'faltan', precio - b.monedas, 'billetera', public.billetera_json(b));
  end if;
  insert into public.movimientos_monedas (user_id, motivo, cantidad, clave) values (uid, 'compra:' || item, -precio, clave);
  update public.billeteras set
    monedas = monedas - precio,
    cupo_extra = cupo_extra + case when item = 'cupo' then 1 else 0 end,
    pase_por_vida = pase_por_vida or item = 'pase',
    protectores = protectores + case when item = 'protector' then 1 else 0 end,
    actualizado = now()
  where user_id = uid returning * into b;
  return jsonb_build_object('ok', true, 'billetera', public.billetera_json(b));
end $$;
revoke all on function public.comprar_con_monedas(text, text) from public, anon;
grant execute on function public.comprar_con_monedas(text, text) to authenticated;

-- Cofre del día: una vez por día (hora de Perú), sorteo en el servidor con las probabilidades publicadas:
-- 10 monedas 50 % · 20 monedas 30 % · 1 protector 15 % · 50 monedas 5 %.
create or replace function public.abrir_cofre()
returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.billeteras; uid uuid := auth.uid(); hoy date := (now() at time zone 'America/Lima')::date; r double precision; premio text; mon integer := 0; prot integer := 0;
begin
  b := public.mi_billetera_para_cambiar();
  if b.cofre_dia = hoy then
    return jsonb_build_object('ok', false, 'billetera', public.billetera_json(b));
  end if;
  r := random() * 100;
  if r < 50 then premio := 'm10'; mon := 10;
  elsif r < 80 then premio := 'm20'; mon := 20;
  elsif r < 95 then premio := 'p1'; prot := 1;
  else premio := 'm50'; mon := 50;
  end if;
  insert into public.movimientos_monedas (user_id, motivo, cantidad, clave) values (uid, 'cofre:' || premio, mon, 'cofre-' || hoy::text);
  update public.billeteras set monedas = monedas + mon, protectores = protectores + prot, cofre_dia = hoy, actualizado = now()
  where user_id = uid returning * into b;
  return jsonb_build_object('ok', true, 'premio', premio, 'billetera', public.billetera_json(b));
end $$;
revoke all on function public.abrir_cofre() from public, anon;
grant execute on function public.abrir_cofre() to authenticated;

-- Usar un protector de racha (solo puede bajar el saldo de quien lo usa).
create or replace function public.usar_protector(clave text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.billeteras; uid uuid := auth.uid();
begin
  b := public.mi_billetera_para_cambiar();
  if b.protectores > 0 and not exists (select 1 from public.movimientos_monedas m where m.user_id = uid and m.clave = usar_protector.clave) then
    insert into public.movimientos_monedas (user_id, motivo, cantidad, clave) values (uid, 'protector:usado', 0, clave);
    update public.billeteras set protectores = protectores - 1, actualizado = now() where user_id = uid returning * into b;
  end if;
  return public.billetera_json(b);
end $$;
revoke all on function public.usar_protector(text) from public, anon;
grant execute on function public.usar_protector(text) to authenticated;

-- Premio del pase libre: se entrega una sola vez, cuando la administración aprobó la solicitud.
create or replace function public.reclamar_apoyo()
returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.billeteras; uid uuid := auth.uid(); s public.solicitudes_apoyo;
begin
  b := public.mi_billetera_para_cambiar();
  select * into s from public.solicitudes_apoyo where user_id = uid and estado = 'aprobada' and not reclamado order by creado limit 1 for update;
  if not found then return jsonb_build_object('entregado', false, 'billetera', public.billetera_json(b)); end if;
  update public.solicitudes_apoyo set reclamado = true where id = s.id;
  insert into public.movimientos_monedas (user_id, motivo, cantidad, clave) values (uid, 'apoyo', 100, 'apoyo-' || s.id::text)
  on conflict (user_id, clave) do nothing;
  update public.billeteras set pase_por_vida = true, monedas = monedas + 100, actualizado = now() where user_id = uid returning * into b;
  return jsonb_build_object('entregado', true, 'solicitud', s.id, 'billetera', public.billetera_json(b));
end $$;
revoke all on function public.reclamar_apoyo() from public, anon;
grant execute on function public.reclamar_apoyo() to authenticated;

-- El avance guardado (perfiles.estado) siempre refleja la billetera real, y no deja importar
-- más temas de los permitidos (lo ya importado nunca se bloquea).
create or replace function public.perfil_respeta_billetera()
returns trigger language plpgsql security definer set search_path = public as $$
declare b public.billeteras; nuevos integer := 0; antes integer := 0;
begin
  insert into public.billeteras (user_id) values (new.id) on conflict do nothing;
  select * into b from public.billeteras where user_id = new.id;
  if jsonb_typeof(new.estado->'importados') = 'object' then
    select count(*) into nuevos from jsonb_object_keys(new.estado->'importados');
  end if;
  if tg_op = 'UPDATE' and jsonb_typeof(old.estado->'importados') = 'object' then
    select count(*) into antes from jsonb_object_keys(old.estado->'importados');
  end if;
  if not b.pase_por_vida and nuevos > 2 + b.cupo_extra and nuevos > antes then
    raise exception 'Sin cupo para más temas importados' using errcode = 'P0001';
  end if;
  new.estado := new.estado
    || jsonb_build_object('monedas', b.monedas, 'cupoExtra', b.cupo_extra, 'pasePorVida', b.pase_por_vida);
  if jsonb_typeof(new.estado->'racha') = 'object' then
    new.estado := jsonb_set(new.estado, '{racha,protectores}', to_jsonb(b.protectores));
  end if;
  if b.cofre_dia is not null then
    new.estado := new.estado || jsonb_build_object('cofreDia', b.cofre_dia::text);
  end if;
  return new;
end $$;
drop trigger if exists perfil_respeta_billetera on public.perfiles;
create trigger perfil_respeta_billetera before insert or update on public.perfiles
  for each row execute function public.perfil_respeta_billetera();

-------------------------------------------------------------------------------
-- 3) BORRAR MI CUENTA
-------------------------------------------------------------------------------
-- Borra la cuenta de quien llama. Por cascada se borran su avance, billetera, movimientos,
-- solicitudes y su lugar en administradores. Los PDF se borran antes desde la app.
create or replace function public.borrar_mi_cuenta()
returns void language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sin sesión' using errcode = '42501'; end if;
  delete from auth.users where id = uid;
end $$;
revoke all on function public.borrar_mi_cuenta() from public, anon;
grant execute on function public.borrar_mi_cuenta() to authenticated;
