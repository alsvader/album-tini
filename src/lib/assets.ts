/**
 * Rutas de assets en un único módulo tipado.
 *
 * Se corresponden 1:1 con manifest.json en la raíz del repo. Centralizarlas
 * evita strings sueltos y permite precargar texturas desde un solo sitio.
 */

export const ASSETS = {
  journal: {
    frontCover: '/assets/journal/front-cover.webp',
    backCover: '/assets/journal/back-cover.webp',
    insidePage: '/assets/journal/inside-page.webp',
    closure: '/assets/journal/flower-closure.svg',
  },
  textures: {
    paper: '/assets/textures/paper.webp',
    polaroid: '/assets/textures/polaroid-paper.webp',
    coverNormal: '/assets/textures/cover-normal.png',
  },
  environment: {
    particle: '/assets/environment/particle.png',
    glowMagenta: '/assets/environment/glow-magenta.png',
    glowViolet: '/assets/environment/glow-violet.png',
    sparkle: '/assets/environment/sparkle.png',
  },
} as const

/** Texturas que la escena 3D necesita antes del primer frame. */
export const PRELOAD_TEXTURES: readonly string[] = [
  ASSETS.journal.frontCover,
  ASSETS.journal.backCover,
  ASSETS.journal.insidePage,
  ASSETS.textures.paper,
  ASSETS.textures.coverNormal,
  ASSETS.environment.particle,
  ASSETS.environment.glowMagenta,
  ASSETS.environment.glowViolet,
]

export const PALETTE = {
  deep: '#160019',
  darkViolet: '#290023',
  purple: '#51003F',
  magenta: '#8A006A',
  hotPink: '#FF24E4',
  softPink: '#FF6DB6',
  electric: '#BD00FF',
  cyan: '#00F3FF',
  lime: '#BDED00',
  paper: '#FAF7F4',
  paperWarm: '#F6F0E9',
} as const
