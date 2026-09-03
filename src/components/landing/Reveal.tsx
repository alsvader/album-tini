'use client'

/**
 * Aparición al entrar en el viewport.
 *
 * Envuelve contenido renderizado en servidor: un componente de cliente puede
 * recibir JSX ya pintado como `children` —viaja en la carga RSC y aquí es
 * opaco—, así que las secciones de la landing siguen siendo server components y
 * su copy no baja al bundle del navegador.
 *
 * La animación la hace CSS, no framer, y eso es deliberado. `useInView` sólo
 * pone `data-shown`; la transición vive en `globals.css` dentro de
 * `@media (prefers-reduced-motion: no-preference)`. Con framer habría que
 * consultar `useReducedMotion()` en cada uno de los ~20 envoltorios de la
 * página, y ese store arranca en `false` —lo corrige un efecto del layout raíz,
 * que React ejecuta después que los de los hijos—, así que el primer frame
 * animaría igual. Con CSS, quien tiene la preferencia activa recibe la página
 * visible desde el primer HTML y sin depender de JavaScript.
 */

import { useInView } from 'framer-motion'
import { useRef, type CSSProperties, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /**
   * Clases del propio envoltorio. Hacen falta cuando `Reveal` es hijo directo
   * de un grid o un flex: el div que inserta pasa a ser el item, así que las
   * clases de layout tienen que aterrizar aquí y no en el contenido.
   */
  className?: string
  /** Retardo en milisegundos, para escalonar hermanos. */
  delay?: number
  /** Fracción del elemento que debe verse para disparar. */
  amount?: number
}

export function Reveal({ children, className, delay = 0, amount = 0.2 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  // `once`: una vez revelado no hace falta seguir observando ni volver a ocultar.
  const shown = useInView(ref, { once: true, amount })

  return (
    <div
      ref={ref}
      className={className}
      data-reveal=""
      data-shown={shown ? 'true' : 'false'}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}
