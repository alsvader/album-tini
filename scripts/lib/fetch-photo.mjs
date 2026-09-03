/**
 * Descarga una foto de un banco de imágenes y la recorta a cuadrado en WebP.
 *
 * Sustituye al motor de `mock-photo.mjs` (borrado): las fotos de la landing y
 * del álbum de ejemplo ya no se generan, se eligen a mano de un banco CC0 y se
 * procesan aquí. StockSnap bloquea las descargas sin `User-Agent`/`Referer` de
 * navegador (comprobado); Rawpixel no lo exige, pero se manda igual por
 * simplicidad — un único camino para las dos fuentes.
 *
 * El recorte usa `position: sharp.strategy.attention`: mira dónde está el
 * contenido con más "energía" visual (bordes, saturación) en vez de recortar
 * siempre por el centro geométrico, que en fuentes muy panorámicas o muy
 * verticales suele caer en cielo vacío.
 */
import sharp from 'sharp'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

/**
 * @param {{ url: string, out: string, size: number, quality?: number }} opts
 */
export async function fetchAndCropPhoto({ url, out, size, quality = 82 }) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Referer: 'https://stocksnap.io/' },
  })

  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)

  const buffer = Buffer.from(await res.arrayBuffer())

  return sharp(buffer)
    .resize(size, size, { fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality })
    .toFile(out)
}
