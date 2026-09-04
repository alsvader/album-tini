'use server'

/**
 * Borrar la cuenta propia y todo lo que le pertenece.
 *
 * `delete_own_account` (SQL, security definer) borra la fila de `auth.users`;
 * el `on delete cascade` de `albums.owner_id` se lleva por delante álbumes y
 * fotos. Los ficheros de Storage no están en ese grafo de claves foráneas, así
 * que se limpian a mano antes, con el mismo criterio que ya usa `deleteAlbum`
 * en `mis-albumes/[slug]/editar/actions.ts`.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PHOTOS_BUCKET } from '@/lib/supabase/env'
import { getMyAlbums } from '@/lib/albums'

export type DeleteAccountResult = { ok: true } | { ok: false; error: string }

export async function deleteAccount(): Promise<DeleteAccountResult | void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Tu sesión ha caducado. Vuelve a entrar.' }

  const albums = await getMyAlbums()

  for (const album of albums) {
    const prefix = `${user.id}/${album.id}`
    const { data: files } = await supabase.storage.from(PHOTOS_BUCKET).list(prefix)

    if (files?.length) {
      await supabase.storage.from(PHOTOS_BUCKET).remove(files.map((file) => `${prefix}/${file.name}`))
    }
  }

  const { error } = await supabase.rpc('delete_own_account')

  if (error) return { ok: false, error: 'No se pudo eliminar la cuenta.' }

  await supabase.auth.signOut()
  redirect('/')
}
