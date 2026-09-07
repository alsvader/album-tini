/**
 * Contenido de la landing: Polaroids decorativas y toda la copy.
 *
 * En un solo módulo por dos motivos. El primero, que las secciones son server
 * components y así el texto no viaja al bundle del navegador. El segundo, que
 * la copy de la landing hace afirmaciones sobre el producto, y tenerlas juntas
 * hace evidente cuándo una deja de ser verdad: los topes de fotos y de
 * caracteres se importan de `albumRules` en vez de escribirse a mano.
 *
 * Las fotografías decorativas son de dos procedencias, y la distinción importa:
 *
 * - Las cuatro de `journalEntries` son las del álbum de ejemplo, las mismas que
 *   se ven al abrir /demo. Se usan en las Polaroids que el diseño rotula con
 *   esos recuerdos («Nuestro concierto», «Atardecer mágico»…) y en la grande de
 *   «Así se ve un recuerdo», que es la sección que promete que lo que se ve en
 *   la landing es lo que el usuario va a obtener. Si ahí hubiera una imagen
 *   inventada, esa promesa sería falsa.
 * - Las de `/assets/landing/` son adorno puro para los planos de fondo, donde
 *   hacía falta variedad que el álbum de ejemplo no da. Las genera
 *   `npm run assets:landing` y se sustituyen cambiando el archivo.
 */

import { MAX_CAPTION, MAX_PHOTOS } from '@/lib/albumRules'
import type { JournalEntry } from './journal'
import { journalEntries } from './journal'

/**
 * Una Polaroid de la constelación del hero.
 *
 * `place` son las clases de posición y tamaño, y `depth` el plano de
 * profundidad (0 = fondo, 2 = primer plano), que decide cuánto recorre con el
 * parallax. Están como cadenas literales completas a propósito: sin
 * `tailwind.config`, el scanner de Tailwind v4 sólo ve literales, y una clase
 * interpolada (`left-[${x}%]`) no genera CSS y falla en silencio.
 */
export type HeroPolaroidSpec = {
  entry: JournalEntry
  /** Clases de posición, tamaño y visibilidad por breakpoint. */
  place: string
  /** 0 = lejano y difuminado · 1 = plano medio · 2 = primer plano. */
  depth: 0 | 1 | 2
  /** Cinta washi: clases de geometría, o `null` si esta no lleva. */
  tape: string | null
  /** Variante rosa de la cinta. */
  tapePink?: boolean
  /** Prioriza la descarga: sólo las de primer plano, que se ven siempre antes. */
  priority?: boolean
}

const decorative = (
  id: string,
  photo: string,
  caption: string,
  rotation: number,
  extra?: { date?: string; alt?: string },
): JournalEntry => ({
  id: `landing-${id}`,
  photo,
  caption,
  rotation,
  ...extra,
})

/*
  Los `id` van prefijados con `landing-`. Hoy da igual —las Polaroids
  decorativas se montan con `typeCaption={false}` y entonces el typewriter no
  llega a marcar nada en el store—, pero si alguien quitara ese flag en un
  refactor, un id repetido dejaría la entrada del diario marcada como «ya
  escrita» y su caption saldría completo en /demo en vez de escribiéndose. El
  prefijo hace que ese fallo sea imposible en lugar de improbable.
*/
/**
 * Las notas de estas seis son las del diseño y no las del álbum de ejemplo, aun
 * cuando la foto sí es la real. Es una cuestión de encaje: las del álbum («Un
 * momento que nunca voy a olvidar») ocupan tres líneas en la franja de una
 * Polaroid de 190px, la pieza crece de alto y las dos de cada lado acaban
 * solapándose sobre el titular. Aquí son adorno, así que manda la composición.
 *
 * La nota real, sin tocar, está en la Polaroid grande de «Así se ve un
 * recuerdo», que es la que hace la promesa de producto.
 */
export const HERO_POLAROIDS: readonly HeroPolaroidSpec[] = [
  {
    entry: decorative(
      'escapada',
      '/assets/landing/escapada.webp',
      'Primera escapada',
      -14,
      {
        alt: 'Un horizonte rosa al anochecer',
      },
    ),
    place: 'hidden lg:block -top-8 left-[2%] w-40 xl:left-[4%]',
    depth: 0,
    tape: null,
  },
  {
    entry: {
      ...journalEntries[0]!,
      id: 'landing-concierto',
      caption: 'Nuestro concierto',
      date: '14 oct 2023',
      rotation: -7,
    },
    place: 'hidden md:block top-[24%] left-[1%] w-48 xl:left-[5%]',
    depth: 1,
    tape: 'absolute -top-3 left-1/2 h-5 w-20 -translate-x-1/2 rotate-2',
    tapePink: true,
  },
  {
    entry: {
      ...journalEntries[2]!,
      id: 'landing-amigas',
      caption: 'Mejores amigas',
      date: 'siempre juntas',
      rotation: 5,
    },
    place: 'hidden lg:block bottom-10 left-[4%] w-44 xl:left-[9%]',
    depth: 2,
    tape: 'absolute -top-2.5 right-4 h-4 w-16 -rotate-6',
    priority: true,
  },
  {
    entry: decorative('tarde', '/assets/landing/tarde.webp', 'Aquella tarde', 16, {
      alt: 'Luz cálida de ventana en tonos rosados',
    }),
    place: 'hidden lg:block -top-6 right-[3%] w-40 xl:right-[5%]',
    depth: 0,
    tape: null,
  },
  {
    entry: {
      ...journalEntries[1]!,
      id: 'landing-atardecer',
      caption: 'Atardecer mágico',
      date: 'playa del carmen',
      rotation: 8,
    },
    place: 'hidden md:block top-[22%] right-[1%] w-48 xl:right-[5%]',
    depth: 1,
    tape: 'absolute -top-3 left-6 h-5 w-20 -rotate-3',
  },
  {
    entry: {
      ...journalEntries[3]!,
      id: 'landing-momentos',
      caption: 'Momentos inolvidables',
      date: 'para siempre',
      rotation: -4,
    },
    place: 'hidden lg:block bottom-12 right-[3%] w-44 xl:right-[8%]',
    depth: 2,
    tape: 'absolute -top-2.5 left-1/3 h-4 w-16 rotate-2',
    tapePink: true,
    priority: true,
  },
]

/** La miniatura pegada con cinta de «Se abre, se pasa, se cierra». */
export const JOURNAL_MINI = decorative(
  'mini',
  '/assets/landing/risas.webp',
  'Para siempre',
  -10,
  { alt: 'Destellos rosados desenfocados' },
)

/**
 * «Así se ve un recuerdo». La grande es la primera entrada real del álbum de
 * ejemplo —misma foto, misma nota, misma fecha—, así que la sección enseña
 * literalmente la Polaroid que aparece al abrir /demo.
 *
 * Lo único que cambia es el `id`, y es imprescindible: esta es la única
 * Polaroid de la landing que sí teclea su nota, porque el efecto manuscrito es
 * justo lo que la sección promete. Con el id original, el typewriter marcaría
 * la entrada «01» como ya escrita en el store global —que sobrevive a la
 * navegación de cliente— y al entrar luego al diario su nota saldría completa
 * en vez de escribiéndose.
 */
export const MEMORY_MAIN: JournalEntry = {
  ...journalEntries[0]!,
  id: 'landing-memoria',
  rotation: -2,
}

export const MEMORY_BACKDROP: readonly { entry: JournalEntry; place: string }[] = [
  {
    entry: decorative('risas', '/assets/landing/risas.webp', 'Risadas sin fin', -12, {
      alt: 'Destellos rosados desenfocados',
    }),
    place: 'hidden xl:block left-10 top-10 w-44',
  },
  {
    entry: decorative('abrazos', '/assets/landing/abrazos.webp', 'Abrazos eternos', 12, {
      alt: 'Dos halos de luz cálida en contraluz',
    }),
    place: 'hidden xl:block right-10 bottom-6 w-44',
  },
]

/** Las dos que se salen del marco en el cierre. */
export const CLOSING_POLAROIDS: readonly { entry: JournalEntry; place: string }[] = [
  {
    entry: decorative('cierre-1', '/assets/landing/escapada.webp', 'Aquel verano', 12, {
      alt: 'Un horizonte rosa al anochecer',
    }),
    place: '-bottom-10 -left-12 w-60',
  },
  {
    entry: decorative(
      'cierre-2',
      '/assets/landing/abrazos.webp',
      'Sin querer soltarnos',
      -12,
      {
        alt: 'Dos halos de luz cálida en contraluz',
      },
    ),
    place: '-top-8 -right-10 w-64',
  },
]

/* ------------------------------------------------------------------
   Copy
------------------------------------------------------------------ */

export const NAV_LINKS = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#el-diario', label: 'Ejemplo' },
  { href: '#preguntas', label: 'Preguntas' },
] as const

/** Las tres cualidades del diario, en la columna izquierda de la sección 2. */
export const JOURNAL_FEATURES = [
  { icon: 'sparkle', label: 'Textura papel rugoso', tone: 'text-hot-pink' },
  { icon: 'swirl', label: 'Giro realista de hoja', tone: 'text-electric' },
  { icon: 'star', label: 'Efecto máquina de escribir', tone: 'text-cyan' },
] as const

export const STEPS = [
  {
    icon: 'camera',
    title: 'Sube tus fotos',
    body: 'Elige varias de una vez. Aparecen al momento y las ordenas antes de subir nada.',
    tone: 'text-hot-pink',
  },
  {
    icon: 'speechHeart',
    title: 'Escribe cada recuerdo',
    body: 'Cada foto lleva su nota, la que se escribirá a mano sobre la instantánea.',
    tone: 'text-soft-pink',
  },
  {
    icon: 'trebleClef',
    title: 'Comparte el enlace',
    body: 'Al publicar recibes una dirección única. Quien la abra verá tu diario abrirse.',
    tone: 'text-cyan',
  },
] as const

/** Las tres anotaciones que señalan partes de la Polaroid grande. */
export const MEMORY_NOTES = [
  {
    title: 'Tu foto, sin recortes raros',
    body: 'Enfoque perfecto en tus memorias',
  },
  {
    title: 'Tu letra, escribiéndose sola',
    body: 'Efecto manuscrito letra a letra',
  },
  {
    title: 'La fecha que tú elijas',
    body: 'Para nunca olvidar qué día fue',
  },
] as const

export const REASONS = [
  {
    icon: 'heart',
    title: 'Hecho a mano, no plantilla',
    body: 'Cada nota es tuya y se escribe con tu letra.',
    tone: 'text-hot-pink',
  },
  {
    icon: 'lightning',
    // El diseño decía «ni cuentas de más», y es falso: /crear exige sesión.
    title: 'Listo en minutos',
    body: 'Sin editores complicados: eliges, escribes y publicas.',
    tone: 'text-lime',
  },
  {
    icon: 'star',
    title: 'Se ve bien en el móvil',
    body: 'Una página por vez, con el mismo detalle.',
    tone: 'text-cyan',
  },
  {
    icon: 'sparkle',
    title: 'Solo lo ve quien invites',
    body: 'Tu enlace no se indexa ni se busca.',
    tone: 'text-electric',
  },
] as const

/**
 * Preguntas frecuentes.
 *
 * Los dos números salen de `albumRules` para que la landing no prometa un
 * límite que el formulario ya no aplica. Y la respuesta sobre editar dice lo
 * que hay: desde «Mis álbumes» se pueden añadir fotos, editar sus
 * descripciones, el subtítulo y el texto de cierre, reordenarlas y borrar el
 * álbum, pero no tocar el título.
 */
export const FAQ = [
  {
    q: '¿Cuántas fotos puedo subir?',
    a: `Hasta ${MAX_PHOTOS} por álbum, con una nota de hasta ${MAX_CAPTION} caracteres cada una.`,
  },
  {
    q: '¿Quién puede ver mi álbum?',
    a: 'Solo quien tenga el enlace. Las páginas de álbum no se indexan, así que no aparecen en buscadores ni se pueden encontrar por casualidad.',
  },
  {
    q: '¿Funciona en el celular?',
    a: 'Sí. En pantallas pequeñas el diario pasa una página a la vez, con la misma textura y el mismo efecto de escritura.',
  },
  {
    q: '¿Puedo editarlo después de publicarlo?',
    a: 'Puedes añadir fotos, editar sus descripciones, el subtítulo o el texto de cierre, cambiar su orden o borrar el álbum entero desde «Mis álbumes». El título todavía no se puede editar; para eso, de momento, toca crear uno nuevo.',
  },
] as const
