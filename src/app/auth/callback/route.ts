/**
 * Punto de retorno del intercambio de código de Supabase.
 *
 * **Inerte en esta versión**: con la confirmación por email desactivada y sin
 * proveedores sociales activos, nada navega aquí todavía. Existe porque es la
 * URL de retorno que exige OAuth, y tenerla escrita es lo que permite activar
 * Facebook con sólo configuración: el `redirectTo` de
 * `signInWithOAuth` apuntará aquí sin tocar código.
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
