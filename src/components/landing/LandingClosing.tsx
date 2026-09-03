/**
 * Cierre: la última llamada a crear un álbum.
 *
 * Server component. El microcopy dice «solo necesitas un correo» y no «no
 * necesitas registrarte», que es lo que traía el diseño: `/crear` está en las
 * rutas protegidas de `src/proxy.ts` y exige cuenta con correo y contraseña.
 * Prometer lo contrario aquí sería mentir justo en el botón.
 */

import Link from 'next/link'
import { CLOSING_POLAROIDS } from '@/data/landing'
import { Doodle } from '../ui/Doodle'
import { Polaroid } from '../journal/Polaroid'
import { Reveal } from './Reveal'

export function LandingClosing() {
  return (
    <section
      id="crear"
      className="relative scroll-mt-24 overflow-hidden border-t border-soft-pink/15 py-32 sm:py-44"
      style={{
        background:
          'radial-gradient(circle at 50% 90%, rgba(255,36,228,0.3) 0%, rgba(138,0,106,0.4) 30%, rgba(41,0,35,0.8) 60%, #160019 90%)',
      }}
    >
      {/* Instantáneas que se salen del marco. */}
      {CLOSING_POLAROIDS.map((item) => (
        <div
          key={item.entry.id}
          aria-hidden="true"
          className={`pointer-events-none absolute hidden opacity-60 md:block ${item.place}`}
        >
          <Polaroid
            entry={item.entry}
            active
            typeCaption={false}
            entrance={false}
            className="shadow-polaroid"
          />
        </div>
      ))}

      <Reveal className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <Doodle
          name="heart"
          className="mx-auto mb-6 h-10 w-10 animate-bounce text-hot-pink"
        />

        <h2 className="mb-6 font-script text-6xl font-bold leading-tight text-paper text-glow-title sm:text-7xl lg:text-8xl">
          Tu diario te está esperando
        </h2>

        <p className="mx-auto mb-10 max-w-md text-base text-paper-lilac/80 sm:text-xl">
          Empieza con las fotos que ya tienes en el teléfono.
        </p>

        <Link
          href="/crear"
          className="inline-block rounded-full bg-hot-pink px-12 py-5 text-lg font-semibold text-deep shadow-neon-pink transition duration-300 hover:-translate-y-1 hover:brightness-110"
        >
          Crear mi álbum
        </Link>

        <p className="mt-6 text-xs font-light tracking-wide text-paper-lilac/45">
          Tarda menos de tres minutos · Solo necesitas un correo
        </p>
      </Reveal>
    </section>
  )
}
