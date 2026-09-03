/**
 * Motor de las fotografías mock: encoder PNG propio sobre zlib, helpers de
 * color y el bucle de render de una «escena».
 *
 * Vive aparte porque lo comparten dos generadores: `make-mock-photos.mjs`
 * (las 4 fotos del álbum de ejemplo) y `make-landing-photos.mjs` (las
 * decorativas de la landing). Antes estaba dentro del primero; se extrajo tal
 * cual, sin cambiar una sola constante, para que las fotos de la demo salgan
 * byte a byte idénticas.
 *
 * Una «escena» es un objeto con `seed`, `base(u, v)` y listas opcionales de
 * `lights`, `beams`, `bokeh`, `stars`, `flare` y `ripples`. La firma uniforme
 * es lo que permite un único bucle de render para todas.
 */
import { execFileSync } from 'node:child_process'
import { deflateSync } from 'node:zlib'

export const SIZE = 1080

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

export const encodePNG = (width, height, rgb) => {
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

export const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]
export const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smooth = (t) => t * t * (3 - 2 * t)

// PRNG determinista: las fotos deben ser idénticas en cada ejecución.
const rng = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 0x100000000
}

export const PALETTE = {
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


export const render = (scene) => {
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
export const toWebp = (png, webp) => {
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

