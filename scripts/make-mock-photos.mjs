/**
 * Genera las 4 fotografías mock del álbum.
 *
 * El asset pack no incluye fotos (es el único recurso ausente), y el flujo
 * necesita imágenes reales para validar Polaroid, entrada y typewriter.
 * Se generan duotonos abstractos dentro de la paleta del proyecto: se leen
 * como intención estética, no como placeholder gris, y se reemplazan sin
 * tocar código —basta sustituir el archivo o editar src/data/journal.ts—.
 *
 * El motor de render vive en `scripts/lib/mock-photo.mjs`, compartido con
 * `make-landing-photos.mjs`. Aquí sólo quedan las escenas de este álbum.
 */
import { writeFileSync, rmSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PALETTE,
  SIZE,
  clamp01,
  encodePNG,
  mix,
  render,
  smooth,
  toWebp,
} from './lib/mock-photo.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/photos')

const SCENES = {
  concierto: {
    seed: 11,
    base: (u, v) => {
      const top = mix(PALETTE.bgDeep, PALETTE.violet, smooth(clamp01(v * 1.4)))
      return mix(top, PALETTE.magenta, smooth(clamp01((v - 0.45) * 1.9)))
    },
    lights: [
      { x: 0.5, y: 1.02, r: 0.62, color: PALETTE.hotPink, i: 1.15 },
      { x: 0.2, y: 0.92, r: 0.34, color: PALETTE.electric, i: 0.7 },
      { x: 0.82, y: 0.95, r: 0.32, color: PALETTE.softPink, i: 0.62 },
      { x: 0.5, y: 0.16, r: 0.2, color: PALETTE.cyan, i: 0.16 },
    ],
    // haces de luz de escenario que bajan desde arriba
    beams: [
      { x: 0.28, spread: 0.1, color: PALETTE.hotPink, i: 0.3 },
      { x: 0.62, spread: 0.08, color: PALETTE.electric, i: 0.26 },
      { x: 0.45, spread: 0.13, color: PALETTE.softPink, i: 0.2 },
    ],
    bokeh: 90,
    bokehColor: PALETTE.hotPink,
  },

  atardecer: {
    seed: 27,
    base: (u, v) => {
      if (v < 0.62) {
        const t = smooth(clamp01(v / 0.62))
        return mix(mix(PALETTE.bgMid, PALETTE.violet, 0.5), PALETTE.hotPink, t * 0.92)
      }
      // reflejo en el agua, más oscuro y saturado
      const t = smooth(clamp01((v - 0.62) / 0.38))
      return mix(mix(PALETTE.magenta, PALETTE.softPink, 0.35), PALETTE.bgDeep, t * 0.82)
    },
    lights: [
      { x: 0.5, y: 0.62, r: 0.3, color: PALETTE.paper, i: 0.9 },
      { x: 0.5, y: 0.62, r: 0.72, color: PALETTE.softPink, i: 0.45 },
    ],
    beams: [],
    bokeh: 26,
    bokehColor: PALETTE.paper,
    // bandas horizontales que insinúan ondas
    ripples: true,
  },

  // Sobreexpuesta y cálida: contrapunto luminoso frente a las otras tres,
  // que son escenas nocturnas. Sin este contraste las cuatro Polaroids se
  // leen como la misma foto repetida.
  amigas: {
    seed: 43,
    base: (u, v) => {
      const d = Math.hypot(u - 0.42, v - 0.34)
      const t = smooth(clamp01(d * 1.15))
      return mix(mix(PALETTE.paper, PALETTE.softPink, 0.22), PALETTE.magenta, t * 0.78)
    },
    lights: [
      { x: 0.34, y: 0.24, r: 0.68, color: PALETTE.paper, i: 0.8 },
      { x: 0.72, y: 0.62, r: 0.4, color: PALETTE.softPink, i: 0.42 },
    ],
    beams: [],
    bokeh: 40,
    bokehColor: PALETTE.paper,
    // Halos amplios de lente, típicos del contraluz.
    flare: true,
  },

  // Cielo nocturno: la más oscura de las cuatro, con el destello bajo y
  // pequeño para no repetir el globo central de "atardecer".
  inolvidables: {
    seed: 61,
    base: (u, v) => {
      const t = smooth(clamp01(v * 1.25))
      const sky = mix(PALETTE.bgDeep, PALETTE.violet, t * 0.85)
      // Franja baja en silueta.
      return v > 0.82 ? mix(sky, PALETTE.bgDeep, smooth((v - 0.82) / 0.18)) : sky
    },
    lights: [
      { x: 0.5, y: 0.8, r: 0.44, color: PALETTE.hotPink, i: 0.62 },
      { x: 0.5, y: 0.82, r: 0.12, color: PALETTE.softPink, i: 0.45 },
      { x: 0.78, y: 0.3, r: 0.3, color: PALETTE.electric, i: 0.22 },
    ],
    beams: [],
    bokeh: 22,
    bokehColor: PALETTE.softPink,
    stars: true,
    starCount: 190,
  },
}

const names = Object.keys(SCENES)
let missingEncoder = false

names.forEach((name, idx) => {
  const id = String(idx + 1).padStart(2, '0')
  const png = join(outDir, `photo-${id}.png`)
  const webp = join(outDir, `photo-${id}.webp`)

  writeFileSync(png, encodePNG(SIZE, SIZE, render(SCENES[name])))

  const used = toWebp(png, webp)
  if (used) {
    rmSync(png)
    const kb = Math.round(statSync(webp).size / 1024)
    console.log(`[photos] photo-${id}.webp  ${String(kb).padStart(4)} KB  (${name}, ${used})`)
  } else {
    missingEncoder = true
    console.log(`[photos] photo-${id}.png   (${name}) — sin encoder WebP`)
  }
})

if (missingEncoder) {
  console.warn('[photos] Falta cwebp/sips-webp. Instala `brew install webp` y reejecuta,')
  console.warn('[photos] o actualiza las rutas a .png en src/data/journal.ts.')
}
