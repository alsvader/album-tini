-- Creación de un álbum completo en una sola transacción.
--
-- El SDK de Supabase no expone transacciones, así que con inserciones sueltas
-- desde el cliente un fallo a mitad dejaría un álbum publicado SIN fotos, y en
-- esta versión no hay edición para arreglarlo. Aquí es todo o nada.
--
-- `security invoker` a propósito: la función corre con los permisos de quien la
-- llama. El Server Action usa el cliente por cookie del usuario (nunca la
-- service-role key), así que `auth.uid()` y las políticas de RLS siguen
-- aplicando dentro. Con `security definer` se saltarían y las políticas dejarían
-- de proteger nada.

create or replace function public.create_published_album(
  p_album_id uuid,
  p_title    text,
  p_subtitle text,
  p_closing  text,
  p_photos   jsonb   -- [{ storage_path, caption, taken_label }]
) returns text        -- el slug generado
language plpgsql
security invoker
-- `search_path` fijado por seguridad: sin esto, un `search_path` manipulado
-- podría redirigir las tablas de la función. `extensions` va incluido porque en
-- Supabase pgcrypto vive ahí, no en `public`, y `gen_random_bytes` no se
-- resolvería (el fallo no es evidente: la función simplemente revienta al
-- generar el slug).
set search_path = public, extensions
as $$
declare
  v_uid    uuid := auth.uid();
  v_slug   text;
  v_base   text;
  v_count  int;
  v_photo  jsonb;
  v_index  int := 0;
  v_prefix text;
begin
  if v_uid is null then
    raise exception 'Hay que iniciar sesión para crear un álbum'
      using errcode = 'insufficient_privilege';
  end if;

  v_count := coalesce(jsonb_array_length(p_photos), 0);

  if v_count = 0 then
    raise exception 'El álbum necesita al menos una foto' using errcode = 'check_violation';
  end if;

  -- Mismo tope que valida el cliente. `DesktopBook` monta todas las hojas a la
  -- vez, así que el coste crece de forma lineal con el número de fotos.
  if v_count > 24 then
    raise exception 'Máximo 24 fotos por álbum' using errcode = 'check_violation';
  end if;

  -- Slug legible a partir del título más un sufijo aleatorio que lo hace no
  -- adivinable. Se recorta el título para que la URL no sea interminable.
  v_base := lower(btrim(p_title));
  v_base := translate(v_base, 'áàäâãéèëêíìïîóòöôõúùüûñç', 'aaaaaeeeeiiiiooooouuuunc');
  v_base := regexp_replace(v_base, '[^a-z0-9]+', '-', 'g');
  v_base := btrim(regexp_replace(v_base, '-+', '-', 'g'), '-');
  v_base := nullif(left(v_base, 40), '');

  v_slug := concat_ws('-', coalesce(v_base, 'album'), encode(extensions.gen_random_bytes(4), 'hex'));

  insert into public.albums (id, owner_id, slug, title, subtitle, closing_text, published_at)
  values (
    p_album_id,
    v_uid,
    v_slug,
    btrim(p_title),
    nullif(btrim(coalesce(p_subtitle, '')), ''),
    nullif(btrim(coalesce(p_closing, '')), ''),
    now()
  );

  for v_photo in select * from jsonb_array_elements(p_photos)
  loop
    v_prefix := v_uid::text || '/' || p_album_id::text || '/';

    -- Se repite aquí la comprobación que ya hace el Server Action: las subidas
    -- van directas del navegador a Storage, así que las rutas llegan como
    -- entrada del usuario. Sin esto, un cliente manipulado podría registrar en
    -- su álbum ficheros de otra persona.
    if (v_photo ->> 'storage_path') is null
       or left(v_photo ->> 'storage_path', length(v_prefix)) <> v_prefix then
      raise exception 'Ruta de foto no válida: %', v_photo ->> 'storage_path'
        using errcode = 'check_violation';
    end if;

    insert into public.album_photos (album_id, storage_path, caption, taken_label, position)
    values (
      p_album_id,
      v_photo ->> 'storage_path',
      btrim(v_photo ->> 'caption'),
      nullif(btrim(coalesce(v_photo ->> 'taken_label', '')), ''),
      v_index
    );

    v_index := v_index + 1;
  end loop;

  return v_slug;
end;
$$;

revoke all on function public.create_published_album(uuid, text, text, text, jsonb) from public;
grant execute on function public.create_published_album(uuid, text, text, text, jsonb) to authenticated;
