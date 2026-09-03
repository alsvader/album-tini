/**
 * «Se abre, se pasa, se cierra»: la sección que enseña el objeto.
 *
 * Server component. El pliego abierto de la derecha no es una captura ni un
 * render: se compone con la página interior real del pack y una `<Polaroid>` de
 * verdad encima, así que lo que se ve aquí es literalmente el material del
 * diario. El diseño de Stitch traía en su lugar una imagen generada del libro;
 * usarla habría sido enseñar un producto que no existe.
 */

import Link from 'next/link'
import { JOURNAL_FEATURES, JOURNAL_MINI, MEMORY_MAIN } from '@/data/landing'
import { ASSETS } from '@/lib/assets'
import { Doodle } from '../ui/Doodle'
import { Polaroid } from '../journal/Polaroid'
import { Reveal } from './Reveal'
import { WashiTape } from './WashiTape'

export function LandingJournal() {
  return (
    <section
      id="el-diario"
      className="relative scroll-mt-24 overflow-hidden border-y border-soft-pink/10 bg-gradient-to-b from-deep via-dark-violet/40 to-deep py-28 sm:py-36"
    >
      <div
        aria-hidden="true"
        className="glow-blob absolute right-1/4 top-1/2 h-[38rem] w-[38rem] -translate-y-1/2 rounded-full bg-magenta/20"
      />
      <div
        aria-hidden="true"
        className="glow-blob absolute right-10 top-1/4 h-72 w-72 rounded-full bg-hot-pink/15"
      />

      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Columna de texto */}
          <Reveal className="z-10 lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-soft-pink">
              No es una galería
            </span>

            <h2 className="mb-6 mt-3 font-script text-5xl font-bold leading-tight text-paper text-glow-title sm:text-6xl">
              Se abre, se pasa, se cierra
            </h2>

            <p className="mb-8 text-base leading-relaxed text-paper-lilac/70 sm:text-lg">
              Un libro real en tu pantalla: las páginas se voltean, las notas se escriben
              solas sobre cada foto y el diario se cierra al final.
            </p>

            <ul className="mb-8 w-full divide-y divide-soft-pink/15 border-y border-soft-pink/15">
              {JOURNAL_FEATURES.map((feature) => (
                <li
                  key={feature.label}
                  className="group flex items-center justify-between py-3.5 transition-all duration-200 hover:pl-1"
                >
                  <span className="flex items-center gap-3.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-soft-pink/25 bg-purple/40">
                      <Doodle name={feature.icon} className={`h-4 w-4 ${feature.tone}`} />
                    </span>
                    <span className="text-sm font-medium text-paper transition-colors group-hover:text-soft-pink">
                      {feature.label}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-hot-pink/60"
                  />
                </li>
              ))}
            </ul>

            <Link
              href="/demo"
              className="group mb-8 inline-flex items-center gap-2 text-base font-medium text-soft-pink underline decoration-soft-pink/40 underline-offset-8 transition duration-200 hover:text-hot-pink hover:decoration-hot-pink"
            >
              <span>Abrir el diario de ejemplo</span>
              <Doodle
                name="arrowNext"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5"
              />
            </Link>

            <blockquote className="relative w-full overflow-hidden rounded-xl border border-soft-pink/20 bg-dark-violet/50 p-5">
              <span
                aria-hidden="true"
                className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-hot-pink/10 blur-md"
              />
              <p className="font-script text-xl leading-snug text-paper/95 sm:text-2xl">
                «La sensación táctil de tu adolescencia, convertida en un link que
                emociona.»
              </p>
            </blockquote>
          </Reveal>

          {/* Composición física */}
          <Reveal
            className="relative flex items-center justify-center lg:col-span-7"
            delay={120}
          >
            <div
              aria-hidden="true"
              className="absolute -top-12 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-hot-pink/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-6 right-8 h-44 w-72 rounded-full bg-electric/30 blur-3xl"
            />

            <Doodle
              name="sparkle"
              className="pointer-events-none absolute -top-6 right-12 h-6 w-6 animate-pulse text-soft-pink/80"
            />
            <Doodle
              name="star"
              className="pointer-events-none absolute bottom-4 left-6 h-5 w-5 text-cyan/70"
            />

            <div className="relative w-full max-w-lg py-6 lg:max-w-xl">
              {/* Pliego abierto */}
              <div className="relative z-20 -rotate-3 rounded-2xl border border-soft-pink/30 bg-gradient-to-br from-dark-violet/95 via-purple/60 to-deep/95 p-2.5 shadow-2xl transition-transform duration-500 hover:rotate-0 sm:p-3">
                <WashiTape
                  className="absolute -top-3 left-16 z-30 h-5 w-20 -rotate-3"
                  pink
                />

                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-deep shadow-inner">
                  {/* Las dos hojas: la misma textura, la derecha espejada. */}
                  <div className="grid h-full grid-cols-2">
                    <div
                      className="bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${ASSETS.landingJournal.page})`,
                      }}
                    />
                    <div
                      className="-scale-x-100 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${ASSETS.landingJournal.page})`,
                      }}
                    />
                  </div>

                  {/* Lomo: la sombra del pliegue es lo que lee como «libro». */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-deep/55 to-transparent"
                  />

                  {/* Página izquierda: doodles, como en el diario. */}
                  <div
                    aria-hidden="true"
                    className="absolute left-[10%] top-[18%] text-ink/25"
                  >
                    <Doodle name="swirl" className="h-16 w-16" />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute bottom-[18%] left-[22%] text-ink/20"
                  >
                    <Doodle name="musicNote" className="h-10 w-10" />
                  </div>

                  {/* Página derecha: una instantánea real, con su nota. */}
                  <div className="absolute right-[12%] top-[7%] w-[27%]">
                    <Polaroid
                      entry={MEMORY_MAIN}
                      active
                      typeCaption={false}
                      entrance={false}
                    />
                  </div>

                  <p className="absolute bottom-2.5 left-1/3 rounded border border-soft-pink/20 bg-deep/85 px-2.5 py-1 text-[10px] uppercase tracking-wider text-soft-pink">
                    Páginas texturizadas
                  </p>
                </div>
              </div>

              {/* Portada cerrada, superpuesta */}
              <div className="absolute -bottom-14 -right-6 z-30 w-36 rotate-6 rounded-xl border border-soft-pink/40 bg-gradient-to-tl from-deep via-dark-violet to-purple p-2 shadow-polaroid-lg transition-transform duration-500 hover:rotate-2 sm:-right-10 sm:w-44 sm:p-2.5">
                <WashiTape className="absolute -top-2.5 right-6 z-40 h-4 w-16 rotate-3" />
                <div className="relative overflow-hidden rounded-lg bg-deep shadow-inner">
                  <img
                    src={ASSETS.landingJournal.coverSmall}
                    alt="Portada del diario, con arabescos rosas y el broche de flor"
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full object-cover"
                  />
                  <p className="absolute bottom-2 right-2 rounded border border-cyan/30 bg-deep/90 px-2 py-0.5 text-[9px] uppercase tracking-wider text-cyan">
                    Broche magnético
                  </p>
                </div>
              </div>

              {/* Miniatura pegada con cinta */}
              <div className="absolute -bottom-6 -left-6 z-30 hidden w-32 sm:block">
                <WashiTape className="absolute -top-2 left-4 z-40 h-3.5 w-10 -rotate-6" />
                <Polaroid
                  entry={JOURNAL_MINI}
                  active
                  typeCaption={false}
                  entrance={false}
                  className="shadow-polaroid"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
