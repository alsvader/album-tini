'use client'

/**
 * Cliente de Supabase para el navegador.
 *
 * Se usa sólo donde el trabajo tiene que ocurrir en el cliente: la subida de
 * archivos a Storage, que va directa desde el navegador para poder informar del
 * progreso y no pasar los binarios por el servidor de Next. Las mutaciones de
 * datos van por Server Actions (ver lib/supabase/server.ts).
 */

import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
