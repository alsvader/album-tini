'use client'

/**
 * La constelación de Polaroids del hero.
 *
 * Único dueño del scroll: llama a `useScroll` una vez y reparte el mismo
 * `MotionValue` a las seis, que derivan su propio recorrido. Seis
 * `useTransform` en un `.map()` de este componente también funcionaría hoy,
 * porque el array es una constante de módulo, pero rompería el orden de los
 * hooks en cuanto alguien filtrara la lista por breakpoint. Cada Polaroid
 * llamando al suyo es inmune a eso.
 *
 * Las seis son `absolute` dentro del hero, así que la altura de la sección no
 * depende de ellas y `useScroll` mide bien al montar. Si alguna pasara a estar
 * en el flujo, el parallax se descalibraría sin avisar.
 */

import { useScroll } from 'framer-motion'
import { useRef } from 'react'
import { HERO_POLAROIDS } from '@/data/landing'
import { HeroPolaroid } from './HeroPolaroid'

export function HeroConstellation() {
  const ref = useRef<HTMLDivElement>(null)

  // De «el hero llena la pantalla» a «el hero ha salido por arriba».
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-20">
      {HERO_POLAROIDS.map((spec) => (
        <HeroPolaroid key={spec.entry.id} spec={spec} progress={scrollYProgress} />
      ))}
    </div>
  )
}
