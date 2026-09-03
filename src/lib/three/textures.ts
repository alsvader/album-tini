/**
 * Ayudas de configuración de texturas.
 *
 * three no asigna espacio de color al cargar: los mapas de color deben marcarse
 * como sRGB o la escena sale lavada, y los normal maps deben quedarse lineales
 * o el relieve se calcula mal. Se centraliza para no olvidarlo en cada material.
 */

import {
  ClampToEdgeWrapping,
  LinearSRGBColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from 'three'

/** Marca una textura como mapa de color. Muta y devuelve la misma instancia. */
export function asColorMap(texture: Texture): Texture {
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

/** Marca una textura como mapa de datos (normal, roughness…). */
export function asDataMap(texture: Texture): Texture {
  texture.colorSpace = LinearSRGBColorSpace
  texture.needsUpdate = true
  return texture
}

/**
 * Clona una textura para poder recortarla sin afectar a los demás usuarios.
 *
 * `useTexture` cachea por URL, así que mutar offset/repeat sobre el original
 * cambiaría también la portada de cualquier otro material que la comparta.
 * El clon comparte el bitmap en GPU, de modo que el coste es despreciable.
 */
export function cropped(
  texture: Texture,
  { offsetX = 0, offsetY = 0, repeatX = 1, repeatY = 1 } = {},
): Texture {
  const clone = texture.clone()
  clone.wrapS = repeatX < 0 ? RepeatWrapping : ClampToEdgeWrapping
  clone.wrapT = repeatY < 0 ? RepeatWrapping : ClampToEdgeWrapping
  clone.offset.set(offsetX, offsetY)
  clone.repeat.set(repeatX, repeatY)
  clone.colorSpace = SRGBColorSpace
  clone.needsUpdate = true
  return clone
}

/** Textura de papel en modo tile, para las hojas y el interior de las tapas. */
export function tiled(texture: Texture, repeat = 1): Texture {
  const clone = texture.clone()
  clone.wrapS = RepeatWrapping
  clone.wrapT = RepeatWrapping
  clone.repeat.set(repeat, repeat)
  clone.colorSpace = SRGBColorSpace
  clone.needsUpdate = true
  return clone
}
