/**
 * Dimensiones del diario y mapeo de sus texturas.
 *
 * Las tres texturas del diario son 1600×2400 (2:3 exacto), así que coinciden
 * con WIDTH × HEIGHT sin deformación.
 *
 * `front-cover.webp` trae un lomo oscuro pintado en el borde izquierdo. Los
 * valores de recorte de abajo se midieron decodificando la imagen y analizando
 * la luminancia por columna: sin recortarlo aparecerían dos lomos, el pintado y
 * el geométrico. La flor del cierre también viene pintada, y su posición
 * medida es la que usa el pétalo 3D para quedar registrado con su sombra.
 */

export const JOURNAL_HEIGHT = 2.4
export const JOURNAL_WIDTH = 1.6
export const COVER_DEPTH = 0.045
export const PAGE_BLOCK_DEPTH = 0.08

/** Grosor total cerrado: dos tapas + bloque de páginas. */
export const JOURNAL_DEPTH = PAGE_BLOCK_DEPTH + COVER_DEPTH * 2

/** El bloque de páginas es algo menor que las tapas, como en un diario real. */
export const PAGE_INSET_X = 0.045
export const PAGE_INSET_Y = 0.05
export const PAGE_WIDTH = JOURNAL_WIDTH - PAGE_INSET_X
export const PAGE_HEIGHT = JOURNAL_HEIGHT - PAGE_INSET_Y

export const SPINE_WIDTH = 0.11
/** Eje de giro de la tapa: el borde del lomo. */
export const SPINE_X = -JOURNAL_WIDTH / 2

/**
 * Recorte UV que elimina el lomo pintado de front-cover.webp.
 *
 * El análisis de luminancia por columna da dos tramos a la izquierda: el lomo
 * negro hasta u≈0.056 y una franja de bisagra más clara hasta u≈0.083. Hay
 * que recortar las dos: dejando sólo la primera queda una línea clara pegada
 * al canto que se lee como un error de mapeo.
 */
export const FRONT_COVER_UV = {
  offsetX: 0.083,
  repeatX: 0.917,
} as const

/** Flor pintada en la portada, en coordenadas ya recortadas. */
export const CLOSURE_FLOWER = {
  /**
   * Desplazamiento respecto al centro de la tapa, en unidades de mundo.
   * Sale de la posición medida en la textura (u=0.6165) remapeada al recorte:
   * (0.6165 - 0.083) / 0.917 = 0.5818 → (0.5818 - 0.5) * 1.6.
   */
  x: 0.131,
  y: -0.114,
  diameter: 0.319,
  /** Cuánto sobresale de la superficie de la tapa. */
  lift: 0.022,
} as const

/** Radio de bisel de las tapas: suficiente para que el rim light dibuje el canto. */
export const COVER_BEVEL = 0.012
export const BEVEL_SEGMENTS = 3

/**
 * Apertura de la tapa. No llega a 180° para que no atraviese la contratapa:
 * queda un par de grados corta, que además es como se abre un diario real.
 */
export const COVER_OPEN_ANGLE = -Math.PI * 0.965

/** Reclinación del diario al abrirse: de casi vertical a plano sobre la mesa. */
export const JOURNAL_RECLINE_X = -Math.PI / 2

/** Un spread abierto: dos páginas juntas. Aspect 4:3 exacto. */
export const SPREAD_WIDTH = JOURNAL_WIDTH * 2
export const SPREAD_HEIGHT = JOURNAL_HEIGHT

/** Proporción del viewport que ocupa el spread al final de la apertura. */
export const SPREAD_COVERAGE = {
  desktop: 0.78,
  mobile: 0.92,
} as const

/**
 * Proporción del viewport que ocupa el diario cerrado en la pose de reposo.
 *
 * Se usa para derivar la distancia de cámara en vez de fijarla a mano: en un
 * viewport estrecho el diario mide 1.6 de ancho y a una distancia pensada para
 * desktop se sale del encuadre por los lados. Como la restricción que manda
 * cambia de eje según el aspect, la distancia tiene que calcularse.
 */
export const CLOSED_COVERAGE = {
  desktop: 0.7,
  mobile: 0.72,
} as const

export const CAMERA_FOV = 38

/** Pose inicial del diario cerrado: apoyado, no flotando. */
export const JOURNAL_REST_ROTATION = { x: -0.18, y: 0.15, z: -0.03 } as const
