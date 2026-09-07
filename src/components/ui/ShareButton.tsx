'use client'

/**
 * Comparte el álbum con la hoja de compartir nativa del navegador.
 *
 * Se oculta por completo si no hay soporte (la mayoría de escritorio) en vez
 * de mostrarse deshabilitado: para ese caso está «Copiar enlace», al lado.
 */

import { useWebShare } from '@/hooks/useWebShare'
import { albumUrl } from '@/lib/albumRules'

type Props = { slug: string; title: string; text?: string }

function ShareIcon({ className }: { className?: string }) {
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
      <path d="M12 16V4M8 8l4-4 4 4" />
      <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  )
}

export function ShareButton({ slug, title, text }: Props) {
  const { available, share } = useWebShare()

  if (!available) return null

  return (
    <button
      type="button"
      onClick={() => share({ title, text, url: albumUrl(slug) })}
      aria-label="Compartir álbum"
      title="Compartir"
      className="grid h-9 w-9 place-items-center rounded-full border border-soft-pink/25 text-soft-pink transition-colors duration-300 hover:border-hot-pink/50 hover:text-hot-pink"
    >
      <ShareIcon className="h-4 w-4" />
    </button>
  )
}
