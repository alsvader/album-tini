'use client'

/**
 * Estado global de la experiencia.
 *
 * Zustand y no Context porque el estado se lee a ambos lados del root de React
 * Three Fiber (el Canvas monta su propio reconciler) y porque los selectores
 * evitan re-renderizar el scene graph en cada cambio.
 *
 * Una sola máquina de estados en lugar de booleanos sueltos:
 *
 *   loading → intro → ready → opening → album
 *                       ↑                  │
 *                       └───── closing ────┘
 *
 * El ciclo se cierra: desde el álbum se puede volver al diario cerrado, y desde
 * ahí abrirlo otra vez. `ready` es el punto de reposo al que se regresa; la
 * intro no se repite, porque es una primera impresión.
 */

import { create } from 'zustand'

export type ExperienceState = 'loading' | 'intro' | 'ready' | 'opening' | 'album' | 'closing'

/** Nivel de detalle de la escena, derivado del dispositivo. */
export type QualityTier = 'high' | 'medium' | 'low'

type ExperienceStore = {
  state: ExperienceState
  /** Progreso de carga de texturas, 0–1. */
  progress: number
  /** true mientras una animación no debe ser interrumpida. */
  locked: boolean
  quality: QualityTier
  reducedMotion: boolean
  musicEnabled: boolean
  /** Captions ya tecleados: evita repetir el typewriter al volver a una página. */
  typedCaptions: ReadonlySet<string>

  setState: (state: ExperienceState) => void
  setProgress: (progress: number) => void
  setQuality: (quality: QualityTier) => void
  setReducedMotion: (reduced: boolean) => void
  toggleMusic: () => void
  markCaptionTyped: (id: string) => void
  /** Reinicia los captions para que el álbum vuelva a escribirse desde cero. */
  resetTypedCaptions: () => void

  /** Inicia la apertura del diario. Ignorado si ya está en curso. */
  requestOpen: () => void
  /** Fin de la timeline de apertura: entrega el control al álbum DOM. */
  completeOpen: () => void
  /** Inicia el cierre del diario. Sólo válido desde el álbum. */
  requestClose: () => void
  /** Fin de la timeline de cierre: el diario queda cerrado y listo otra vez. */
  completeClose: () => void
  /** Salta la intro cuando el usuario interactúa antes de que termine. */
  skipIntro: () => void
}

export const useExperience = create<ExperienceStore>()((set, get) => ({
  state: 'loading',
  progress: 0,
  locked: false,
  quality: 'high',
  reducedMotion: false,
  musicEnabled: false,
  typedCaptions: new Set<string>(),

  setState: (state) => set({ state }),
  setProgress: (progress) => set({ progress }),
  setQuality: (quality) => set({ quality }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),

  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),

  markCaptionTyped: (id) =>
    set((s) => {
      if (s.typedCaptions.has(id)) return s
      const next = new Set(s.typedCaptions)
      next.add(id)
      return { typedCaptions: next }
    }),

  resetTypedCaptions: () => set({ typedCaptions: new Set<string>() }),

  requestOpen: () => {
    const { state } = get()
    if (state !== 'ready') return
    set({ state: 'opening', locked: true })
  },

  completeOpen: () => set({ state: 'album', locked: false }),

  requestClose: () => {
    if (get().state !== 'album') return
    set({ state: 'closing', locked: true })
  },

  completeClose: () => {
    // Se vuelve al diario cerrado desde cero: al reabrirlo los captions se
    // escriben otra vez, en lugar de aparecer ya tecleados.
    get().resetTypedCaptions()
    set({ state: 'ready', locked: false })
  },

  skipIntro: () => {
    if (get().state !== 'intro') return
    set({ state: 'ready' })
  },
}))

/* Selectores estables: evitan crear una función nueva en cada render. */
export const selectState = (s: ExperienceStore) => s.state
export const selectQuality = (s: ExperienceStore) => s.quality
export const selectReducedMotion = (s: ExperienceStore) => s.reducedMotion
