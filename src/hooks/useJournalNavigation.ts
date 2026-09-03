'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type NavigationDirection = 'forward' | 'backward'

export type JournalNavigation = {
  index: number
  total: number
  direction: NavigationDirection
  canGoNext: boolean
  canGoPrev: boolean
  isAnimating: boolean
  next: () => void
  prev: () => void
  goTo: (index: number) => void
  /** Lo llama la vista cuando su transición termina. */
  settle: () => void
}

type Options = {
  total: number
  /** Duración del bloqueo entre cambios, ms. 0 = sin bloqueo. */
  lockMs?: number
  /** Habilita ArrowLeft / ArrowRight. */
  keyboard?: boolean
}

/**
 * Navegación del álbum: índice, dirección y anti-rebote.
 *
 * El bloqueo existe porque el page flip de desktop no es interrumpible a mitad
 * de giro sin dejar hojas con z-index inconsistente. `settle()` permite a la
 * vista liberar antes del timeout si su animación acabó primero.
 */
export function useJournalNavigation({
  total,
  lockMs = 0,
  keyboard = true,
}: Options): JournalNavigation {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<NavigationDirection>('forward')
  const [isAnimating, setIsAnimating] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const settle = useCallback(() => {
    clearTimer()
    setIsAnimating(false)
  }, [clearTimer])

  const move = useCallback(
    (target: number, dir: NavigationDirection) => {
      if (isAnimating) return

      const clamped = Math.max(0, Math.min(total - 1, target))
      if (clamped === index) return

      // Los tres setters se llaman al mismo nivel, nunca dentro del updater de
      // otro: React exige que los updaters sean puros y puede invocarlos más
      // de una vez, lo que duplicaría el temporizador de bloqueo.
      setDirection(dir)
      setIndex(clamped)

      if (lockMs > 0) {
        setIsAnimating(true)
        clearTimer()
        timer.current = setTimeout(() => {
          setIsAnimating(false)
          timer.current = null
        }, lockMs)
      }
    },
    [clearTimer, index, isAnimating, lockMs, total],
  )

  const next = useCallback(() => move(index + 1, 'forward'), [index, move])
  const prev = useCallback(() => move(index - 1, 'backward'), [index, move])
  const goTo = useCallback(
    (target: number) => move(target, target >= index ? 'forward' : 'backward'),
    [index, move],
  )

  useEffect(() => clearTimer, [clearTimer])

  useEffect(() => {
    if (!keyboard) return

    const onKeyDown = (event: KeyboardEvent) => {
      // No secuestrar el teclado mientras se escribe en un control.
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [contenteditable="true"]')) return

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        prev()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [keyboard, next, prev])

  return useMemo(
    () => ({
      index,
      total,
      direction,
      canGoNext: index < total - 1,
      canGoPrev: index > 0,
      isAnimating,
      next,
      prev,
      goTo,
      settle,
    }),
    [direction, goTo, index, isAnimating, next, prev, settle, total],
  )
}
