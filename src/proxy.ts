/**
 * Refresco de sesión y protección de rutas.
 *
 * Se llama `proxy` y no `middleware` porque Next 16 renombró la convención; el
 * nombre antiguo sigue funcionando pero avisa de deprecación en cada build.
 *
 * Dos trabajos, y el primero es fácil de pasar por alto: los tokens de Supabase
 * caducan, y un Server Component no puede escribir cookies. Si nadie los
 * refresca, la sesión se va cayendo sola. El middleware sí puede escribirlas, y
 * por eso es aquí donde se renuevan en cada navegación.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/** Rutas que exigen sesión. */
const PROTECTED = ['/crear', '/mis-albumes']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sin configuración no se puede validar nada; se deja pasar para que el
  // error salga en la página, con su mensaje, en lugar de aquí en silencio.
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // getUser() y no getSession(): valida el token contra el servidor en vez de
  // confiar en lo que traiga la cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && PROTECTED.some((route) => pathname.startsWith(route))) {
    const login = request.nextUrl.clone()
    login.pathname = '/login'
    // Para volver a donde iba una vez dentro.
    login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }

  if (user && pathname === '/login') {
    const home = request.nextUrl.clone()
    home.pathname = '/mis-albumes'
    home.search = ''
    return NextResponse.redirect(home)
  }

  return response
}

export const config = {
  // Se excluyen estáticos e imágenes: no tienen sesión que refrescar y cada
  // invocación costaría tiempo de ejecución.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|photos|.*\\.(?:png|jpg|jpeg|webp|svg|ico|mp3)$).*)'],
}
