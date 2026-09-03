'use client'

/**
 * Doodles que acompañan a una foto.
 *
 * Cada entrada declara como máximo dos, y aquí se colocan en esquinas opuestas
 * con una inclinación fija. Deliberadamente pocos: el patrón de la página del
 * pack ya es denso y la fotografía es la protagonista, así que el espacio
 * negativo vale más que un doodle extra.
 */

import { motion } from 'framer-motion'
import type { DoodleName } from '@/data/doodles.generated'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Doodle } from '../ui/Doodle'

/** Posiciones alternas para que dos doodles nunca compitan por el mismo sitio. */
const SLOTS = [
  '-top-[3%] -right-[2%] h-[13%] rotate-[14deg] text-hot-pink/75',
  '-bottom-[2%] -left-[3%] h-[12%] -rotate-[11deg] text-electric/70',
] as const

type Props = {
  names: readonly DoodleName[]
  active: boolean
}

export function PageDoodles({ names, active }: Props) {
  const reducedMotion = useReducedMotion()

  return (
    <>
      {names.slice(0, SLOTS.length).map((name, index) => (
        <motion.div
          key={name}
          className={`pointer-events-none absolute aspect-square ${SLOTS[index]}`}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
          transition={{
            duration: reducedMotion ? 0.15 : 0.55,
            delay: reducedMotion ? 0 : 0.5 + index * 0.14,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* El trazo se dibuja: refuerza la idea de hecho a mano. */}
          <Doodle name={name} draw={active} duration={0.85} delay={0.55 + index * 0.14} className="h-full w-full" />
        </motion.div>
      ))}
    </>
  )
}
