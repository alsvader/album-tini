'use client'

/**
 * Enlace directo a WhatsApp con el álbum ya redactado en el mensaje.
 *
 * `wa.me` no necesita número ni API: abre WhatsApp con el texto precargado y
 * el usuario elige a quién enviarlo. El mensaje se arma en el propio clic
 * para no depender de `window.location.origin` durante el render.
 */

import { albumUrl } from '@/lib/albumRules'
import { Doodle } from './Doodle'

type Props = { slug: string; title: string }

export function ShareWhatsAppButton({ slug, title }: Props) {
  function handleClick() {
    const message = `Mira mi nuevo álbum «${title}» en ${albumUrl(slug)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Compartir por WhatsApp"
      title="Compartir por WhatsApp"
      className={[
        'grid h-9 w-9 place-items-center rounded-full border transition-colors duration-300',
        'border-soft-pink/25 text-soft-pink hover:border-hot-pink/50 hover:text-hot-pink',
      ].join(' ')}
    >
      <Doodle name="speechHeart" className="h-4 w-4" />
    </button>
  )
}
