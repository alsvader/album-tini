'use server'

/**
 * Guardar cambios de fotos y borrar el álbum.
 *
 * A diferencia de `create_published_album` (que sí necesitaba ser una función
 * SQL atómica, porque un fallo a mitad dejaba un álbum publicado sin fotos),
 * un fallo a mitad aquí deja el álbum en un estado recuperable: se reintenta
 * la edición. Por eso esto llama directamente a `insert`/`update`/`delete`
 * protegidos por RLS, en vez de envolverlo en una función nueva.
 */

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { PHOTOS_BUCKET } from '@/lib/supabase/env'
import { MAX_CAPTION, MAX_PHOTOS } from '@/lib/albumRules'

export type SavePhotoItem =
  | { kind: 'existing'; id: string; position: number; caption: string }
  | { kind: 'new'; storagePath: string; caption: string; takenLabel?: string; position: number }

export type SaveInput = {
  albumId: string
  subtitle?: string
  closing?: string
  items: SavePhotoItem[]
}

export type SaveResult = { ok: true } | { ok: false; error: string }

export async function saveAlbumPhotos(input: SaveInput): Promise<SaveResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Tu sesión ha caducado. Vuelve a entrar.' }

  const { data: album } = await supabase
    .from('albums')
    .select('id, owner_id')
    .eq('id', input.albumId)
    .maybeSingle()

  if (!album || album.owner_id !== user.id) {
    return { ok: false, error: 'No se encontró el álbum.' }
  }

  const items = Array.isArray(input.items) ? input.items : []
  if (items.length === 0) return { ok: false, error: 'El álbum necesita al menos una foto.' }
  if (items.length > MAX_PHOTOS) {
    return { ok: false, error: `Como máximo ${MAX_PHOTOS} fotos por álbum.` }
  }

  for (const [index, item] of items.entries()) {
    const caption = item.caption?.trim() ?? ''
    if (!caption) return { ok: false, error: `Falta la descripción de la foto ${index + 1}.` }
    if (caption.length > MAX_CAPTION) {
      return { ok: false, error: `La descripción de la foto ${index + 1} es demasiado larga.` }
    }
  }

  // Las rutas de Storage llegan como entrada del usuario, igual que en la
  // creación: la misma comprobación protege que un cliente manipulado
  // registre en este álbum ficheros de otra persona. Solo aplica a las fotos
  // nuevas: las existentes no traen `storagePath`.
  const prefix = `${user.id}/${input.albumId}/`
  const newItems = items.filter((item) => item.kind === 'new')

  for (const [index, photo] of newItems.entries()) {
    if (!photo.storagePath?.startsWith(prefix)) {
      return { ok: false, error: `La foto nueva ${index + 1} no pertenece a este álbum.` }
    }
  }

  // Va antes de tocar fotos porque es la escritura más barata y sin
  // dependencia de Storage: si falla, no se ha tocado nada más todavía.
  const subtitle = input.subtitle?.trim() || null
  const closing = input.closing?.trim() || null

  const { error: metaError } = await supabase
    .from('albums')
    .update({ subtitle, closing_text: closing })
    .eq('id', input.albumId)
    .eq('owner_id', user.id)

  if (metaError) {
    return { ok: false, error: 'No se pudo guardar el subtítulo ni el texto de cierre.' }
  }

  if (newItems.length > 0) {
    const { error } = await supabase.from('album_photos').insert(
      newItems.map((photo) => ({
        album_id: input.albumId,
        storage_path: photo.storagePath,
        caption: photo.caption.trim(),
        taken_label: photo.takenLabel?.trim() || null,
        position: photo.position,
      })),
    )
    if (error) return { ok: false, error: 'No se pudieron guardar las fotos nuevas.' }
  }

  const existingItems = items.filter((item) => item.kind === 'existing')

  for (const photo of existingItems) {
    const { error } = await supabase
      .from('album_photos')
      .update({ position: photo.position, caption: photo.caption.trim() })
      .eq('id', photo.id)
      .eq('album_id', input.albumId)

    if (error) return { ok: false, error: 'No se pudo guardar el nuevo orden ni las descripciones.' }
  }

  revalidatePath('/mis-albumes')

  return { ok: true }
}

export async function deleteAlbum(albumId: string): Promise<SaveResult | void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Tu sesión ha caducado. Vuelve a entrar.' }

  const { data: album } = await supabase
    .from('albums')
    .select('id, owner_id')
    .eq('id', albumId)
    .maybeSingle()

  if (!album || album.owner_id !== user.id) {
    return { ok: false, error: 'No se encontró el álbum.' }
  }

  // Borrar la fila de `albums` limpia `album_photos` sola (on delete cascade),
  // pero no los ficheros de Storage: no hay trigger que lo haga, así que se
  // borran a mano antes de que quede huérfano el `albumId`.
  const prefix = `${user.id}/${albumId}`
  const { data: files } = await supabase.storage.from(PHOTOS_BUCKET).list(prefix)

  if (files?.length) {
    await supabase.storage.from(PHOTOS_BUCKET).remove(files.map((file) => `${prefix}/${file.name}`))
  }

  const { error } = await supabase.from('albums').delete().eq('id', albumId).eq('owner_id', user.id)

  if (error) return { ok: false, error: 'No se pudo borrar el álbum.' }

  revalidatePath('/mis-albumes')
  redirect('/mis-albumes')
}
