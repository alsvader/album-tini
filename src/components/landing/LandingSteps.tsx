/**
 * «Cómo funciona», en tres pasos.
 *
 * Server component: son textos y doodles estáticos. `Doodle` es cliente por su
 * animación de trazo, pero se importa sin `draw`, así que no arrastra trabajo
 * extra, y `Reveal` sólo envuelve —el copy no viaja al bundle—.
 */

import { STEPS } from '@/data/landing'
import { Doodle } from '../ui/Doodle'
import { Reveal } from './Reveal'

export function LandingSteps() {
  return (
    <section
      id="como-funciona"
      className="relative scroll-mt-24 overflow-hidden py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-16">
        <Reveal className="mx-auto mb-20 max-w-xl text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-soft-pink">
            Paso a paso
          </span>
          <h2 className="font-script text-5xl font-bold text-paper text-glow-title sm:text-6xl">
            Cómo funciona
          </h2>
        </Reveal>

        {/*
          El hilo cosido va fuera del <ol> y no dentro: un <ol> sólo admite
          <li> como hijo, y el parser del navegador saca de ahí cualquier <div>,
          lo que produce un HTML distinto del que renderiza React y un aviso de
          hidratación. `top-14` lo alinea con el centro de los badges: 24px del
          padding del paso más la mitad de los 64px del círculo.
        */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-[18%] right-[18%] top-14 hidden border-t-2 border-dashed border-soft-pink/25 md:block"
          />

          <ol className="relative grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-8">
            {STEPS.map((step, index) => (
              <li key={step.title} className="z-10">
                {/*
                `relative` en el Reveal y no en el <li>: mientras está oculto,
                Reveal tiene un `transform` y por tanto es el bloque contenedor
                del número fantasma. Si el contexto fuera el <li>, el número
                saltaría de sitio al terminar la animación, cuando el transform
                pasa a `none`.
              */}
                <Reveal
                  className="relative flex flex-col items-center p-6 text-center"
                  delay={index * 120}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-10 select-none font-script text-8xl font-bold text-paper/10 md:-top-16 md:text-7xl"
                  >
                    {index + 1}
                  </span>

                  <span className="mb-6 grid h-16 w-16 place-items-center rounded-full border border-soft-pink/30 bg-dark-violet/90 shadow-neon-glow backdrop-blur-md">
                    <Doodle name={step.icon} className={`h-8 w-8 ${step.tone}`} />
                  </span>

                  <h3 className="mb-3 text-xl font-semibold text-paper">{step.title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-paper-lilac/70">
                    {step.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
