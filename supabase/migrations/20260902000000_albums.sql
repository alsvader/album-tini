-- Álbumes de usuario: tablas, RLS, bucket de Storage y la función de creación.
--
-- Modelo de visibilidad: un álbum publicado lo puede leer cualquiera que tenga
-- el enlace; escribir sólo su dueño. El slug lleva un sufijo aleatorio, así que
-- no se puede adivinar.

-- ---------------------------------------------------------------- tablas ----

create table public.albums (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  slug         text not null unique,
  title        text not null check (length(btrim(title)) between 1 and 80),
  subtitle     text check (length(subtitle) <= 120),
  closing_text text check (length(closing_text) <= 120),
  -- null = borrador. Es lo que leen las políticas de lectura pública.
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

create index albums_owner_created_idx on public.albums (owner_id, created_at desc);

create table public.album_photos (
  id           uuid primary key default gen_random_uuid(),
  album_id     uuid not null references public.albums (id) on delete cascade,
  storage_path text not null,
  caption      text not null check (length(btrim(caption)) between 1 and 60),
  -- El `date` del modelo actual: una etiqueta libre tipo "Marzo".
  taken_label  text check (length(taken_label) <= 24),
  position     int  not null,
  created_at   timestamptz not null default now()
);

-- Índice y no restricción única: en v1 no hay reordenación, y `unique` obligaría
-- a constraints diferidos en cuanto se añada.
create index album_photos_album_position_idx on public.album_photos (album_id, position);

-- ------------------------------------------------------------------- RLS ----

alter table public.albums       enable row level security;
alter table public.album_photos enable row level security;

-- Las dos políticas de lectura se suman: cualquiera ve lo publicado, y el dueño
-- ve además sus borradores.
create policy "albums publicados los lee cualquiera"
  on public.albums for select
  using (published_at is not null);

create policy "el dueño lee sus albums"
  on public.albums for select
  to authenticated
  using (owner_id = auth.uid());

create policy "el dueño crea albums"
  on public.albums for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "el dueño actualiza sus albums"
  on public.albums for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "el dueño borra sus albums"
  on public.albums for delete
  to authenticated
  using (owner_id = auth.uid());

-- En las fotos la comprobación va por el álbum padre.
create policy "fotos de albums publicados las lee cualquiera"
  on public.album_photos for select
  using (
    exists (
      select 1 from public.albums a
      where a.id = album_id and a.published_at is not null
    )
  );

create policy "el dueño lee las fotos de sus albums"
  on public.album_photos for select
  to authenticated
  using (
    exists (
      select 1 from public.albums a
      where a.id = album_id and a.owner_id = auth.uid()
    )
  );

create policy "el dueño añade fotos a sus albums"
  on public.album_photos for insert
  to authenticated
  with check (
    exists (
      select 1 from public.albums a
      where a.id = album_id and a.owner_id = auth.uid()
    )
  );

create policy "el dueño borra fotos de sus albums"
  on public.album_photos for delete
  to authenticated
  using (
    exists (
      select 1 from public.albums a
      where a.id = album_id and a.owner_id = auth.uid()
    )
  );

-- --------------------------------------------------------------- storage ----

-- Bucket público: la página del álbum renderiza <img> directo, sin URLs
-- firmadas que caduquen. Coherente con «público con el enlace». Las rutas son
-- {owner_id}/{album_id}/{photo_id}.webp, tres UUID, así que no se adivinan.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'album-photos',
  'album-photos',
  true,
  5 * 1024 * 1024,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- Escritura sólo dentro de la carpeta propia: la primera carpeta de la ruta
-- tiene que ser el uid de quien sube.
create policy "sube a su propia carpeta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'album-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "borra de su propia carpeta"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'album-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "las fotos son de lectura publica"
  on storage.objects for select
  using (bucket_id = 'album-photos');
