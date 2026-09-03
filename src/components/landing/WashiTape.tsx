/**
 * Cinta washi.
 *
 * Server component: son dos atributos y una clase, no necesita JavaScript. El
 * material está en `@utility washi-tape` de `globals.css`; aquí sólo se
 * deduplican el `aria-hidden` y el rol decorativo, que es justo lo que se
 * olvida cuando la misma cinta se copia a mano diez veces por la página.
 *
 * La geometría (posición, ancho, ángulo) llega por `className` porque cambia en
 * cada uso: son clases literales de Tailwind en el sitio donde se pone la cinta.
 */

type Props = {
  /** Clases de posición, tamaño y rotación. */
  className: string
  /** Variante rosa, para las cintas sobre fondo claro del papel. */
  pink?: boolean
}

export function WashiTape({ className, pink = false }: Props) {
  return (
    <span
      aria-hidden="true"
      className={[pink ? 'washi-tape-pink' : 'washi-tape', className].join(' ')}
    />
  )
}
