'use client'

/**
 * Álbum en móvil: una sola página por viewport.
 *
 * No es el libro de desktop reducido. Dos páginas encogidas dejarían las
 * fotografías ilegibles, así que aquí se muestra una página que ocupa casi
 * todo el alto disponible sin tocar los bordes, y se pasa con gestos.
 *
 * El swipe se resuelve con el drag de Framer Motion y decide por offset *o*
 * por velocidad: un gesto corto pero rápido cuenta igual que uno largo y
 * lento, que es como se espera que responda. Los botones y los puntos de
 * paginación siguen presentes: el gesto nunca es la única vía.
 */

import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { Size } from '@/lib/framing'
import type { NavigationDirection } from '@/hooks/useJournalNavigation'
import type { JournalPageContent } from '@/data/spreads'
import { JournalPage } from './JournalPage'

/** Umbrales del gesto: cualquiera de los dos dispara el cambio. */
const SWIPE_DISTANCE = 60
const SWIPE_VELOCITY = 420

type Props = {
  pageIndex: number
  direction: NavigationDirection
  size: Size
  onNext: () => void
  onPrev: () => void
  pages: readonly JournalPageContent[]
}

export function MobileBook({ pageIndex, direction, size, onNext, onPrev, pages }: Props) {
  const reducedMotion = useReducedMotion()
  const page = pages[pageIndex]

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info
    const swipedLeft = offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY
    const swipedRight = offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY

    if (swipedLeft) onNext()
    else if (swipedRight) onPrev()
  }

  const forward = direction === 'forward'

  return (
    <div className="relative grid h-full w-full place-items-center">
      <div
        className="relative"
        style={{ width: size.width, height: size.height }}
        aria-live="polite"
      >
        {/* Sombra bajo la página. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-5 left-1/2 h-8 -translate-x-1/2 rounded-[50%] blur-2xl"
          style={{
            width: size.width * 0.8,
            background: 'radial-gradient(ellipse, rgba(22,0,25,0.68) 0%, transparent 70%)',
          }}
        />

        <AnimatePresence mode="popLayout" initial={false}>
          {page && (
            <motion.div
              key={page.id}
              className="absolute inset-0 overflow-hidden rounded-sm shadow-[0_20px_50px_-18px_rgba(22,0,25,0.75)]"
              drag="x"
              dragElastic={0.14}
              dragConstraints={{ left: 0, right: 0 }}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: forward ? 90 : -90, rotate: forward ? 3 : -3, scale: 0.96 }
              }
              animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: forward ? -90 : 90, rotate: forward ? -3 : 3, scale: 0.96 }
              }
              transition={
                reducedMotion
                  ? { duration: 0.18 }
                  : { duration: 0.52, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <JournalPage content={page} active priority={pageIndex <= 1} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
