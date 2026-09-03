'use client'

/**
 * Controles de navegación.
 *
 * Botones reales con aria-label, no divs con onClick: así funcionan con
 * teclado y con lectores de pantalla sin trabajo extra. Discretos a propósito
 * —esto es un diario, no un panel— pero siempre visibles, porque el swipe y el
 * teclado no pueden ser el único camino.
 */

import { Doodle } from '../ui/Doodle'

type Props = {
  index: number
  total: number
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
  onGoTo: (index: number) => void
  variant: 'desktop' | 'mobile'
  /** Etiqueta de la unidad navegada, para los aria-label. */
  unitLabel?: string
}

const buttonBase = [
  'grid place-items-center rounded-full border transition-all duration-300',
  'border-soft-pink/25 bg-dark-violet/55 text-soft-pink backdrop-blur-[2px]',
  'hover:border-hot-pink/60 hover:text-hot-pink',
  'disabled:pointer-events-none disabled:opacity-25',
].join(' ')

export function BookControls({
  index,
  total,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onGoTo,
  variant,
  unitLabel = 'página',
}: Props) {
  const isDesktop = variant === 'desktop'
  const size = isDesktop ? 'h-12 w-12' : 'h-11 w-11'

  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label={`${unitLabel} anterior`}
        className={[
          buttonBase,
          size,
          'fixed z-40',
          isDesktop
            ? 'left-6 top-1/2 -translate-y-1/2'
            : 'bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-6',
        ].join(' ')}
      >
        {/* Una sola flecha en el pack: se refleja para la dirección contraria. */}
        <Doodle name="arrowNext" className="h-5 w-5 -scale-x-100" />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label={`${unitLabel} siguiente`}
        className={[
          buttonBase,
          size,
          'fixed z-40',
          isDesktop
            ? 'right-6 top-1/2 -translate-y-1/2'
            : 'bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-6',
        ].join(' ')}
      >
        <Doodle name="arrowNext" className="h-5 w-5" />
      </button>

      {/* Paginación: además de informar, permite saltar directamente. */}
      <nav
        aria-label="Páginas del diario"
        className={[
          'fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-2',
          isDesktop
            ? 'bottom-6'
            : 'bottom-[max(1.6rem,calc(env(safe-area-inset-bottom)+0.4rem))]',
        ].join(' ')}
      >
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onGoTo(i)}
            aria-label={`Ir a la ${unitLabel} ${i + 1} de ${total}`}
            aria-current={i === index ? 'true' : undefined}
            className={[
              'h-1.5 rounded-full transition-all duration-300',
              i === index ? 'w-6 bg-hot-pink' : 'w-1.5 bg-soft-pink/35 hover:bg-soft-pink/60',
            ].join(' ')}
          />
        ))}
      </nav>
    </>
  )
}
