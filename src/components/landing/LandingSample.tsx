/**
 * «Así se ve un recuerdo».
 *
 * Server component (antes tenía un `'use client'` que no usaba ningún hook).
 * Reutiliza el componente `Polaroid` en vez de una captura, así que lo que se
 * ve aquí es exactamente lo que el usuario va a obtener —incluida la textura
 * del papel y el brillo del revelado—. Por el mismo motivo la instantánea
 * grande es la primera entrada real del álbum de ejemplo y no una imagen
 * decorativa: es la Polaroid que aparece al abrir /demo.
 *
 * Las tres anotaciones son afirmaciones de producto, así que por debajo de `lg`
 * no desaparecen —el diseño las escondía con `hidden lg:flex`— sino que se
 * recolocan como lista debajo de la foto. Las flechas de puntos son SVG a mano:
 * `<Doodle name="arrowNext">` es una flecha recta en un viewBox cuadrado y
 * estirada a una curva larga saldría con el trazo deformado.
 */

import { MEMORY_BACKDROP, MEMORY_MAIN, MEMORY_NOTES } from '@/data/landing'
import { Polaroid } from '../journal/Polaroid'
import { Reveal } from './Reveal'
import { WashiTape } from './WashiTape'

/** Curva de puntos que va del texto a la foto. `flip` la dibuja al revés. */
function Pointer({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`h-8 w-16 shrink-0 text-soft-pink ${flip ? '-scale-x-100' : ''}`}
    >
      <path d="M0 8 Q35 8, 55 24" strokeDasharray="3 3" />
      <circle cx="58" cy="26" r="3" fill="currentColor" />
    </svg>
  )
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <span className="block">
      <span className="block text-xs font-semibold uppercase tracking-[0.3em] text-soft-pink">
        {title}
      </span>
      <span className="block text-xs font-light text-paper-lilac/60">{body}</span>
    </span>
  )
}

export function LandingSample() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-deep via-dark-violet/30 to-deep py-28 sm:py-36">
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-12 lg:px-16">
        <Reveal className="mx-auto mb-16 max-w-xl text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-soft-pink">
            Detalle artesanal
          </span>
          <h2 className="font-script text-5xl font-bold text-paper text-glow-title sm:text-6xl">
            Así se ve un recuerdo
          </h2>
        </Reveal>

        <Reveal className="relative flex items-center justify-center py-10">
          {/* Instantáneas de fondo, sólo cuando hay sitio de sobra. */}
          {MEMORY_BACKDROP.map((item) => (
            <div
              key={item.entry.id}
              aria-hidden="true"
              className={`pointer-events-none absolute opacity-30 ${item.place}`}
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

          {/* La protagonista. */}
          <div className="relative z-20 w-80 sm:w-96">
            <WashiTape className="absolute -top-3.5 left-1/2 z-30 h-6 w-28 -translate-x-1/2 rotate-1" />
            <Polaroid
              entry={MEMORY_MAIN}
              active
              priority
              typeCaption
              entrance={false}
              className="shadow-polaroid-lg"
            />
          </div>

          {/* Anotaciones ancladas a la foto, sólo en pantallas anchas. */}
          <div className="pointer-events-none absolute left-0 top-6 z-30 hidden items-center gap-3 lg:flex">
            <span className="text-right">
              <Note {...MEMORY_NOTES[0]!} />
            </span>
            <Pointer />
          </div>

          <div className="pointer-events-none absolute bottom-24 right-0 z-30 hidden items-center gap-3 lg:flex">
            <Pointer flip />
            <span className="text-left">
              <Note {...MEMORY_NOTES[1]!} />
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-2 left-4 z-30 hidden items-center gap-3 lg:flex">
            <span className="text-right">
              <Note {...MEMORY_NOTES[2]!} />
            </span>
            <Pointer />
          </div>
        </Reveal>

        {/* Las mismas tres notas, apiladas, para cuando no caben alrededor. */}
        <Reveal className="mt-12 lg:hidden">
          <ul className="mx-auto flex max-w-sm flex-col gap-5 text-center">
            {MEMORY_NOTES.map((note) => (
              <li key={note.title}>
                <Note {...note} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
