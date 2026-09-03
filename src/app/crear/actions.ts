'use server'

/**
 * Publicación del álbum.
 *
 * Los bytes de las fotos NO pasan por aquí: van directos del navegador a
 * Storage, porque un Server Action es un único POST con límite de cuerpo y sin
 * progreso por archivo. Lo que llega aquí son sólo los metadatos, que es JSON
 * pequeño.
 *
 * Estar en servidor aporta dos cosas que desde el cliente no se pueden tener:
 * validación que no se puede esquivar, y `revalidatePath` para que el listado
 * de álbumes —un Server Component— no se quede mostrando datos viejos.
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { MAX_CAPTION, MAX_PHOTOS } from '@/lib/albumRules'

export type PublishPhoto = {
  storagePath: string
  caption: string
  takenLabel?: string
}

export type PublishInput = {
  albumId: string
  title: string
  subtitle?: string
  closing?: string
  photos: PublishPhoto[]
}

export type PublishResult = { ok: true; slug: string } | { ok: false; error: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function publishAlbum(input: PublishInput): Promise<PublishResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Tu sesión ha caducado. Vuelve a entrar.' }

  const title = input.title?.trim() ?? ''
  if (!title) return { ok: false, error: 'El álbum necesita un título.' }
  if (title.length > 80) return { ok: false, error: 'El título es demasiado largo.' }

  if (!UUID.test(input.albumId ?? '')) {
    return { ok: false, error: 'Identificador de álbum no válido.' }
  }

  const photos = Array.isArray(input.photos) ? input.photos : []
  if (photos.length === 0) return { ok: false, error: 'Añade al menos una foto.' }
  if (photos.length > MAX_PHOTOS) {
    return { ok: false, error: `Como máximo ${MAX_PHOTOS} fotos por álbum.` }
  }

  /*
   * Las rutas de Storage llegan como entrada del usuario, porque la subida la
   * hace el navegador. Sin esta comprobación, un cliente manipulado podría
   * registrar en su álbum ficheros de otra persona. La misma condición se
   * repite dentro de la función SQL: es la que de verdad protege la fila.
   */
  const prefix = `${user.id}/${input.albumId}/`

  for (const [index, photo] of photos.entries()) {
    if (!photo.storagePath?.startsWith(prefix)) {
      return { ok: false, error: `La foto ${index + 1} no pertenece a este álbum.` }
    }
    const caption = photo.caption?.trim() ?? ''
    if (!caption) return { ok: false, error: `Falta la descripción de la foto ${index + 1}.` }
    if (caption.length > MAX_CAPTION) {
      return { ok: false, error: `La descripción de la foto ${index + 1} es demasiado larga.` }
    }
  }

  const { data, error } = await supabase.rpc('create_published_album', {
    p_album_id: input.albumId,
    p_title: title,
    p_subtitle: input.subtitle?.trim() || null,
    p_closing: input.closing?.trim() || null,
    p_photos: photos.map((photo) => ({
      storage_path: photo.storagePath,
      caption: photo.caption.trim(),
      taken_label: photo.takenLabel?.trim() || null,
    })),
  })

  if (error || typeof data !== 'string') {
    return { ok: false, error: 'No hemos podido publicar el álbum. Inténtalo de nuevo.' }
  }

  // Sin esto, /mis-albumes seguiría sirviendo la versión cacheada sin el álbum
  // nuevo. Es el motivo principal de que esto sea un Server Action.
  revalidatePath('/mis-albumes')

  return { ok: true, slug: data }
}
