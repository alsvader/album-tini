'use client'

/**
 * Botón para que el dueño de un álbum vuelva a su lista sin pasar por el
 * cierre animado del diario (que no navega a ningún sitio).
 */

import Link from 'next/link'
import { Doodle } from './Doodle'

export function BackToAlbumsButton() {
  return (
    <Link
      href="/mis-albumes"
      aria-label="Volver a Mis álbumes"
      title="Volver a Mis álbumes"
      className={[
        'group fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-full',
        'border border-soft-pink/25 bg-dark-violet/50 backdrop-blur-[2px]',
        'transition-colors duration-300 hover:border-hot-pink/60 hover:bg-purple/50',
      ].join(' ')}
    >
      <Doodle
        name="arrowNext"
        className="h-5 w-5 -scale-x-100 text-soft-pink transition-colors duration-300 group-hover:text-hot-pink"
      />
    </Link>
  )
}
