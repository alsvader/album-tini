/**
 * Extrae los `d` de /public/assets/doodles/*.svg a un módulo TypeScript.
 *
 * Motivo: el mismo trazo se usa en dos sitios muy distintos —inline en el DOM
 * (para animar stroke-dashoffset) y como Path2D sobre un canvas para generar
 * texturas de sprites en Three.js—. Extraerlo en build deja al SVG como única
 * fuente de verdad y evita copiar path data a mano.
 *
 * Se ejecuta en predev/prebuild. La salida está gitignorada.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svgDir = join(root, 'public/assets/doodles')
const outFile = join(root, 'src/data/doodles.generated.ts')

const toCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())

const num = (attrs, name, fallback = 0) => {
  const match = attrs.match(new RegExp(`${name}="([^"]+)"`))
  return match ? Number(match[1]) : fallback
}

/**
 * Convierte `<circle>` y `<ellipse>` en datos de path.
 *
 * Hace falta porque los consumidores dibujan sólo paths: inline en el DOM para
 * animar el trazo, y con `Path2D` sobre canvas para las texturas de la escena
 * 3D. Sin esta conversión se perdían la lente de la cámara, el centro de la
 * flor y —lo más visible— las dos cabezas de la nota musical, que quedaba
 * reducida a dos palos.
 *
 * Dos arcos de media vuelta cada uno: es la forma de describir una elipse
 * cerrada con `A`, porque un solo arco de 360° es degenerado y no se dibuja.
 */
const shapeToPath = (tag, attrs) => {
  if (tag === 'circle') {
    const cx = num(attrs, 'cx')
    const cy = num(attrs, 'cy')
    const r = num(attrs, 'r')
    if (!r) return null
    return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`
  }

  if (tag === 'ellipse') {
    const cx = num(attrs, 'cx')
    const cy = num(attrs, 'cy')
    const rx = num(attrs, 'rx')
    const ry = num(attrs, 'ry')
    if (!rx || !ry) return null
    return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`
  }

  return null
}

const files = (await readdir(svgDir)).filter((f) => f.endsWith('.svg')).sort()

const entries = []
for (const file of files) {
  const svg = await readFile(join(svgDir, file), 'utf8')

  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 100 100'
  const strokeWidth = Number(svg.match(/stroke-width="([^"]+)"/)?.[1] ?? 5)
  /*
   * Se recorren los elementos en el orden del documento, no primero los paths y
   * luego el resto: en `flower.svg` el círculo del centro va antes que los
   * pétalos, y el orden decide qué queda encima al dibujar.
   */
  const paths = []

  for (const match of svg.matchAll(/<(path|circle|ellipse)\b([^>]*)>/g)) {
    const [, tag, attrs] = match

    if (tag === 'path') {
      const d = attrs.match(/\sd="([^"]+)"/)?.[1]
      if (d) paths.push(d)
      continue
    }

    const converted = shapeToPath(tag, attrs)
    if (converted) paths.push(converted)
    else console.warn(`[doodles] ${file}: <${tag}> sin dimensiones utilizables, se omite`)
  }

  if (paths.length === 0) {
    console.warn(`[doodles] ${file} no tiene geometría reconocible, se omite`)
    continue
  }

  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number)

  entries.push({
    key: toCamel(basename(file, '.svg')),
    name: basename(file, '.svg'),
    viewBox,
    width: vbW,
    height: vbH,
    strokeWidth,
    paths,
  })
}

const body = entries
  .map(
    (e) => `  ${e.key}: {
    name: '${e.name}',
    viewBox: '${e.viewBox}',
    width: ${e.width},
    height: ${e.height},
    strokeWidth: ${e.strokeWidth},
    paths: [
${e.paths.map((p) => `      '${p.replace(/'/g, "\\'")}',`).join('\n')}
    ],
  },`,
  )
  .join('\n')

const out = `// AUTOGENERADO por scripts/extract-doodles.mjs — no editar a mano.
// Fuente: public/assets/doodles/*.svg

export type DoodleShape = {
  readonly name: string
  readonly viewBox: string
  readonly width: number
  readonly height: number
  readonly strokeWidth: number
  readonly paths: readonly string[]
}

export const DOODLES = {
${body}
} as const satisfies Record<string, DoodleShape>

export type DoodleName = keyof typeof DOODLES

export const DOODLE_NAMES = Object.keys(DOODLES) as readonly DoodleName[]
`

await writeFile(outFile, out, 'utf8')
console.log(`[doodles] ${entries.length} doodles → src/data/doodles.generated.ts`)
