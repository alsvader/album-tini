/**
 * Descarga las 4 fotografías del álbum de ejemplo.
 *
 * Antes eran duotonos abstractos generados a mano (el asset pack no incluía
 * fotos). Ahora son fotos reales de banco, elegidas para encajar con el `alt`
 * que ya tenía cada una en `src/data/journal.ts` — ese archivo no cambia: solo
 * el contenido de `public/photos/photo-0N.webp`.
 *
 * Todas CC0 (dominio público, sin atribución) vía Openverse
 * (api.openverse.org), indexando StockSnap y Rawpixel.
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchAndCropPhoto } from './lib/fetch-photo.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/photos')

/** El mayor tamaño servido por las CDN de miniaturas de estos bancos sin API key. */
const SIZE = 960

const PHOTOS = [
  {
    id: '01',
    // «Luces de escenario en magenta y violeta sobre el público»
    url: 'https://cdn.stocksnap.io/img-thumbs/960w/4CNNMKE9IQ.jpg',
    credit: 'StockSnap — "Concert Festival" (CC0)',
  },
  {
    id: '02',
    // «Un atardecer rosa reflejado sobre el agua»
    url: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azQ4NzM3MjQ4LXdpa2ltZWRpYS1pbWFnZS1rb3dtYjV6Mi5qcGc.jpg',
    credit: 'Rawpixel — "Tropical pink purple sunset beach" (CC0)',
  },
  {
    id: '03',
    // «Luz suave y cálida en tonos rosados»
    url: 'https://cdn.stocksnap.io/img-thumbs/960w/D16SOCLVID.jpg',
    credit: 'StockSnap — "Abstract Background" (CC0)',
  },
  {
    id: '04',
    // «Un destello rosa rodeado de estrellas»
    url: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azYxNzY0NDI0LXdpa2ltZWRpYS1pbWFnZS1rb3diamU3ay5qcGc.jpg',
    credit: 'Rawpixel — "Pink fireworks city night" (CC0)',
  },
]

await mkdir(outDir, { recursive: true })

for (const { id, url, credit } of PHOTOS) {
  const out = join(outDir, `photo-${id}.webp`)
  const info = await fetchAndCropPhoto({ url, out, size: SIZE })
  console.log(
    `[photos] photo-${id}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB  — ${credit}`,
  )
}
