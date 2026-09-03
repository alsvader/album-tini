'use client'

/**
 * Una Polaroid de la constelación del hero.
 *
 * Es un envoltorio alrededor de `<Polaroid>`, no una reimplementación, y el
 * motivo no es estético: `Polaroid` escribe `transform` en su `motion.figure`
 * (rotación, escala y desplazamiento de entrada), y el parallax también quiere
 * escribir `y`. Peleando por la misma propiedad, uno de los dos pierde. Con un
 * envoltorio, cada uno tiene su propia capa: aquí el desplazamiento por scroll,
 * dentro la pose de la instantánea.
 *
 * Todo lo que el diseño pide y `Polaroid` no tiene cae también aquí: posición
 * absoluta, plano de profundidad, visibilidad por breakpoint, hover y la cinta.
 *
 * Dos detalles que no se ven venir:
 *
 * - El desenfoque de los planos lejanos va en la `<Polaroid>` interior, no en
 *   este envoltorio. Una capa con `filter` que además se mueve se re-rasteriza
 *   en cada frame; con el filtro en un hijo quieto, la capa se cachea y el
 *   padre sólo se compone.
 * - El hover del diseño era `rotate-0`, y aquí es una escala. Un hover de CSS no
 *   puede pisar la transformada inline que framer escribe dentro de `Polaroid`,
 *   así que se busca el mismo gesto —la foto reacciona— por otra propiedad.
 */

import { motion, useTransform, type MotionValue } from 'framer-motion'
import type { HeroPolaroidSpec } from '@/data/landing'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Polaroid } from '../journal/Polaroid'
import { WashiTape } from './WashiTape'

/** Recorrido del parallax en píxeles, por plano de profundidad. */
const TRAVEL = [40, 80, 130] as const

/** Tratamiento de cada plano: el fondo se difumina y baja de opacidad. */
const DEPTH_LOOK = ['opacity-40 blur-[2px]', 'opacity-95', 'opacity-100'] as const

type Props = {
  spec: HeroPolaroidSpec
  /** Progreso de scroll del hero, compartido por toda la constelación. */
  progress: MotionValue<number>
}

export function HeroPolaroid({ spec, progress }: Props) {
  const reducedMotion = useReducedMotion()

  /*
    `useTransform` se llama siempre, sin condicionar: los rangos se leen en la
    llamada, así que cambiarlos según la preferencia no serviría de nada. Lo que
    se intercambia es el valor que llega a `style`, y framer acepta tanto un
    MotionValue como un literal.
  */
  const y = useTransform(progress, [0, 1], [0, -TRAVEL[spec.depth]])

  return (
    <motion.div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute z-20 will-change-transform',
        spec.place,
      ].join(' ')}
      style={{ y: reducedMotion ? 0 : y }}
    >
      {/* La cinta va sobre el borde de la foto, así que es hermana y no hija. */}
      {spec.tape && <WashiTape className={`z-30 ${spec.tape}`} pink={spec.tapePink} />}

      <div
        className={[
          'transition-transform duration-300 hover:scale-[1.04]',
          DEPTH_LOOK[spec.depth],
        ].join(' ')}
      >
        {/*
          `typeCaption={false}`: son decorativas. Con el typewriter activo,
          Polaroid marca la entrada como «ya escrita» en el store global, que
          sobrevive a la navegación de cliente, y los captions del diario
          saldrían completos en /demo en vez de escribiéndose.

          `entrance={false}`: sin él, el HTML del servidor las trae a opacidad
          0 y media composición del hero no existe hasta que hidrata.
        */}
        <Polaroid
          entry={spec.entry}
          active
          priority={spec.priority ?? false}
          typeCaption={false}
          entrance={false}
          className="shadow-polaroid"
        />
      </div>
    </motion.div>
  )
}
