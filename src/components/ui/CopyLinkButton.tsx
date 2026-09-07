'use client'

/**
 * Copia el enlace público del álbum al portapapeles.
 *
 * El icono es un SVG estándar de copiar (dos rectángulos superpuestos) y no
 * un doodle: el resto del set son trazos dibujados a mano a propósito, pero
 * ese estilo no comunica "copiar" con la claridad de este glifo universal.
 */

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { albumUrl } from '@/lib/albumRules'
import { Toast } from './Toast'

type Props = { slug: string }

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  )
}

export function CopyLinkButton({ slug }: Props) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <>
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
        <CopyIcon className="h-4 w-4" />
      </button>
      <Toast visible={copied} message="Enlace copiado" />
    </>
  )
}
