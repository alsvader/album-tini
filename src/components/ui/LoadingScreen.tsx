'use client'

/**
 * Pantalla de carga.
 *
 * Un corazón que se dibuja mientras cargan las texturas, en lugar de un
 * spinner: el progreso avanza rellenando el trazo, así que el indicador es el
 * propio doodle. Coherente con el resto de la estética y sin assets extra.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { DOODLES } from '@/data/doodles.generated'

type Props = {
  visible: boolean
  /** 0–1. */
  progress: number
}

export function LoadingScreen({ visible, progress }: Props) {
  const heart = DOODLES.heart
  const clamped = Math.max(0, Math.min(1, progress))

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-deep"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
        >
          {/* Resplandor de fondo, muy contenido. */}
          <div
            className="pointer-events-none absolute h-[46vmin] w-[46vmin] rounded-full opacity-40 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(255,36,228,0.5) 0%, rgba(189,0,255,0.18) 45%, transparent 72%)',
            }}
          />

          <div className="relative flex flex-col items-center gap-7">
            <svg
              viewBox={heart.viewBox}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-24 w-24 text-hot-pink"
              aria-hidden="true"
            >
              {/* Trazo de referencia, muy tenue. */}
              {heart.paths.map((d, i) => (
                <path
                  key={`ghost-${i}`}
                  d={d}
                  stroke="currentColor"
                  strokeWidth={heart.strokeWidth}
                  opacity={0.16}
                />
              ))}
              {/* Trazo que avanza con el progreso real. */}
              {heart.paths.map((d, i) => (
                <path
                  key={`fill-${i}`}
                  d={d}
                  stroke="currentColor"
                  strokeWidth={heart.strokeWidth}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - clamped}
                  style={{ transition: 'stroke-dashoffset 260ms ease-out' }}
                />
              ))}
            </svg>

            <p className="font-script text-2xl tracking-wide text-soft-pink">
              Preparando recuerdos…
            </p>

            <span className="sr-only">{Math.round(clamped * 100)}% cargado</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
