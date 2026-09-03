/**
 * Paginación del álbum: convierte entradas en páginas y en hojas de libro.
 *
 * Modelo de libro real: una *hoja* física tiene dos caras. La cara frontal
 * (recto) es la página derecha de un spread, y su reverso (verso) es la página
 * izquierda del spread siguiente. Modelarlo así es lo que permite que el flip
 * de desktop gire una hoja y descubra dos páginas nuevas a la vez.
 *
 * Funciones puras y sin dependencias de React: fáciles de razonar y de testear.
 */

import type { DoodleName } from './doodles.generated'
import { DOODLE_NAMES } from './doodles.generated'
import type { JournalEntry } from './journal'

/**
 * Textos propios de cada álbum: portadilla y cierre.
 *
 * Van como parámetro y no leídos de un módulo porque la misma experiencia
 * muestra álbumes distintos: el de ejemplo y los que crea cada usuario.
 */
export type AlbumMeta = {
  title: string
  subtitle: string
  closing: string
}

/** Todo lo que la experiencia necesita para renderizar un álbum. */
export type AlbumData = {
  entries: readonly JournalEntry[]
  meta: AlbumMeta
}

export type JournalPageContent =
  | { kind: 'title'; id: string; title: string; subtitle: string }
  | { kind: 'photo'; id: string; entry: JournalEntry }
  | { kind: 'closing'; id: string; text: string }
  | { kind: 'blank'; id: string }

export type Leaf = {
  index: number
  /** Página derecha del spread `index`. */
  front: JournalPageContent
  /** Página izquierda del spread `index + 1`. */
  back: JournalPageContent
}

export type Spread = {
  index: number
  left: JournalPageContent
  right: JournalPageContent
}

/**
 * Secuencia lineal de páginas: portadilla → fotos → cierre, rellenando con
 * una página en blanco si hace falta para cerrar la última hoja.
 */
export function buildPages(
  entries: readonly JournalEntry[],
  meta: AlbumMeta,
): readonly JournalPageContent[] {
  const pages: JournalPageContent[] = [
    {
      kind: 'title',
      id: 'title',
      title: meta.title,
      subtitle: meta.subtitle,
    },
    ...entries.map(
      (entry): JournalPageContent => ({ kind: 'photo', id: `photo-${entry.id}`, entry }),
    ),
    { kind: 'closing', id: 'closing', text: meta.closing },
  ]

  // Las hojas necesitan un número par de páginas.
  if (pages.length % 2 !== 0) pages.push({ kind: 'blank', id: 'blank-end' })

  return pages
}

/**
 * Spreads de doble página para desktop.
 *
 * El spread 0 muestra sólo la página derecha (como al abrir un libro por la
 * portada), de ahí la página en blanco a la izquierda.
 */
export function buildSpreads(pages: readonly JournalPageContent[]): readonly Spread[] {
  const spreads: Spread[] = []
  const padded: JournalPageContent[] = [{ kind: 'blank', id: 'blank-start' }, ...pages]

  if (padded.length % 2 !== 0) padded.push({ kind: 'blank', id: 'blank-tail' })

  for (let i = 0; i < padded.length; i += 2) {
    const left = padded[i]
    const right = padded[i + 1]
    if (!left || !right) break
    spreads.push({ index: spreads.length, left, right })
  }

  return spreads
}

/** Hojas físicas derivadas de los spreads, para el page flip 3D. */
export function buildLeaves(spreads: readonly Spread[]): readonly Leaf[] {
  const leaves: Leaf[] = []

  for (let i = 0; i < spreads.length; i++) {
    const current = spreads[i]
    const next = spreads[i + 1]
    if (!current) break

    leaves.push({
      index: i,
      front: current.right,
      back: next?.left ?? { kind: 'blank', id: `blank-leaf-${i}` },
    })
  }

  return leaves
}

/** Paginación completa de un álbum. Se memoiza en un único `useMemo`. */
export type BuiltAlbum = {
  pages: readonly JournalPageContent[]
  spreads: readonly Spread[]
  leaves: readonly Leaf[]
}

/**
 * Deriva las tres vistas de la paginación a partir del contenido.
 *
 * Antes existían como constantes de módulo calculadas desde el arreglo
 * estático, lo que ataba la experiencia a un único álbum. Al recibir los datos
 * como argumento, el mismo diario sirve para la demo y para el álbum de
 * cualquier usuario.
 */
export function buildAlbum({ entries, meta }: AlbumData): BuiltAlbum {
  const pages = buildPages(entries, meta)
  const spreads = buildSpreads(pages)
  return { pages, spreads, leaves: buildLeaves(spreads) }
}

/**
 * Hash determinista de un id. Misma entrada, mismo resultado en cliente y
 * servidor, que es lo que evita saltos de hidratación en las decoraciones.
 */
function hashId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return Math.abs(hash)
}

/** Rotación estable para una Polaroid sin `rotation` explícita. */
export function fallbackRotation(id: string): number {
  // Rango [-3, 3) grados: suficiente para romper la simetría sin parecer un error.
  return ((hashId(id) % 60) / 10) - 3
}

/** Doodles decorativos que se pueden repartir alrededor de una foto. */
const DECORATIVE: readonly DoodleName[] = DOODLE_NAMES.filter(
  (name): name is DoodleName => !['arrowNext', 'camera', 'speechHeart'].includes(name),
)

/**
 * Dos doodles estables para una entrada que no los declara.
 *
 * Las fotos del álbum de ejemplo los traen elegidos a mano, pero las que sube
 * un usuario no: sin esto sus páginas saldrían sin ninguna decoración. Se
 * derivan del id para que una misma foto siempre lleve los mismos.
 */
export function fallbackDoodles(id: string): readonly DoodleName[] {
  if (DECORATIVE.length < 2) return DECORATIVE

  const hash = hashId(id)
  const first = hash % DECORATIVE.length
  // Desplazamiento impar: garantiza que el segundo nunca coincide con el primero.
  const second = (first + 1 + (hash % (DECORATIVE.length - 1))) % DECORATIVE.length

  return [DECORATIVE[first]!, DECORATIVE[second]!]
}
