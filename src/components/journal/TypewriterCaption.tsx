'use client'

/**
 * Caption escrito a mano, carácter a carácter.
 *
 * Dos detalles que importan:
 *
 * - No se repite. El store recuerda qué captions ya se escribieron, así que
 *   volver a una página los muestra completos; sólo se vuelven a teclear si se
 *   reinicia el álbum deliberadamente.
 * - El texto completo va siempre en el DOM en un nodo para lectores de
 *   pantalla, mientras el nodo animado queda aria-hidden. Si no, un lector
 *   anunciaría el caption letra por letra.
 */

import { useCallback } from 'react'
import { useExperience } from '@/state/experience'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTypewriter } from '@/hooks/useTypewriter'

type Props = {
  /** Identificador de la entrada: es la clave de "ya escrito". */
  id: string
  text: string
  /** Sólo escribe cuando la página está realmente visible. */
  active: boolean
  className?: string
  /** ms por carácter. */
  speed?: number
  startDelay?: number
}

export function TypewriterCaption({
  id,
  text,
  active,
  className,
  speed = 46,
  startDelay = 380,
}: Props) {
  const reducedMotion = useReducedMotion()
  const alreadyTyped = useExperience((s) => s.typedCaptions.has(id))
  const markTyped = useExperience((s) => s.markCaptionTyped)

  const onDone = useCallback(() => markTyped(id), [id, markTyped])

  const { output, isTyping } = useTypewriter(text, {
    speed,
    startDelay,
    enabled: active,
    instant: reducedMotion || alreadyTyped,
    onDone,
  })

  return (
    <span className={className}>
      {/* Texto íntegro para tecnologías de asistencia. */}
      <span className="sr-only">{text}</span>

      <span aria-hidden="true">
        {output}
        {isTyping && (
          <span className="ml-px inline-block w-[0.06em] animate-pulse align-baseline text-hot-pink">
            |
          </span>
        )}
      </span>
    </span>
  )
}
