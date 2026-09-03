/**
 * Barra superior de las páginas con scroll.
 *
 * Recibe la sesión ya resuelta en servidor: así el enlace correcto sale en el
 * primer HTML y no hay un parpadeo de «Entrar» a «Mis álbumes».
 */

import Link from 'next/link'
import { Doodle } from '../ui/Doodle'

type Props = {
  signedIn: boolean
}

export function LandingNav({ signedIn }: Props) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
      <Link href="/" className="flex items-center gap-2.5">
        <Doodle name="flower" className="h-6 w-6 text-hot-pink" />
        <span className="font-script text-xl text-paper">Álbum de Tini</span>
      </Link>

      <nav className="flex items-center gap-2 sm:gap-4">
        {signedIn ? (
          <Link
            href="/mis-albumes"
            className="rounded-full border border-soft-pink/30 px-4 py-2 text-xs tracking-wide text-soft-pink transition-colors hover:border-hot-pink/70 hover:text-hot-pink sm:px-5 sm:text-sm"
          >
            Mis álbumes
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-full border border-soft-pink/30 px-4 py-2 text-xs tracking-wide text-soft-pink transition-colors hover:border-hot-pink/70 hover:text-hot-pink sm:px-5 sm:text-sm"
          >
            Entrar
          </Link>
        )}
      </nav>
    </header>
  )
}
