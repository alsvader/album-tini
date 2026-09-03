/**
 * Cliente de Supabase para servidor: Server Components, Server Actions y route
 * handlers.
 *
 * Lee la sesión de las cookies, así que las consultas corren **como el usuario**
 * y las políticas de RLS siguen aplicando. No se usa la service-role key en
 * ningún punto: si se usara, RLS quedaría anulado y las políticas dejarían de
 * proteger nada.
 */

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

export async function createClient() {
  // En Next 16 `cookies()` es asíncrono.
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Un Server Component no puede escribir cookies. No es un error: el
          // middleware es quien refresca la sesión en cada navegación.
        }
      },
    },
  })
}

/** Usuario actual, o `null`. Atajo para los componentes de servidor. */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
