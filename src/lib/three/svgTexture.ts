/**
 * Convierte el path de un doodle en textura para sprites de Three.js.
 *
 * Los doodles se dibujan con Path2D sobre un canvas en vez de cargarlos con
 * SVGLoader: los SVG del pack son un único trazo, así que generar shapes 3D
 * sería mucho coste para un elemento que siempre se ve de frente y a pequeño
 * tamaño. Con canvas se obtiene un trazo nítido, tintable y con una sola
 * llamada de dibujo por doodle.
 *
 * Las texturas se cachean por (doodle, color, tamaño): la escena reutiliza el
 * mismo doodle varias veces y no tiene sentido rasterizarlo dos veces.
 */

import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'
import type { DoodleShape } from '@/data/doodles.generated'

const cache = new Map<string, Texture>()

type Options = {
  color?: string
  /** Lado de la textura en píxeles. Potencia de dos. */
  size?: number
  /** Multiplicador del grosor original del trazo. */
  strokeScale?: number
  /** Halo suave alrededor del trazo, para que el doodle brille en la escena. */
  glow?: boolean
}

export function doodleTexture(
  shape: DoodleShape,
  { color = '#FF6DB6', size = 256, strokeScale = 1, glow = true }: Options = {},
): Texture | null {
  if (typeof document === 'undefined') return null

  const key = `${shape.name}|${color}|${size}|${strokeScale}|${glow}`
  const cached = cache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Padding para que el glow y los extremos redondeados no se recorten.
  const padding = size * 0.12
  const scale = (size - padding * 2) / Math.max(shape.width, shape.height)

  ctx.translate(padding, padding)
  ctx.scale(scale, scale)

  ctx.strokeStyle = color
  ctx.lineWidth = shape.strokeWidth * strokeScale
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (glow) {
    ctx.shadowColor = color
    ctx.shadowBlur = (size * 0.05) / scale
  }

  for (const d of shape.paths) {
    ctx.stroke(new Path2D(d))
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true

  cache.set(key, texture)
  return texture
}

/** Libera las texturas cacheadas. Sólo en teardown / hot reload. */
export function disposeDoodleTextures(): void {
  for (const texture of cache.values()) texture.dispose()
  cache.clear()
}
