/**
 * Preguntas frecuentes.
 *
 * Server component, y el acordeón no lleva ni una línea de JavaScript:
 * `<details name="faq">` da comportamiento exclusivo —abrir una cierra la
 * anterior— y `<summary>` ya es enfocable y anunciable por lectores de
 * pantalla. La alternativa de cliente obligaría a reimplementar a mano
 * `aria-expanded`, `aria-controls`, el botón y el manejo de teclado.
 *
 * Lo que se pierde es animar la altura al abrir, que hoy no se puede hacer en
 * CSS sin `calc-size` (sólo Chromium). No importa: el diseño tampoco la tiene.
 *
 * El atributo `name` en `<details>` necesita Chrome 120, Safari 17.2 o Firefox
 * 130; donde no está, degrada a poder tener varias abiertas a la vez.
 */

import { FAQ } from '@/data/landing'
import { Reveal } from './Reveal'

export function LandingFaq() {
  return (
    <section
      id="preguntas"
      className="relative scroll-mt-24 border-t border-soft-pink/10 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-3xl px-6 sm:px-12">
        <Reveal className="mb-16 text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-soft-pink">
            Dudas habituales
          </span>
          <h2 className="font-script text-5xl font-bold text-paper text-glow-title sm:text-6xl">
            Preguntas
          </h2>
        </Reveal>

        <Reveal className="divide-y divide-soft-pink/10">
          {FAQ.map((item, index) => (
            <details
              key={item.q}
              name="faq"
              // La primera abierta, como en el diseño: deja claro de un vistazo
              // que esto se despliega.
              open={index === 0}
              className="group py-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-medium text-paper transition-colors group-hover:text-soft-pink sm:text-xl">
                  {item.q}
                </h3>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-2xl font-light leading-none text-soft-pink/60 transition-transform duration-200 group-open:rotate-45 group-open:text-hot-pink"
                >
                  +
                </span>
              </summary>

              <p className="mt-4 pr-8 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
                {item.a}
              </p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
