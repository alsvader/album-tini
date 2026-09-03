/**
 * Contenido del álbum de ejemplo (la demo pública en /demo).
 *
 * Los álbumes de usuario ya no salen de aquí: vienen de la base de datos y se
 * pasan a la experiencia como props. Este arreglo se conserva porque la demo
 * es el ejemplo que enlaza la landing y, además, permite probar el diario sin
 * depender de Supabase.
 *
 * La paginación, los doodles y la navegación se derivan de los datos
 * (ver src/data/spreads.ts). No se escriben páginas a mano en el JSX.
 */

import type { DoodleName } from './doodles.generated'
import type { AlbumData, AlbumMeta } from './spreads'

export type JournalEntry = {
  /** Estable y único: se usa como key de React y para no repetir el typewriter. */
  id: string
  photo: string
  caption: string
  /** Inclinación de la Polaroid en grados. Se genera una si se omite. */
  rotation?: number
  date?: string
  /** Texto alternativo. Si falta se cae al caption. */
  alt?: string
  /** Doodles que acompañan a esta foto. Máximo 2 para no saturar. */
  doodles?: readonly DoodleName[]
}

export const journalEntries: readonly JournalEntry[] = [
  {
    id: '01',
    photo: '/photos/photo-01.webp',
    caption: 'Nuestro primer concierto',
    date: 'Marzo',
    rotation: -2.4,
    alt: 'Luces de escenario en magenta y violeta sobre el público',
    doodles: ['musicNote', 'star'],
  },
  {
    id: '02',
    photo: '/photos/photo-02.webp',
    caption: 'Atardecer mágico',
    date: 'Junio',
    rotation: 1.8,
    alt: 'Un atardecer rosa reflejado sobre el agua',
    doodles: ['swirl'],
  },
  {
    id: '03',
    photo: '/photos/photo-03.webp',
    caption: 'Mejores amigas',
    date: 'Agosto',
    rotation: -1.4,
    alt: 'Luz suave y cálida en tonos rosados',
    doodles: ['heart', 'sparkle'],
  },
  {
    id: '04',
    photo: '/photos/photo-04.webp',
    caption: 'Un momento que nunca voy a olvidar',
    date: 'Diciembre',
    rotation: 2.6,
    alt: 'Un destello rosa rodeado de estrellas',
    doodles: ['trebleClef', 'flower'],
  },
]

/** Textos de la portadilla interior y del cierre del álbum de ejemplo. */
export const journalMeta: AlbumMeta = {
  title: 'Diario de Tini',
  subtitle: 'un lugar para guardar lo que no quiero olvidar',
  closing: 'y la historia sigue…',
}

/** El álbum de ejemplo, listo para pasarlo a la experiencia. */
export const demoAlbum: AlbumData = {
  entries: journalEntries,
  meta: journalMeta,
}
