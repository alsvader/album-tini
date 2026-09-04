/**
 * Punto de retorno del intercambio de código de Supabase.
 *
 * Es el `redirectTo` de `signInWithOAuth({ provider: 'google', ... })` en
 * `src/app/login/actions.ts`: genérico a propósito, no depende del proveedor,
 * así que activar otro proveedor social solo exige configuración.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  // Sólo destinos internos: `next` viene de la URL y no es de fiar.
  const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/mis-albumes'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=codigo-ausente`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=codigo-invalido`)
  }

  return NextResponse.redirect(`${origin}${destination}`)
}
