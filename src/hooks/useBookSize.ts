'use client'

import { useEffect, useState } from 'react'
import { computeBookSize, type Size } from '@/lib/framing'
import {
  CAMERA_FOV,
  JOURNAL_HEIGHT,
  JOURNAL_WIDTH,
  SPREAD_COVERAGE,
  SPREAD_HEIGHT,
  SPREAD_WIDTH,
} from '@/lib/three/journalDims'

export type BookMode = 'spread' | 'single'

/**
 * Tamaño en píxeles del libro DOM.
 *
 * Usa la misma función que sitúa la cámara al final de la apertura, así que el
 * álbum aparece exactamente donde estaba el diario 3D y el crossfade no
 * necesita ajustes a ojo. Al redimensionar la ventana ambos siguen coincidiendo
 * porque el cálculo es el mismo, no dos aproximaciones parecidas.
 */
export function useBookSize(mode: BookMode): Size | null {
  const [size, setSize] = useState<Size | null>(null)

  useEffect(() => {
    const measure = () => {
      const viewport = { width: window.innerWidth, height: window.innerHeight }

      const planeW = mode === 'spread' ? SPREAD_WIDTH : JOURNAL_WIDTH
      const planeH = mode === 'spread' ? SPREAD_HEIGHT : JOURNAL_HEIGHT
      const coverage =
        mode === 'spread' ? SPREAD_COVERAGE.desktop : SPREAD_COVERAGE.mobile

      const next = computeBookSize(CAMERA_FOV, viewport, planeW, planeH, coverage)

      // Nunca tocar los bordes del viewport, sobre todo en móvil.
      const maxW = viewport.width * 0.94
      const maxH = viewport.height * 0.92
      const scale = Math.min(1, maxW / next.width, maxH / next.height)

      setSize({ width: next.width * scale, height: next.height * scale })
    }

    measure()
    window.addEventListener('resize', measure)
    // En móvil la barra de direcciones cambia la altura sin disparar resize.
    window.visualViewport?.addEventListener('resize', measure)

    return () => {
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
    }
  }, [mode])

  return size
}
