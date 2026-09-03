'use client'

/**
 * Capa DOM de la intro: momentos 2, 3 y 5 del guion.
 *
 * El trazo que se dibuja y los símbolos van en DOM y no en WebGL porque un
 * stroke SVG animado se ve nítido a cualquier resolución y no cuesta nada,
 * mientras que en la escena habría que rasterizarlo. Las partículas, el glow
 * y la cámara siguen siendo 3D. Ambas capas leen los mismos tiempos de
 * lib/timings, así que van al mismo compás.
 */

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { INTRO } from '@/lib/timings'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { DoodleName } from '@/data/doodles.generated'
import { Doodle } from '../ui/Doodle'

/**
 * Símbolos del momento 3.
 *
 * Son cuatro y no más: los doodles 3D de la escena ya ocupan esa zona, y
 * duplicar elementos en las dos capas convierte el encuadre en ruido. Se
 * quedan a baja opacidad para acompañar, no para competir con el diario.
 */
const SYMBOLS: readonly { name: DoodleName; className: string; delay: number }[] = [
  { name: 'heart', className: 'left-[19%] top-[26%] h-7 w-7 text-hot-pink', delay: 0 },
  { name: 'musicNote', className: 'right-[21%] top-[31%] h-6 w-6 text-soft-pink', delay: 0.12 },
  { name: 'star', className: 'left-[26%] bottom-[27%] h-5 w-5 text-electric', delay: 0.24 },
  { name: 'sparkle', className: 'right-[27%] bottom-[30%] h-5 w-5 text-cyan', delay: 0.36 },
]

type Props = {
  /** 'intro' dibuja la secuencia; 'ready' deja sólo la llamada a la acción. */
  phase: 'intro' | 'ready'
  onOpen: () => void
  /**
   * Enfoca el botón al aparecer. Sólo se activa al regresar de cerrar el
   * diario: ahí el foco del teclado se quedó sin destino porque la página que
   * lo tenía se desmontó. En la carga inicial robaría el foco sin motivo.
   */
  focusCta?: boolean
}

export function IntroOverlay({ phase, onOpen, focusCta = false }: Props) {
  const ctaRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = useReducedMotion()
  const isIntro = phase === 'intro'

  // Con reduced motion no hay secuencia: sólo el botón, disponible de inmediato.
  const showSequence = isIntro && !reducedMotion
  const showCta = phase === 'ready' || reducedMotion

  useEffect(() => {
    if (!focusCta || !showCta) return
    // Un frame de margen: el botón entra con AnimatePresence.
    const id = requestAnimationFrame(() => ctaRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [focusCta, showCta])

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {/* Momento 2: el trazo se dibuja solo. */}
      <AnimatePresence>
        {showSequence && (
          <motion.div
            className="absolute inset-0 grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: INTRO.journalReveal.at - INTRO.doodleDraw.at + 0.9,
              delay: INTRO.doodleDraw.at,
              times: [0, 0.18, 0.62, 1],
              ease: 'easeInOut',
            }}
          >
            <Doodle
              name="swirl"
              draw
              duration={INTRO.doodleDraw.duration}
              className="h-[38vmin] w-[38vmin] text-hot-pink/85"
              strokeWidth={2.4}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Momento 3: símbolos alrededor. Se quedan, muy tenues. */}
      {showSequence &&
        SYMBOLS.map((symbol) => (
          <motion.div
            key={symbol.name}
            className={`absolute ${symbol.className}`}
            initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
            animate={{ opacity: [0, 0.85, 0.2], scale: 1, rotate: 0 }}
            transition={{
              duration: INTRO.symbolsIn.duration + 1.4,
              delay: INTRO.symbolsIn.at + symbol.delay,
              times: [0, 0.35, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Doodle name={symbol.name} className="h-full w-full" />
          </motion.div>
        ))}

      {/* Momento 5: llamada a la acción. Botón real, no un texto decorativo. */}
      <AnimatePresence>
        {showCta && (
          <motion.div
            className="absolute inset-x-0 bottom-[7vh] grid place-items-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: INTRO.ctaIn.duration,
              delay: reducedMotion ? 0 : 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <button
              ref={ctaRef}
              type="button"
              onClick={onOpen}
              className="pointer-events-auto group flex flex-col items-center gap-2 px-6 py-3"
            >
              <span className="font-script text-3xl text-paper drop-shadow-[0_0_18px_rgba(255,36,228,0.5)] sm:text-4xl">
                Abre el diario
              </span>
              <span className="text-[0.7rem] uppercase tracking-[0.32em] text-soft-pink/85">
                toca para abrir
              </span>

              {/* Latido discreto: invita sin gritar. */}
              <motion.span
                aria-hidden="true"
                className="mt-1 block h-px w-16 bg-linear-to-r from-transparent via-hot-pink to-transparent"
                animate={reducedMotion ? undefined : { opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
