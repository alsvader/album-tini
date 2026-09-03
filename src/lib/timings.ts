/**
 * Tiempos de la coreografía, en segundos.
 *
 * Viven en un módulo compartido porque la intro se reparte entre dos capas: el
 * trazo del doodle y los símbolos son DOM (un stroke SVG animado es más nítido
 * y más barato ahí), mientras que las partículas, el glow y la cámara son 3D.
 * Con las marcas en un solo sitio ambas capas cuentan el mismo compás.
 */

export const INTRO = {
  /** Momento 1: oscuridad, entran las partículas. */
  particlesIn: { at: 0.2, duration: 1.4 },
  /** Momento 2: el doodle se dibuja solo. */
  doodleDraw: { at: 0.9, duration: 1.5 },
  /** Momento 3: aparecen los símbolos alrededor. */
  symbolsIn: { at: 1.9, duration: 1.0 },
  /** Momento 4: se enciende la luz magenta y se revela el diario. */
  journalReveal: { at: 2.3, duration: 1.3 },
  cameraDolly: { at: 2.1, duration: 2.1 },
  /**
   * Momento 5: micro-rotación y llamada a la acción.
   *
   * La rotación va en yoyo, así que ocupa el doble de `duration`. El valor
   * está elegido para que `at + duration * 2` caiga justo en `total`: si se
   * pasa, la intro dura más de lo que dice esta constante y la llamada a la
   * acción aparece tarde.
   */
  microRotation: { at: 3.7, duration: 0.55 },
  ctaIn: { at: 4.1, duration: 0.8 },
  /** Fin de la intro: el diario queda interactivo. */
  total: 4.8,
} as const

export const OPENING = {
  /** La cámara se acerca antes de que la tapa se mueva. */
  cameraApproach: { at: 0, duration: 0.55 },
  /** El diario endereza su inclinación y se recuesta. */
  recline: { at: 0.25, duration: 1.35 },
  /** Giro de la tapa desde el lomo. */
  cover: { at: 0.35, duration: 1.4 },
  /** Ascenso a vista cenital. */
  cameraOverhead: { at: 0.55, duration: 1.5 },
  /** Las páginas interiores aparecen cuando ya se ven. */
  pagesReveal: { at: 1.25, duration: 0.7 },
  total: 2.15,
} as const

/** Crossfade 3D → álbum DOM, en milisegundos. */
export const HANDOFF = {
  crossfadeMs: 650,
  /** Margen antes de desmontar el Canvas y liberar la GPU. */
  unmountDelayMs: 950,
} as const

/**
 * Cierre del diario: el camino inverso, del álbum al libro cerrado.
 *
 * El relevo de capas va dentro de esta misma línea de tiempo, no aparte, para
 * que la capa DOM y la 3D no tengan que coordinarse por su cuenta.
 *
 * `cover` arranca después de `handoff` a propósito: si la tapa empezara a girar
 * en el instante 0, el álbum DOM seguiría en pantalla mientras la escena de
 * debajo ya se ha movido, y el relevo destaparía una tapa a medio cerrar.
 */
export const CLOSING = {
  /** Relevo inverso: el álbum DOM se va y reaparece la escena 3D. */
  handoff: { at: 0, duration: 0.55 },
  /** La tapa gira hasta cerrarse. */
  cover: { at: 0.5, duration: 1.2 },
  /** El diario recupera su inclinación de reposo. */
  standUp: { at: 0.85, duration: 1.25 },
  /** La cámara vuelve de la vista cenital a la de tres cuartos. */
  cameraBack: { at: 0.6, duration: 1.5 },
  /** La página interior se oculta cuando la tapa ya la cubre. */
  pagesHide: { at: 1.2 },
  total: 2.25,
} as const

/**
 * Cierre sin animación 3D, para el tier de calidad `low`.
 *
 * Ahí el Canvas se desmonta al entrar al álbum para liberar la GPU, así que no
 * queda estado 3D que invertir: el álbum funde a fondo y la escena reaparece ya
 * cerrada.
 */
export const CLOSING_FADE = { outMs: 380, inMs: 480 } as const

/** Versión reducida para prefers-reduced-motion. */
export const REDUCED = {
  openingTotal: 0.45,
  closingTotal: 0.4,
  crossfadeMs: 220,
} as const
