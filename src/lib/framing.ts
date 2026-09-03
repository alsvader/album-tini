/**
 * Puente geométrico entre la cámara 3D y el libro DOM.
 *
 * El crossfade WebGL → álbum sólo es invisible si ambos rectángulos coinciden.
 * En vez de ajustar valores a ojo, las dos capas se dimensionan con las mismas
 * funciones: `fitDistance` decide dónde termina la cámara y `projectPlane`
 * traduce esa distancia al tamaño en píxeles que debe tener el libro DOM.
 * Al redimensionar la ventana, ambas siguen coincidiendo por construcción.
 */

const DEG2RAD = Math.PI / 180

export type Size = { width: number; height: number }

/**
 * Distancia a la que un plano `planeW × planeH` ocupa `coverage` del viewport.
 * Se toma el máximo de las dos restricciones para que quepa en ambos ejes.
 */
export function fitDistance(
  fovDeg: number,
  aspect: number,
  planeW: number,
  planeH: number,
  coverage: number,
): number {
  const halfFov = Math.tan((fovDeg * DEG2RAD) / 2)
  const byHeight = planeH / (2 * halfFov * coverage)
  const byWidth = planeW / (2 * halfFov * aspect * coverage)
  return Math.max(byHeight, byWidth)
}

/** Tamaño en píxeles de un plano visto de frente a distancia `distance`. */
export function projectPlane(
  fovDeg: number,
  distance: number,
  viewport: Size,
  planeW: number,
  planeH: number,
): Size {
  const visibleHeight = 2 * distance * Math.tan((fovDeg * DEG2RAD) / 2)
  const pxPerUnit = viewport.height / visibleHeight
  return { width: planeW * pxPerUnit, height: planeH * pxPerUnit }
}

/**
 * Tamaño final del libro DOM.
 *
 * Devuelve el mismo rectángulo que ocupa el spread 3D al terminar la apertura,
 * de modo que el álbum aparece exactamente donde estaba el diario.
 */
export function computeBookSize(
  fovDeg: number,
  viewport: Size,
  planeW: number,
  planeH: number,
  coverage: number,
): Size {
  const aspect = viewport.width / viewport.height
  const distance = fitDistance(fovDeg, aspect, planeW, planeH, coverage)
  return projectPlane(fovDeg, distance, viewport, planeW, planeH)
}
