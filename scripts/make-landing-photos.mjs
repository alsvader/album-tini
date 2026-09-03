/**
 * Imágenes decorativas de la landing.
 *
 * Dos trabajos:
 *
 * 1. ESCENAS — las fotografías de las Polaroids de adorno que no tienen
 *    equivalente en el álbum de ejemplo. Se generan con el mismo motor que las
 *    fotos de la demo (`scripts/lib/mock-photo.mjs`), así que salen dentro de la
 *    paleta y se leen como intención estética, no como placeholder.
 *
 *    Por qué se generan en vez de descargarse: el diseño de Stitch traía 14
 *    placeholders en `lh3.googleusercontent.com/aida-public/…`, y esas URLs ya
 *    no sirven las imágenes originales —las 14 devuelven el mismo archivo, el
 *    board de dirección de arte del proyecto—. Depender de esa CDN habría dejado
 *    el repo con un asset irreproducible; el generador es reproducible siempre.
 *
 *    Sólo hay cuatro escenas aquí. Las Polaroids que en el diseño llevan los
 *    captions «Nuestro concierto», «Atardecer mágico», «Mejores amigas» y
 *    «Momentos inolvidables» usan las fotos reales de `journalEntries`: son esos
 *    mismos recuerdos, y así lo que se ve en la landing es lo que el usuario va
 *    a obtener. Ver `src/data/landing.ts`.
 *
 * 2. RECORTES — versiones al tamaño de render de los assets reales del diario.
 *    `front-cover.webp` pesa 599 KB a 1600x2400 porque el libro 3D lo usa como
 *    textura; la landing lo pinta en una franja de 320x128 y en una miniatura de
 *    224px. Servir el original serían ~700 KB de la primera pantalla para dos
 *    adornos, y era el peso dominante de la página.
 *
 * No se engancha a `predev`/`prebuild`: los WebP resultantes se versionan y
 * regenerarlos es raro. `npm run assets:landing`, idempotente.
 */

import { mkdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { PALETTE, SIZE, clamp01, encodePNG, mix, render, smooth } from './lib/mock-photo.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public/assets/landing')
const JOURNAL_DIR = join(ROOT, 'public/assets/journal')

/**
 * Escenas nuevas, deliberadamente distintas de las cuatro del álbum
 * (concierto = haces de escenario, atardecer = sol sobre agua, amigas =
 * sobreexpuesta cálida, inolvidables = cielo nocturno). Si se parecieran, la
 * constelación del hero se leería como la misma foto repetida seis veces.
 */
const SCENES = {
  // «Primera escapada»: carretera al anochecer. La estructura es una línea de
  // horizonte, que ninguna otra escena tiene.
  escapada: {
    seed: 83,
    base: (u, v) => {
      const horizon = 0.54
      if (v < horizon) {
        const t = smooth(clamp01(v / horizon))
        return mix(mix(PALETTE.bgDeep, PALETTE.electric, 0.28), PALETTE.magenta, t * 0.9)
      }
      const t = smooth(clamp01((v - horizon) / (1 - horizon)))
      return mix(mix(PALETTE.violet, PALETTE.magenta, 0.3), PALETTE.bgDeep, t * 0.95)
    },
    lights: [
      { x: 0.5, y: 0.54, r: 0.42, color: PALETTE.softPink, i: 0.72 },
      { x: 0.18, y: 0.5, r: 0.24, color: PALETTE.cyan, i: 0.22 },
      { x: 0.86, y: 0.58, r: 0.2, color: PALETTE.hotPink, i: 0.3 },
    ],
    beams: [],
    bokeh: 18,
    bokehColor: PALETTE.softPink,
  },

  // «Aquella tarde»: luz de ventana en interior. Cálida, de bajo contraste y
  // con la fuente en una esquina, no centrada.
  tarde: {
    seed: 97,
    base: (u, v) => {
      const d = Math.hypot(u - 0.12, v - 0.1)
      const t = smooth(clamp01(d * 0.95))
      return mix(mix(PALETTE.paper, PALETTE.softPink, 0.34), PALETTE.violet, t * 0.86)
    },
    lights: [
      { x: 0.1, y: 0.08, r: 0.72, color: PALETTE.paper, i: 0.62 },
      { x: 0.62, y: 0.74, r: 0.34, color: PALETTE.softPink, i: 0.24 },
    ],
    beams: [],
    bokeh: 12,
    bokehColor: PALETTE.paper,
  },

  // «Risadas sin fin»: destellos dispersos, sin una fuente dominante. Es la
  // escena con más bokeh de todas, y eso es lo que la distingue.
  risas: {
    seed: 113,
    base: (u, v) => {
      const t = smooth(clamp01(Math.hypot(u - 0.5, v - 0.55) * 1.25))
      return mix(mix(PALETTE.violet, PALETTE.hotPink, 0.22), PALETTE.bgDeep, t * 0.8)
    },
    lights: [
      { x: 0.3, y: 0.36, r: 0.28, color: PALETTE.electric, i: 0.42 },
      { x: 0.72, y: 0.6, r: 0.26, color: PALETTE.hotPink, i: 0.4 },
    ],
    beams: [],
    bokeh: 150,
    bokehColor: PALETTE.softPink,
  },

  // «Abrazos eternos»: contraluz con dos halos juntos y bajos en el cuadro,
  // que insinúan dos siluetas.
  abrazos: {
    seed: 131,
    base: (u, v) => {
      const t = smooth(clamp01(v * 1.15))
      return mix(mix(PALETTE.bgMid, PALETTE.magenta, 0.42), PALETTE.violet, t * 0.7)
    },
    lights: [
      { x: 0.42, y: 0.7, r: 0.3, color: PALETTE.paper, i: 0.5 },
      { x: 0.58, y: 0.72, r: 0.28, color: PALETTE.softPink, i: 0.52 },
      { x: 0.5, y: 0.72, r: 0.66, color: PALETTE.hotPink, i: 0.3 },
    ],
    beams: [],
    bokeh: 34,
    bokehColor: PALETTE.paper,
  },
}

/**
 * Lado del cuadrado final. El motor rinde a 1080 y aquí se baja a 640, que es
 * 2x el render real (~300px): lo que necesita una pantalla retina y nada más.
 */
const TARGET = 640

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

async function makeScene(name, scene) {
  const out = join(OUT_DIR, `${name}.webp`)
  if (await exists(out)) {
    console.log(`  · ${name}.webp ya existe, se salta`)
    return
  }

  const png = encodePNG(SIZE, SIZE, render(scene))
  const info = await sharp(png).resize(TARGET, TARGET).webp({ quality: 80 }).toFile(out)

  console.log(`  ✓ ${name}.webp  ${info.width}x${info.height}  ${kb(info.size)}`)
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

console.log('Escenas decorativas:')
for (const [name, scene] of Object.entries(SCENES)) await makeScene(name, scene)

console.log('\nRecortes de los assets del diario:')
for (const item of DERIVED) await derive(item)

console.log('\nListo. Los archivos van a public/assets/landing/.')
