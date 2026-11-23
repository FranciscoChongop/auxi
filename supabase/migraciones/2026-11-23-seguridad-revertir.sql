-- Deshace supabase/migraciones/2026-11-23-seguridad.sql SIN borrar datos.
-- Úsalo solo si algo salió mal. Las tablas billeteras, movimientos_monedas y administradores se conservan
-- (para no perder historial); la app vuelve a manejar las monedas en el navegador como antes.

drop trigger if exists perfil_respeta_billetera on public.perfiles;
drop function if exists public.perfil_respeta_billetera();
drop function if exists public.ganar_monedas(text, integer, text);
drop function if exists public.comprar_con_monedas(text, text);
drop function if exists public.abrir_cofre();
drop function if exists public.usar_protector(text);
drop function if exists public.reclamar_apoyo();
drop function if exists public.mi_billetera();
drop function if exists public.borrar_mi_cuenta();

-- Políticas del panel por correo (como en supabase/esquema.sql).
drop policy if exists "ver mis solicitudes" on public.solicitudes_apoyo;
create policy "ver mis solicitudes" on public.solicitudes_apoyo
  for select to authenticated
  using ((select auth.uid()) = user_id or (select auth.jwt() ->> 'email') = 'chongdaniel91@gmail.com');

drop policy if exists "el dueno revisa" on public.solicitudes_apoyo;
create policy "el dueno revisa" on public.solicitudes_apoyo
  for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'chongdaniel91@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'chongdaniel91@gmail.com');

grant update on public.solicitudes_apoyo to authenticated;
drop function if exists public.es_administrador();
