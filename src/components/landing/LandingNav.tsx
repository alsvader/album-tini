/**
 * Barra superior de la landing.
 *
 * Recibe la sesión ya resuelta en servidor: así el enlace correcto sale en el
 * primer HTML y no hay un parpadeo de «Entrar» a «Mis álbumes».
 *
 * Pasa a `fixed` con el diseño nuevo, y eso tiene dos consecuencias que se
 * pagan fuera de este archivo: el hero necesita padding superior propio, y las
 * secciones con `id` necesitan `scroll-mt-*` para que su título no quede
 * debajo de la barra al pulsar un ancla.
 *
 * «Crear mi álbum» apunta siempre a `/crear`, con y sin sesión: `src/proxy.ts`
 * ya redirige a `/login?next=/crear` y vuelve al terminar. No hace falta
 * decidirlo aquí.
 */

import Link from 'next/link'
import { NAV_LINKS } from '@/data/landing'
import { Doodle } from '../ui/Doodle'

type Props = {
  signedIn: boolean
}

export function LandingNav({ signedIn }: Props) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-soft-pink/10 bg-deep/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <Link href="/" className="group flex items-center gap-3">
          <Doodle
            name="flower"
            className="h-7 w-7 text-hot-pink transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
          />
          <span className="font-script text-2xl text-paper sm:text-3xl">
            Álbum de Tini
          </span>
        </Link>

        <nav aria-label="Secciones" className="hidden items-center gap-8 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-paper-lilac/75 transition-colors duration-200 hover:text-soft-pink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={signedIn ? '/mis-albumes' : '/login'}
            className="rounded-full border border-soft-pink/35 px-4 py-2 text-xs tracking-wide text-paper-lilac/90 transition duration-200 hover:border-soft-pink/70 hover:bg-soft-pink/10 sm:px-5 sm:text-sm"
          >
            {signedIn ? 'Mis álbumes' : 'Entrar'}
          </Link>
          <Link
            href="/crear"
            className="hidden rounded-full bg-hot-pink px-5 py-2 text-sm font-medium text-deep shadow-neon-pink transition duration-200 hover:-translate-y-0.5 hover:brightness-110 sm:block"
          >
            Crear mi álbum
          </Link>
        </div>
      </div>
    </header>
  )
}
