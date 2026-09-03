/**
 * Imágenes decorativas de la landing.
 *
 * Dos trabajos:
 *
 * 1. FOTOS — las fotografías de las Polaroids de adorno que no tienen
 *    equivalente en el álbum de ejemplo. Son fotos reales de banco (CC0, vía
 *    Openverse/StockSnap/Rawpixel), elegidas para encajar con el `alt` que ya
 *    tenía cada una en `src/data/landing.ts` — ese archivo no cambia: solo el
 *    contenido de estos `.webp`.
 *
 *    Antes eran duotonos abstractos generados a mano, porque el diseño de
 *    Stitch traía 14 placeholders en `lh3.googleusercontent.com/aida-public/…`
 *    y esas URLs dejaron de servir las imágenes originales (las 14 devuelven
 *    hoy el mismo archivo, el board de dirección de arte del proyecto).
 *
 *    Sólo hay cuatro aquí. Las Polaroids que en el diseño llevan los captions
 *    «Nuestro concierto», «Atardecer mágico», «Mejores amigas» y «Momentos
 *    inolvidables» usan las fotos reales de `journalEntries` (ver
 *    `scripts/fetch-demo-photos.mjs`): son esos mismos recuerdos, y así lo que
 *    se ve en la landing es lo que el usuario va a obtener. Ver
 *    `src/data/landing.ts`.
 *
 * 2. RECORTES — versiones al tamaño de render de los assets reales del diario.
 *    `front-cover.webp` pesa 599 KB a 1600x2400 porque el libro 3D lo usa como
 *    textura; la landing lo pinta en una franja de 320x128 y en una miniatura de
 *    224px. Servir el original serían ~700 KB de la primera pantalla para dos
 *    adornos, y era el peso dominante de la página.
 *
 * No se engancha a `predev`/`prebuild`: depende de la red, y los WebP
 * resultantes se versionan — regenerarlos es raro. `npm run assets:landing`.
 */

import { mkdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { fetchAndCropPhoto } from './lib/fetch-photo.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public/assets/landing')
const JOURNAL_DIR = join(ROOT, 'public/assets/journal')

/**
 * Lado del cuadrado final. 2x el ~300px al que se pinta el marco de la
 * Polaroid en la landing: lo que necesita una pantalla retina y nada más.
 */
const TARGET = 640

const PHOTOS = [
  {
    name: 'escapada',
    // «Un horizonte rosa al anochecer»
    url: 'https://cdn.stocksnap.io/img-thumbs/960w/FH74ALZDEY.jpg',
    credit: 'StockSnap — "Sunset Pink" (CC0)',
  },
  {
    name: 'tarde',
    // «Luz cálida de ventana en tonos rosados»
    url: 'https://cdn.stocksnap.io/img-thumbs/960w/NHSJ4SS96L.jpg',
    credit: 'StockSnap — "Window Interior" (CC0)',
  },
  {
    name: 'risas',
    // «Destellos rosados desenfocados»
    url: 'https://cdn.stocksnap.io/img-thumbs/960w/MU2LLC4MRM.jpg',
    credit: 'StockSnap — "Bokeh Abstract" (CC0)',
  },
  {
    name: 'abrazos',
    // «Dos halos de luz cálida en contraluz»
    url: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZnJsb3ZlX3N1bnNldF90b2dldGhlcl8xNzc3ODUtaW1hZ2Uta3liZGE4Z3UuanBn.jpg',
    credit: 'Rawpixel — "Couple love, background photo" (CC0)',
  },
]

/** Recortes de los assets reales del diario, al tamaño en que se pintan. */
const DERIVED = [
  {
    name: 'journal-peek',
    from: 'front-cover.webp',
    // En el hero sólo se asoma el borde superior del libro: franja de arriba.
    pipeline: (image) =>
      image
        .extract({ left: 0, top: 0, width: 1600, height: 640 })
        .resize(640, 256, { fit: 'cover' }),
  },
  {
    name: 'journal-cover-sm',
    from: 'front-cover.webp',
    // La portada completa, a 2x del render de 224px de ancho.
    pipeline: (image) => image.resize(448, 672, { fit: 'cover' }),
  },
  {
    name: 'journal-page',
    from: 'inside-page.webp',
    // Textura de las dos hojas del pliego abierto de «Se abre, se pasa, se cierra».
    pipeline: (image) => image.resize(640, 960, { fit: 'cover' }),
  },
]

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function fetchPhoto({ name, url, credit }) {
  const out = join(OUT_DIR, `${name}.webp`)
  const info = await fetchAndCropPhoto({ url, out, size: TARGET, quality: 80 })
  console.log(`  ✓ ${name}.webp  ${info.width}x${info.height}  ${kb(info.size)}  — ${credit}`)
}

async function derive({ name, from, pipeline }) {
  const out = join(OUT_DIR, `${name}.webp`)
  if (await exists(out)) {
    console.log(`  · ${name}.webp ya existe, se salta`)
    return
  }

  const source = join(JOURNAL_DIR, from)
  const before = (await stat(source)).size
  const info = await pipeline(sharp(source)).webp({ quality: 82 }).toFile(out)

  console.log(
    `  ✓ ${name}.webp  ${info.width}x${info.height}  ${kb(info.size)}  (desde ${from}, ${kb(before)})`,
  )
}

await mkdir(OUT_DIR, { recursive: true })

console.log('Fotos decorativas:')
for (const photo of PHOTOS) await fetchPhoto(photo)

console.log('\nRecortes de los assets del diario:')
for (const item of DERIVED) await derive(item)

console.log('\nListo. Los archivos van a public/assets/landing/.')
