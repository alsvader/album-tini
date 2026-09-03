'use client'

import { useEffect } from 'react'
import { useExperience, type QualityTier } from '@/state/experience'

type NavigatorWithHints = Navigator & {
  deviceMemory?: number
  hardwareConcurrency?: number
}

/**
 * Deriva el tier de calidad una sola vez al montar.
 *
 * No reacciona a resize a propósito: recrear las partículas o el render target
 * del suelo al arrastrar la ventana produce un salto muy visible, y el coste de
 * mantener el tier alto en una ventana estrecha de desktop es asumible.
 */
function detectTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium'

  const nav = navigator as NavigatorWithHints
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 768
  const memory = nav.deviceMemory ?? 8
  const cores = nav.hardwareConcurrency ?? 8

  if (memory <= 4 || cores <= 4) return 'low'
  if (coarse || narrow) return 'medium'
  return 'high'
}

/**
 * Parámetros de escena por tier. Un único sitio donde ajustar performance.
 *
 * `keepCanvasAlive` decide si el Canvas sobrevive al paso al álbum. Mantenerlo
 * retiene las texturas en memoria de GPU (~70-90 MB) mientras se leen las
 * páginas, y en cambio permite cerrar el diario animando la apertura en reversa,
 * porque el estado 3D —cámara cenital, tapa abierta, diario recostado— sigue
 * existiendo. Con el bucle de render detenido el coste por frame es nulo, así
 * que lo único que se paga es memoria. En el tier bajo no compensa: ahí se
 * libera la GPU y el cierre pasa a ser un fundido.
 */
export const QUALITY_SETTINGS = {
  high: {
    particles: 900,
    doodles: 7,
    dpr: [1, 2] as [number, number],
    reflectiveFloor: true,
    shadows: true,
    parallax: 1,
    keepCanvasAlive: true,
  },
  medium: {
    particles: 450,
    doodles: 5,
    dpr: [1, 1.5] as [number, number],
    reflectiveFloor: false,
    shadows: true,
    parallax: 0.5,
    keepCanvasAlive: true,
  },
  low: {
    particles: 200,
    doodles: 3,
    dpr: [1, 1.25] as [number, number],
    reflectiveFloor: false,
    shadows: false,
    parallax: 0,
    keepCanvasAlive: false,
  },
} as const

export type QualitySettings = (typeof QUALITY_SETTINGS)[QualityTier]

export function useQualityTierSync(): void {
  const setQuality = useExperience((s) => s.setQuality)

  useEffect(() => {
    setQuality(detectTier())
  }, [setQuality])
}

export function useQualitySettings(): QualitySettings {
  const quality = useExperience((s) => s.quality)
  return QUALITY_SETTINGS[quality]
}
