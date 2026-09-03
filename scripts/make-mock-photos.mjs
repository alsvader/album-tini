/**
 * Genera las 4 fotografías mock del álbum.
 *
 * El asset pack no incluye fotos (es el único recurso ausente), y el flujo
 * necesita imágenes reales para validar Polaroid, entrada y typewriter.
 * Se generan duotonos abstractos dentro de la paleta del proyecto: se leen
 * como intención estética, no como placeholder gris, y se reemplazan sin
 * tocar código —basta sustituir el archivo o editar src/data/journal.ts—.
 *
 * Sin dependencias: encoder PNG propio sobre zlib + conversión a WebP con sips.
 */
import { writeFileSync, rmSync, statSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/photos')
const SIZE = 1080

/* ---------- encoder PNG mínimo ---------- */

const crcTable = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

const crc32 = (buf) => {
  let c = -1
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const encodePNG = (width, height, rgb) => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // truecolor
  const stride = width * 3
  const raw = Buffer.alloc(height * (stride + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ---------- helpers de composición ---------- */

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]
const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (t) => t * t * (3 - 2 * t)

// PRNG determinista: las fotos deben ser idénticas en cada ejecución.
const rng = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 0x100000000
}

const PALETTE = {
  bgDeep: hex('#160019'),
  bgMid: hex('#290023'),
  violet: hex('#51003F'),
  magenta: hex('#8A006A'),
  hotPink: hex('#FF24E4'),
  softPink: hex('#FF6DB6'),
  electric: hex('#BD00FF'),
  cyan: hex('#00F3FF'),
  paper: hex('#FAF7F4'),
}

/**
 * Cada escena devuelve un color base por píxel (u,v normalizados) y una lista
 * de luces aditivas. Mantener la firma uniforme permite un único bucle de render.
 */
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

const render = (scene) => {
  const rand = rng(scene.seed)
  const buf = Buffer.alloc(SIZE * SIZE * 3)

  // bokeh precalculado: discos suaves de radio y opacidad variables
  const bokeh = Array.from({ length: scene.bokeh }, () => ({
    x: rand(),
    y: rand(),
    r: 0.006 + rand() * rand() * 0.055,
    a: 0.05 + rand() * 0.3,
  }))

  const stars = scene.stars
    ? Array.from({ length: scene.starCount ?? 70 }, () => ({
        x: rand(),
        // Concentradas en la mitad superior: abajo está la silueta.
        y: rand() * 0.8,
        a: 0.2 + rand() * 0.8,
      }))
    : []

  const flares = scene.flare
    ? Array.from({ length: 5 }, (_, i) => ({
        x: 0.34 + (i + 1) * 0.11,
        y: 0.24 + (i + 1) * 0.1,
        r: 0.05 + rand() * 0.07,
        a: 0.1 + rand() * 0.14,
      }))
    : []

  for (let y = 0; y < SIZE; y++) {
    const v = y / (SIZE - 1)
    for (let x = 0; x < SIZE; x++) {
      const u = x / (SIZE - 1)
      let [r, g, b] = scene.base(u, v)

      for (const l of scene.lights) {
        const d = Math.hypot(u - l.x, v - l.y) / l.r
        if (d < 1) {
          const f = Math.pow(1 - d, 2.2) * l.i
          r += l.color[0] * f
          g += l.color[1] * f
          b += l.color[2] * f
        }
      }

      for (const bm of scene.beams) {
        // el haz se abre hacia abajo
        const w = bm.spread * (0.25 + v * 1.75)
        const d = Math.abs(u - bm.x) / w
        if (d < 1) {
          const f = Math.pow(1 - d, 2) * bm.i * (1 - v * 0.45)
          r += bm.color[0] * f
          g += bm.color[1] * f
          b += bm.color[2] * f
        }
      }

      for (const p of bokeh) {
        const d = Math.hypot(u - p.x, v - p.y) / p.r
        if (d < 1) {
          const f = Math.pow(1 - d, 1.5) * p.a
          r += scene.bokehColor[0] * f
          g += scene.bokehColor[1] * f
          b += scene.bokehColor[2] * f
        }
      }

      // Halos de lente en cadena, hacia el lado opuesto de la fuente.
      for (const fl of flares) {
        const d = Math.hypot(u - fl.x, v - fl.y) / fl.r
        if (d < 1) {
          const w = Math.pow(1 - d, 2) * fl.a
          r += PALETTE.paper[0] * w
          g += PALETTE.softPink[1] * w
          b += PALETTE.paper[2] * w
        }
      }

      for (const s of stars) {
        const d = Math.hypot(u - s.x, v - s.y) / 0.0035
        if (d < 1) {
          const f = (1 - d) * s.a
          r += 250 * f
          g += 235 * f
          b += 255 * f
        }
      }

      if (scene.ripples && v > 0.62) {
        const f = Math.sin(v * 190) * 9 * (1 - (v - 0.62) / 0.38)
        r += f
        g += f * 0.55
        b += f * 0.8
      }

      // viñeteado
      const vig = 1 - Math.pow(Math.hypot(u - 0.5, v - 0.5) * 1.32, 2.4) * 0.5
      r *= vig
      g *= vig
      b *= vig

      // grano fotográfico
      const n = (rand() - 0.5) * 13
      const i = (y * SIZE + x) * 3
      buf[i] = Math.max(0, Math.min(255, r + n))
      buf[i + 1] = Math.max(0, Math.min(255, g + n))
      buf[i + 2] = Math.max(0, Math.min(255, b + n))
    }
  }
  return buf
}

/**
 * Conversión a WebP. Se intenta cwebp (mejor calidad/peso) y luego sips.
 * Si no hay ninguno se deja el PNG y se avisa: el WebP resultante se versiona,
 * así que esta cadena sólo hace falta al regenerar las fotos.
 */
const toWebp = (png, webp) => {
  const tries = [
    ['cwebp', ['-q', '82', '-m', '6', '-quiet', png, '-o', webp]],
    ['sips', ['-s', 'format', 'webp', '-s', 'formatOptions', '82', png, '--out', webp]],
  ]
  for (const [bin, args] of tries) {
    try {
      execFileSync(bin, args, { stdio: 'ignore' })
      return bin
    } catch {
      /* siguiente */
    }
  }
  return null
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
