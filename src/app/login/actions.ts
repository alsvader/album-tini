'use server'

/**
 * Acceso y registro como Server Actions.
 *
 * Van en servidor y no en el cliente por tres motivos: el formulario funciona
 * sin JavaScript, las credenciales nunca pasan por el estado de React, y la
 * cookie de sesión la escribe el servidor, que es quien puede hacerlo.
 */

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error: string } | null

/** Sólo rutas internas: evita convertir `next` en un redirector abierto. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/mis-albumes'
}

function readCredentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  return { email, password }
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData)

  if (!email || !password) return { error: 'Hacen falta el correo y la contraseña.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Sin distinguir «no existe» de «contraseña incorrecta»: decirlo permitiría
    // averiguar qué correos están registrados.
    return { error: 'No hemos podido entrar. Revisa el correo y la contraseña.' }
  }

  revalidatePath('/', 'layout')
  redirect(safeNext(formData.get('next')))
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData)

  if (!email) return { error: 'Hace falta un correo.' }
  if (password.length < 8) return { error: 'La contraseña necesita al menos 8 caracteres.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }

  // Sin confirmación por email, `signUp` ya devuelve sesión. Si algún día se
  // activa la confirmación, aquí no habría sesión y habría que avisar de que
  // revise el correo en lugar de seguir.
  if (!data.session) {
    return { error: 'Cuenta creada. Confirma tu correo para poder entrar.' }
  }

  revalidatePath('/', 'layout')
  redirect(safeNext(formData.get('next')))
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
