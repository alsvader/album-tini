'use client'

/**
 * Enlace a la home para quien no es el dueño del álbum.
 *
 * Un visitante que abre el enlace de un álbum ajeno no tiene ningún otro
 * camino de vuelta al resto del sitio: la experiencia del diario no muestra
 * `AppNav`. Reutiliza su wordmark para que se reconozca como la puerta al
 * resto del producto, no como un control más del diario.
 *
 * `right-16` y no `right-4`: comparte fila con `MusicToggle` (`right-4
 * top-4`), que puede estar visible a la vez, así que van uno al lado del
 * otro en vez de apilados — en mobile, apilarlo más abajo invadía la
 * ilustración del diario cerrado y el libro de una sola página al abrirlo.
 */

import Link from 'next/link'
import { Doodle } from './Doodle'

export function HomeLinkButton() {
  return (
    <Link
      href="/"
      aria-label="Ir a Álbum de Tini"
      className={[
        'group fixed right-16 top-4 z-40 flex items-center gap-2 rounded-full',
        'border border-soft-pink/25 bg-dark-violet/50 px-3.5 py-2 backdrop-blur-[2px]',
        'transition-colors duration-300 hover:border-hot-pink/60 hover:bg-purple/50',
      ].join(' ')}
    >
      <Doodle name="flower" className="h-4 w-4 text-hot-pink" />
      <span className="font-script text-base text-paper">Álbum de Tini</span>
    </Link>
  )
}
