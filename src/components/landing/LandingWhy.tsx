/**
 * «Hecho con cariño»: las cuatro razones.
 *
 * Server component. `Reveal` lleva las clases del grid item y no la tarjeta,
 * porque el div que inserta es el hijo directo del grid; la tarjeta lleva
 * `h-full` para que las cuatro queden a la misma altura pese a tener textos de
 * largo distinto.
 */

import { REASONS } from '@/data/landing'
import { Doodle } from '../ui/Doodle'
import { Reveal } from './Reveal'

export function LandingWhy() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-16">
        <Reveal className="mx-auto mb-16 max-w-xl text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-soft-pink">
            Por qué Álbum de Tini
          </span>
          <h2 className="font-script text-5xl font-bold text-paper text-glow-title sm:text-6xl">
            Hecho con cariño
          </h2>
        </Reveal>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/*
            Reveal va dentro del <li> y no envolviéndolo: como hijo directo del
            grid tendría que llevar `display: contents` para no romper el
            layout, y un elemento con `contents` no se puede transformar, así
            que la aparición no se vería.
          */}
          {REASONS.map((reason, index) => (
            <li key={reason.title} className="h-full">
              <Reveal className="h-full" delay={index * 90}>
                <div className="group h-full rounded-2xl border border-soft-pink/15 bg-dark-violet/50 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-soft-pink/40">
                  <span className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-purple/30 transition-transform group-hover:scale-110">
                    <Doodle name={reason.icon} className={`h-6 w-6 ${reason.tone}`} />
                  </span>
                  <h3 className="mb-2 text-lg font-semibold text-paper">
                    {reason.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-paper-lilac/70">
                    {reason.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
