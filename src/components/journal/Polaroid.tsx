'use client'

/**
 * Fotografía instantánea.
 *
 * Proporciones tomadas de una Polaroid real: ventana cuadrada, márgenes
 * estrechos arriba y a los lados y un margen inferior mucho mayor donde va el
 * caption escrito a mano. Los porcentajes hacen que la pieza escale entera con
 * su contenedor, sin romperse entre desktop y móvil.
 *
 * La animación de entrada busca la sensación de que alguien acaba de dejar la
 * foto sobre la página: baja un poco, corrige la rotación y asienta la escala.
 */

import { motion } from 'framer-motion'
import { ASSETS } from '@/lib/assets'
import type { JournalEntry } from '@/data/journal'
import { fallbackRotation } from '@/data/spreads'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { TypewriterCaption } from './TypewriterCaption'

type Props = {
  entry: JournalEntry
  /** La página está a la vista: dispara entrada y typewriter. */
  active: boolean
  className?: string
  /** Prioriza la descarga de la primera foto visible. */
  priority?: boolean
  /**
   * Escribe el caption letra a letra. Ponerlo en `false` lo pinta completo.
   *
   * Hace falta para las Polaroids decorativas (la landing) por dos motivos, y
   * el segundo no se ve venir: el typewriter marca el caption como «ya escrito»
   * en el store global, que sobrevive a la navegación de cliente. Una Polaroid
   * de adorno en la landing dejaba esa entrada marcada, y al entrar después al
   * diario su caption aparecía ya completo en vez de escribiéndose.
   *
   * El primero es de coste: varias Polaroids decorativas serían varios bucles
   * de requestAnimationFrame tecleando a la vez sobre el pliegue de la página.
   */
  typeCaption?: boolean
  /**
   * Anima la entrada de la instantánea. Ponerlo en `false` la pinta ya asentada.
   *
   * Hace falta para la landing, y el motivo es de robustez, no estético: con la
   * entrada activa el HTML del servidor sale con `opacity: 0` y la foto no
   * aparece hasta que hidrata. En el diario da igual —está detrás de la pantalla
   * de carga—, pero una portada de marketing no puede depender de que baje el
   * JavaScript para que se vea la mitad de su composición.
   */
  entrance?: boolean
}

export function Polaroid({
  entry,
  active,
  className,
  priority = false,
  typeCaption = true,
  entrance = true,
}: Props) {
  const reducedMotion = useReducedMotion()
  const rotation = entry.rotation ?? fallbackRotation(entry.id)

  /**
   * Pose de entrada, compartida por `initial` y por el estado inactivo.
   *
   * Que el estado inactivo conserve el desvío de rotación no es un detalle: en
   * desktop las Polaroids se montan todas a la vez y esperan inactivas a que su
   * página llegue. Si el inactivo las dejara ya en su rotación final, activarlas
   * sólo podría animar opacidad, `y` y escala, y la entrada perdería la mitad
   * del gesto —justo la parte que da la sensación de foto recién colocada—.
   *
   * Por eso los dos estados salen de una única constante y no de dos objetos
   * escritos a mano, que es como se separaron la primera vez.
   */
  const enterFrom = reducedMotion
    ? { opacity: 0, rotate: rotation }
    : { opacity: 0, y: -20, rotate: rotation + (rotation < 0 ? 6 : -6), scale: 0.96 }

  const settled = { opacity: 1, y: 0, rotate: rotation, scale: 1 }

  return (
    <motion.figure
      className={[
        'paper-grain relative flex flex-col rounded-[3px] bg-paper',
        'px-[5.5%] pt-[5.5%] pb-[4%]',
        'shadow-[0_18px_38px_-14px_rgba(22,0,25,0.55),0_2px_6px_rgba(22,0,25,0.28)]',
        className ?? '',
      ].join(' ')}
      style={{
        // Textura de papel de la instantánea, no un blanco plano.
        backgroundImage: `url(${ASSETS.textures.polaroid})`,
        backgroundSize: 'cover',
      }}
      /*
        Con `entrance: false`, `initial={false}` le dice a framer que no hay
        pose de partida: escribe los valores de `animate` directamente, así que
        el HTML del servidor ya sale con la instantánea colocada.
      */
      initial={entrance ? enterFrom : false}
      animate={active || !entrance ? settled : enterFrom}
      transition={
        reducedMotion ? { duration: 0.2 } : { duration: 0.78, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {/* Ventana de la foto: cuadrada, como en el original. */}
      <div className="relative aspect-square w-full overflow-hidden bg-deep/90">
        <img
          src={entry.photo}
          alt={entry.alt ?? entry.caption}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className="h-full w-full object-cover"
        />

        {/* Brillo del revelado: una diagonal muy tenue sobre la emulsión. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen"
          style={{
            background:
              'linear-gradient(118deg, transparent 42%, rgba(255,255,255,0.5) 50%, transparent 58%)',
          }}
        />
      </div>

      {/* Franja inferior, deliberadamente alta: es la firma de una Polaroid. */}
      <figcaption className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 pt-[7%] pb-[3%] text-center">
        {typeCaption ? (
          <TypewriterCaption
            id={entry.id}
            text={entry.caption}
            active={active}
            className="font-script text-[clamp(1.15rem,2.1vw,1.7rem)] leading-tight text-ink"
          />
        ) : (
          <span className="font-script text-[clamp(1.15rem,2.1vw,1.7rem)] leading-tight text-ink">
            {entry.caption}
          </span>
        )}

        {entry.date && (
          <span className="text-[0.6rem] uppercase tracking-[0.28em] text-ink/45">
            {entry.date}
          </span>
        )}
      </figcaption>
    </motion.figure>
  )
}
