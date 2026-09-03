/**
 * Consultas de álbumes y traducción de filas a lo que espera el diario.
 *
 * El tipo `JournalEntry` ya existía para el álbum de ejemplo y encaja tal cual,
 * así que la experiencia 3D y el libro DOM no saben si el contenido viene de un
 * arreglo estático o de la base de datos.
 */

import { createClient } from './supabase/server'
import { photoUrl } from './albumRules'
import type { JournalEntry } from '@/data/journal'
import type { AlbumData } from '@/data/spreads'

export type AlbumSummary = {
  id: string
  slug: string
  title: string
  photoCount: number
  createdAt: string
  published: boolean
}

/**
 * Álbum publicado por slug, listo para la experiencia.
 *
 * Devuelve `null` si no existe o si el visitante no puede verlo: las políticas
 * de RLS ya devuelven cero filas en ese caso, así que aquí no hay que repetir
 * la comprobación de permisos.
 */
export async function getAlbumBySlug(
  slug: string,
): Promise<{ album: AlbumData; photoUrls: string[]; isOwner: boolean } | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('albums')
    .select(
      'id, owner_id, title, subtitle, closing_text, album_photos(id, storage_path, caption, taken_label, position)',
    )
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null

  const photos = [...(data.album_photos ?? [])].sort((a, b) => a.position - b.position)
  if (photos.length === 0) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const entries: JournalEntry[] = photos.map((photo) => ({
    id: photo.id,
    photo: photoUrl(photo.storage_path),
    caption: photo.caption,
    // `rotation` y `doodles` se omiten a propósito: los derivan
    // `fallbackRotation` y `fallbackDoodles` a partir del id.
    date: photo.taken_label ?? undefined,
    alt: photo.caption,
  }))

  return {
    album: {
      entries,
      meta: {
        title: data.title,
        subtitle: data.subtitle ?? 'un lugar para guardar lo que no quiero olvidar',
        closing: data.closing_text ?? 'y la historia sigue…',
      },
    },
    photoUrls: entries.map((entry) => entry.photo),
    isOwner: user?.id === data.owner_id,
  }
}

export type EditablePhoto = {
  id: string
  url: string
  caption: string
  takenLabel: string | null
}

/**
 * Álbum listo para editar: solo lo devuelve si quien pide es el dueño.
 *
 * No reutiliza `getAlbumBySlug`: esa función sustituye `subtitle`/`closing`
 * ausentes por el texto de relleno de la landing, perfecto para mostrar pero
 * un desastre si un formulario lo precargara y el usuario lo guardara tal
 * cual. Como la edición no toca esos campos, ni falta traerlos.
 */
export async function getAlbumForEdit(
  slug: string,
): Promise<{ id: string; title: string; photos: EditablePhoto[] } | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('albums')
    .select('id, owner_id, title, album_photos(id, storage_path, caption, taken_label, position)')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data || data.owner_id !== user.id) return null

  const photos = [...(data.album_photos ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((photo) => ({
      id: photo.id,
      url: photoUrl(photo.storage_path),
      caption: photo.caption,
      takenLabel: photo.taken_label,
    }))

  return { id: data.id, title: data.title, photos }
}

/**
 * Álbumes del usuario en sesión, del más reciente al más antiguo.
 *
 * El filtro por `owner_id` es imprescindible y no una redundancia sobre RLS.
 * Las políticas de un mismo comando se combinan con OR, y sobre `albums` hay
 * dos de lectura: la del dueño y la pública de los álbumes publicados. Para un
 * usuario autenticado se cumple también la segunda, así que sin este filtro la
 * consulta devuelve los álbumes publicados de cualquiera.
 *
 * RLS es el suelo —nadie ve los borradores de otro—, no un sustituto de decir
 * en la consulta lo que se quiere consultar.
 */
export async function getMyAlbums(): Promise<AlbumSummary[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('albums')
    .select('id, slug, title, created_at, published_at, album_photos(count)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    photoCount: row.album_photos?.[0]?.count ?? 0,
    createdAt: row.created_at,
    published: row.published_at !== null,
  }))
}
