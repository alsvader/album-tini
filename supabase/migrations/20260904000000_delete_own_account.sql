-- Borrado de la propia cuenta: lo exige la política de privacidad (derecho a
-- que se borren los datos) sin exponer la service-role key al cliente.
--
-- `security definer` a propósito, al revés que `create_published_album`
-- (ver su docblock en 20260902000001_create_album_fn.sql): `auth.users` no
-- tiene ninguna policy de RLS que deje a `authenticated` borrar su propia
-- fila, así que hace falta correr con permisos elevados. El riesgo se cierra
-- igual que exige el checklist de seguridad de Supabase: la función no toma
-- parámetros —solo puede borrar `auth.uid()`, nunca a otro usuario— y el
-- `grant` de más abajo restringe la ejecución a `authenticated`.
--
-- `albums.owner_id` ya tiene `on delete cascade` hacia `auth.users`, así que
-- borrar esta fila se lleva por delante `albums` y, en cadena, `album_photos`.
-- Los ficheros de Storage no están en ese grafo de claves foráneas: los borra
-- el Server Action antes de llamar a esta función.
create function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = (select auth.uid());
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
