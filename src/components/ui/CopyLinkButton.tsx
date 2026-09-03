'use client'

/**
 * Copia el enlace público del álbum al portapapeles.
 */

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { albumUrl } from '@/lib/albumRules'
import { Doodle } from './Doodle'

type Props = { slug: string }

export function CopyLinkButton({ slug }: Props) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <button
      type="button"
      onClick={() => copy(albumUrl(slug))}
      aria-label={copied ? 'Enlace copiado' : 'Copiar enlace del álbum'}
      title={copied ? '¡Copiado!' : 'Copiar enlace'}
      className={[
        'grid h-9 w-9 place-items-center rounded-full border transition-colors duration-300',
        copied
          ? 'border-hot-pink/60 text-hot-pink'
          : 'border-soft-pink/25 text-soft-pink hover:border-hot-pink/50 hover:text-hot-pink',
      ].join(' ')}
    >
      <Doodle name="link" className="h-4 w-4" />
    </button>
  )
}
