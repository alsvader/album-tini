/**
 * «Cómo funciona», en tres pasos.
 *
 * Server component: son textos y doodles estáticos, no necesita JavaScript en
 * el cliente. `Doodle` es cliente por su animación de trazo, pero se importa
 * sin `draw`, así que no arrastra trabajo extra.
 */

import type { DoodleName } from '@/data/doodles.generated'
import { Doodle } from '../ui/Doodle'

const STEPS: readonly { icon: DoodleName; title: string; body: string }[] = [
  {
    icon: 'camera',
    title: 'Sube tus fotos',
    body: 'Elige varias de una vez. Aparecen al momento y las vas ordenando sin subir nada todavía.',
  },
  {
    icon: 'speechHeart',
    title: 'Escribe cada recuerdo',
    body: 'Cada foto lleva su propia nota, la que se escribirá a mano sobre la instantánea.',
  },
  {
    icon: 'trebleClef',
    title: 'Comparte el enlace',
    body: 'Al publicar recibes una dirección única. Quien la abra verá tu diario abrirse.',
  },
]

export function LandingSteps() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <h2 className="text-center font-script text-[clamp(2rem,5vw,3.2rem)] text-paper">
        Cómo funciona
      </h2>

      <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative flex flex-col items-center text-center">
            <span
              aria-hidden="true"
              className="absolute -top-6 font-script text-6xl text-hot-pink/15"
            >
              {index + 1}
            </span>

            <div className="grid h-16 w-16 place-items-center rounded-full border border-soft-pink/25 bg-dark-violet/40">
              <Doodle name={step.icon} className="h-8 w-8 text-hot-pink" />
            </div>

            <h3 className="mt-6 text-base font-medium text-paper">{step.title}</h3>
            <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-paper-lilac/65">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
