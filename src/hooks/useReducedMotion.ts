'use client'

import { useEffect } from 'react'
import { useMediaQuery } from './useMediaQuery'
import { useExperience } from '@/state/experience'

/**
 * Lee `prefers-reduced-motion` y lo publica en el store, de modo que tanto el
 * DOM como la escena 3D consulten una única fuente.
 *
 * Con la preferencia activa: sin intro larga, sin parallax, flip simplificado
 * y typewriter instantáneo. La navegación sigue siendo completa.
 */
export function useReducedMotionSync(): boolean {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const setReducedMotion = useExperience((s) => s.setReducedMotion)

  useEffect(() => {
    setReducedMotion(reduced)
  }, [reduced, setReducedMotion])

  return reduced
}

export function useReducedMotion(): boolean {
  return useExperience((s) => s.reducedMotion)
}
