/**
 * Reescalado de fotos en el navegador antes de subirlas.
 *
 * Las fotos de un móvil pesan entre 4 y 8 MB y la Polaroid las muestra en un
 * marco de unos 400 px de lado. Subir el original gastaría el ancho de banda del
 * usuario y el almacenamiento para nada.
 *
 * Se hace en el cliente porque es donde está el archivo y porque así el
 * servidor no tiene que tocar binarios en ningún momento.
 */

export const MAX_EDGE = 1400
const QUALITY = 0.82

export class UnsupportedImageError extends Error {
  constructor(readonly fileName: string) {
    super(`No se pudo leer la imagen "${fileName}"`)
    this.name = 'UnsupportedImageError'
  }
}

/**
 * Decodifica con `createImageBitmap`, que es el camino que soporta más formatos
 * y no requiere insertar nada en el documento.
 *
 * Los HEIC de iPhone son el caso que falla: sólo Safari los decodifica. iOS
 * suele convertirlos a JPEG al elegirlos desde la galería, pero cuando llega un
 * HEIC de verdad hay que avisar en lugar de fallar en silencio.
 */
async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file)
  } catch {
    throw new UnsupportedImageError(file.name)
  }
}

export type ResizedImage = {
  blob: Blob
  width: number
  height: number
}

export async function resizeImage(file: File): Promise<ResizedImage> {
  const bitmap = await decode(file)

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new UnsupportedImageError(file.name)
  }

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY),
  )

  if (!blob) throw new UnsupportedImageError(file.name)

  return { blob, width, height }
}
