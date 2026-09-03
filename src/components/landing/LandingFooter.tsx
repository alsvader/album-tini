/**
 * Pie de la landing.
 *
 * Incluye los tres enlaces de sección además de los de acción, y eso no es
 * relleno: la barra superior los esconde por debajo de `md` y el diseño no trae
 * menú hamburguesa, así que sin repetirlos aquí «Cómo funciona», «Ejemplo» y
 * «Preguntas» quedarían inalcanzables en móvil salvo scrolleando a ciegas.
 */

import Link from 'next/link'
import { NAV_LINKS } from '@/data/landing'
import { Doodle } from '../ui/Doodle'

export function LandingFooter() {
  return (
    <footer className="relative border-t border-soft-pink/10 bg-deep px-6 py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
        <Doodle name="heart" className="h-8 w-8 text-hot-pink/70" />

        <p className="font-script text-2xl text-paper/90">
          Hecho para guardar lo que no se quiere olvidar.
        </p>

        <nav
          aria-label="Enlaces del pie"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-paper-lilac/60"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-soft-pink"
            >
              {link.label}
            </a>
          ))}
          <Link href="/demo" className="transition-colors hover:text-soft-pink">
            Ver el ejemplo
          </Link>
          <Link href="/crear" className="transition-colors hover:text-soft-pink">
            Crear un álbum
          </Link>
        </nav>

        <p className="mt-4 text-[0.68rem] uppercase tracking-[0.3em] text-paper-lilac/30">
          © Álbum de Tini — Todos los recuerdos reservados.
        </p>
      </div>
    </footer>
  )
}
