/**
 * Barra de las páginas con sesión: crear y listado.
 *
 * El cierre de sesión es un `<form>` contra un Server Action y no un botón con
 * `onClick`: así funciona sin JavaScript y es el servidor quien borra la cookie,
 * que es quien puede hacerlo.
 */

import Link from 'next/link'
import { signOut } from '@/app/login/actions'
import { Doodle } from '../ui/Doodle'

export function AppNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
      <Link href="/" className="flex items-center gap-2.5">
        <Doodle name="flower" className="h-6 w-6 text-hot-pink" />
        <span className="font-script text-xl text-paper">Álbum de Tini</span>
      </Link>

      <nav className="flex items-center gap-4 text-xs sm:text-sm">
        <Link
          href="/mis-albumes"
          className="text-soft-pink/80 transition-colors hover:text-hot-pink"
        >
          Mis álbumes
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="text-paper-lilac/50 transition-colors hover:text-soft-pink"
          >
            Salir
          </button>
        </form>
      </nav>
    </header>
  )
}
