'use client'

import { useEffect, useState } from 'react'

/**
 * Suscripción a una media query.
 *
 * Devuelve `false` en el primer render del cliente y en SSR para que el HTML
 * del servidor y el del cliente coincidan; el valor real llega en el efecto.
 * Quien necesite distinguir "aún no sé" de "no" debe usar `useBreakpoint`.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'unknown'

/**
 * Breakpoints del proyecto (docs/art-direction.png):
 *   mobile  < 768px   → una página
 *   tablet  768–1023  → una página, caja más ancha
 *   desktop >= 1024   → doble página
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('unknown')

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    const tablet = window.matchMedia('(min-width: 768px)')

    const resolve = () =>
      setBreakpoint(desktop.matches ? 'desktop' : tablet.matches ? 'tablet' : 'mobile')

    resolve()
    desktop.addEventListener('change', resolve)
    tablet.addEventListener('change', resolve)
    return () => {
      desktop.removeEventListener('change', resolve)
      tablet.removeEventListener('change', resolve)
    }
  }, [])

  return breakpoint
}
