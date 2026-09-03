-- Permite editar un álbum: falta la política de `update` sobre `album_photos`.
--
-- En v1 nada actualizaba una fila de foto (solo se insertaban al crear), así
-- que no existía. Reordenar fotos necesita `UPDATE ... SET position = ...`, y
-- sin esta política RLS lo bloquea aunque el dueño sea quien lo pide.

create policy "el dueño actualiza fotos de sus albums"
  on public.album_photos for update
  to authenticated
  using (
    exists (
      select 1 from public.albums a
      where a.id = album_id and a.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.albums a
      where a.id = album_id and a.owner_id = auth.uid()
    )
  );
