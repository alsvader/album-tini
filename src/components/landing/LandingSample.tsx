'use client'

/**
 * Muestra visual: dos Polaroids reales del álbum de ejemplo.
 *
 * Reutiliza el componente `Polaroid` en vez de una captura, así que lo que se
 * ve en la landing es exactamente lo que el usuario va a obtener —incluida la
 * animación de entrada y el caption escrito a mano—.
 */

import Link from 'next/link'
import { journalEntries } from '@/data/journal'
import { ASSETS } from '@/lib/assets'
import { Polaroid } from '../journal/Polaroid'

const SAMPLE = journalEntries.slice(0, 2)

export function LandingSample() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      {/* Retazo de papel del diario, para que la muestra se lea sobre página. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[70%] -translate-y-1/2 opacity-[0.07]"
        style={{
          backgroundImage: `url(${ASSETS.journal.insidePage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="font-script text-[clamp(2rem,5vw,3.2rem)] text-paper">
          Así se ve un recuerdo
        </h2>
        <p className="mx-auto mt-5 max-w-[44ch] text-balance-tight text-sm leading-relaxed text-paper-lilac/65">
          Cada foto se coloca sobre la página como una instantánea de verdad, con
          su nota escribiéndose sola.
        </p>

        <div className="mt-14 flex flex-wrap items-start justify-center gap-8 sm:gap-14">
          {SAMPLE.map((entry) => (
            <div key={entry.id} className="w-[min(72vw,17rem)]">
              {/* typeCaption en false: son decorativas. Con el typewriter
                  activo marcaban estas entradas como «ya escritas» en el store
                  global, y al entrar luego al diario sus captions aparecían
                  completos en vez de escribiéndose. */}
              <Polaroid entry={entry} active priority typeCaption={false} />
            </div>
          ))}
        </div>

        <Link
          href="/demo"
          className="mt-14 inline-block text-sm tracking-wide text-soft-pink underline decoration-soft-pink/30 underline-offset-8 transition-colors hover:text-hot-pink"
        >
          Abrir el diario de ejemplo
        </Link>
      </div>
    </section>
  )
}
