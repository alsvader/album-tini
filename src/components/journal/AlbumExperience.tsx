'use client'

/**
 * Capa DOM del álbum.
 *
 * Elige entre libro de doble página y página única según el breakpoint —son
 * dos componentes distintos, no un layout que encoge— y comparte entre ambos
 * la navegación, los controles y el teclado.
 *
 * El crossfade desde la escena 3D lo aplica el contenedor: aparece con
 * opacidad 0 y una escala mínima, de modo que el álbum se materializa justo
 * donde estaba el diario en lugar de sustituirlo de golpe.
 */

import { forwardRef, useCallback, useMemo } from 'react'
import { buildAlbum, type AlbumData } from '@/data/spreads'
import { useBreakpoint } from '@/hooks/useMediaQuery'
import { useBookSize } from '@/hooks/useBookSize'
import { useJournalNavigation } from '@/hooks/useJournalNavigation'
import { BookControls } from './BookControls'
import { DesktopBook } from './DesktopBook'
import { MobileBook } from './MobileBook'

/** Bloqueo entre cambios: cubre el giro de hoja de desktop. */
const FLIP_LOCK_MS = 1120

type Props = {
  album: AlbumData
}

export const AlbumExperience = forwardRef<HTMLDivElement, Props>(function AlbumExperience(
  { album },
  ref,
) {
  const breakpoint = useBreakpoint()
  const isSpread = breakpoint === 'desktop'

  const size = useBookSize(isSpread ? 'spread' : 'single')

  // La paginación se deriva del contenido, no de constantes de módulo: es lo
  // que permite que la misma experiencia sirva la demo y cualquier álbum.
  const { pages, spreads, leaves } = useMemo(() => buildAlbum(album), [album])

  const navigation = useJournalNavigation({
    total: isSpread ? spreads.length : pages.length,
    lockMs: isSpread ? FLIP_LOCK_MS : 0,
    keyboard: true,
  })

  const { index, total, direction, canGoNext, canGoPrev, next, prev, goTo, settle } = navigation

  const handleFlipEnd = useCallback(() => settle(), [settle])

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-20 grid place-items-center"
      // El contenedor arranca invisible: la opacidad la anima el crossfade.
      style={{ opacity: 0 }}
    >
      {/* Ambiente detrás del libro: mantiene el escenario del 3D. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-deep"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(138,0,106,0.5) 0%, rgba(41,0,35,0.75) 45%, #160019 100%)',
        }}
      />

      {size && (
        <>
          {isSpread ? (
            <DesktopBook
              spreadIndex={index}
              size={size}
              onFlipEnd={handleFlipEnd}
              spreads={spreads}
              leaves={leaves}
            />
          ) : (
            <MobileBook
              pageIndex={index}
              direction={direction}
              size={size}
              onNext={next}
              onPrev={prev}
              pages={pages}
            />
          )}

          <BookControls
            index={index}
            total={total}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrev={prev}
            onNext={next}
            onGoTo={goTo}
            variant={isSpread ? 'desktop' : 'mobile'}
            unitLabel={isSpread ? 'doble página' : 'página'}
          />
        </>
      )}
    </div>
  )
})
