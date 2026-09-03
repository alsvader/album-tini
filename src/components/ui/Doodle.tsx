'use client'

/**
 * Doodle SVG inline.
 *
 * Se renderiza inline y no como <img> porque el trazo tiene que poder
 * animarse: un <img> no permite tocar stroke-dashoffset. El path viene del
 * propio SVG del pack (extraído en build), así que no se recrea nada.
 *
 * `pathLength={1}` normaliza la longitud del trazo, de modo que dasharray y
 * dashoffset valen 1 sin necesidad de medir el path en runtime.
 */

import { motion } from 'framer-motion'
import { DOODLES, type DoodleName } from '@/data/doodles.generated'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Props = {
  name: DoodleName
  className?: string
  /** Dibuja el trazo al aparecer. */
  draw?: boolean
  /** Duración del trazado, segundos. */
  duration?: number
  delay?: number
  strokeWidth?: number
  /** Decorativo por defecto: se oculta a lectores de pantalla. */
  label?: string
}

export function Doodle({
  name,
  className,
  draw = false,
  duration = 1.2,
  delay = 0,
  strokeWidth,
  label,
}: Props) {
  const shape = DOODLES[name]
  const reducedMotion = useReducedMotion()
  const animate = draw && !reducedMotion

  return (
    <svg
      viewBox={shape.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? shape.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {shape.paths.map((d, index) =>
        animate ? (
          <motion.path
            key={index}
            d={d}
            pathLength={1}
            strokeDasharray={1}
            initial={{ strokeDashoffset: 1, opacity: 0 }}
            animate={{ strokeDashoffset: 0, opacity: 1 }}
            transition={{
              strokeDashoffset: {
                duration,
                delay: delay + index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: { duration: 0.2, delay: delay + index * 0.12 },
            }}
          />
        ) : (
          <path key={index} d={d} />
        ),
      )}
    </svg>
  )
}
