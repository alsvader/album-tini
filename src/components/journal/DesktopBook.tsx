'use client'

/**
 * Libro de doble página con page flip real.
 *
 * Modelo físico: cada *hoja* se renderiza una sola vez, apilada sobre la mitad
 * derecha con `transform-origin: left center`. Girarla -180° la deja sobre la
 * mitad izquierda, y como su reverso es la página izquierda del spread
 * siguiente, un solo giro descubre dos páginas nuevas. Es lo que hace que se
 * lea como un libro y no como una sustitución de contenido.
 *
 * GSAP es dueño único de los transforms de las hojas: React las renderiza una
 * vez y nunca escribe su `transform`, ni en el render inicial. Mezclar ambos
 * sobre la misma propiedad hace que el primer render tras cambiar de página
 * pinte la hoja ya volteada un frame antes de que arranque el giro.
 *
 * El contenido de las páginas no se activa cuando cambia el índice, sino a
 * mitad del giro: ver CONTENT_REVEAL_AT.
 *
 * El z-index se recalcula en cada cambio porque el orden de apilamiento se
 * invierte al cruzar el lomo: a la derecha manda la hoja de índice menor, a la
 * izquierda la de índice mayor.
 */

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { Size } from '@/lib/framing'
import type { Leaf, Spread } from '@/data/spreads'
import { JournalPage } from './JournalPage'

const FLIP_DURATION = 1.05

/**
 * Fracción del giro en la que se activa el contenido de las páginas entrantes.
 *
 * La hoja cruza los 90° a mitad de recorrido, y hasta ese momento las páginas
 * nuevas no miran al lector. Activar el contenido con el cambio de índice hace
 * que la entrada de la Polaroid (0.78 s) se ejecute entera escondida detrás de
 * la hoja y termine antes de que la página sea visible: se llega a ver la foto
 * ya colocada. Un poco después del cruce, la entrada acompaña a la hoja
 * mientras se asienta.
 */
const CONTENT_REVEAL_AT = 0.55

type Props = {
  /** Índice del spread visible. */
  spreadIndex: number
  size: Size
  onFlipEnd: () => void
  spreads: readonly Spread[]
  leaves: readonly Leaf[]
}

export function DesktopBook({ spreadIndex, size, onFlipEnd, spreads, leaves }: Props) {
  const leafRefs = useRef<(HTMLDivElement | null)[]>([])
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([])
  const sheenRefs = useRef<(HTMLDivElement | null)[]>([])
  const previousSpread = useRef(spreadIndex)
  const reducedMotion = useReducedMotion()

  /**
   * Spread cuyo contenido está vivo. Va por detrás de `spreadIndex`: sólo se
   * pone al día cuando el giro ha descubierto las páginas nuevas. Mientras
   * gira, el spread saliente sigue activo y su foto se marcha con la hoja en
   * lugar de desvanecerse a mitad de recorrido.
   */
  const [activeSpread, setActiveSpread] = useState(spreadIndex)

  // useLayoutEffect y no useEffect: GSAP tiene que fijar el estado de partida
  // del giro antes del primer pintado.
  useLayoutEffect(() => {
    const previous = previousSpread.current
    previousSpread.current = spreadIndex

    const total = leaves.length

    /** Orden de apilamiento correcto a cada lado del lomo. */
    const applyZ = () => {
      leafRefs.current.forEach((leaf, index) => {
        if (!leaf) return
        const flipped = index < spreadIndex
        leaf.style.zIndex = String(flipped ? index + 1 : total - index)
      })
    }

    /** Coloca una hoja sin animar. */
    const settle = (index: number) => {
      const leaf = leafRefs.current[index]
      if (!leaf) return
      gsap.set(leaf, { rotateY: index < spreadIndex ? -180 : 0 })
      const shadow = shadowRefs.current[index]
      const sheen = sheenRefs.current[index]
      if (shadow) gsap.set(shadow, { opacity: 0 })
      if (sheen) gsap.set(sheen, { opacity: 0 })
    }

    // Primer render o salto de más de una página: colocar todo y salir.
    // También es el camino del montaje, donde `delta` vale 0, y por eso las
    // hojas reciben aquí su rotación inicial sin que el JSX la escriba.
    const delta = spreadIndex - previous
    if (Math.abs(delta) !== 1 || reducedMotion) {
      leafRefs.current.forEach((_, index) => settle(index))
      applyZ()
      // Sin giro que esperar: el contenido entra de inmediato.
      setActiveSpread(spreadIndex)
      onFlipEnd()
      return
    }

    // Hoja que cruza el lomo: al avanzar es la que queda atrás, al volver la actual.
    const movingIndex = delta > 0 ? spreadIndex - 1 : spreadIndex
    const leaf = leafRefs.current[movingIndex]

    leafRefs.current.forEach((_, index) => {
      if (index !== movingIndex) settle(index)
    })
    applyZ()

    if (!leaf) {
      setActiveSpread(spreadIndex)
      onFlipEnd()
      return
    }

    // La hoja en movimiento va por encima de todas mientras gira.
    leaf.style.zIndex = String(total + 2)

    const shadow = shadowRefs.current[movingIndex]
    const sheen = sheenRefs.current[movingIndex]

    const timeline = gsap.timeline({
      onComplete: () => {
        applyZ()
        onFlipEnd()
      },
    })

    timeline.fromTo(
      leaf,
      { rotateY: delta > 0 ? 0 : -180 },
      { rotateY: delta > 0 ? -180 : 0, duration: FLIP_DURATION, ease: 'power2.inOut' },
      0,
    )

    // Las páginas nuevas cobran vida cuando ya se ven, no cuando cambió el
    // índice. Este setState re-renderiza a mitad de giro, pero no reescribe el
    // `transform` de la hoja porque el JSX ya no lo declara.
    timeline.call(
      () => setActiveSpread(spreadIndex),
      undefined,
      FLIP_DURATION * CONTENT_REVEAL_AT,
    )

    // Sombra que hace pico a mitad del giro: da volumen al papel levantado.
    if (shadow) {
      timeline.fromTo(
        shadow,
        { opacity: 0 },
        { opacity: 0.5, duration: FLIP_DURATION / 2, ease: 'power1.in' },
        0,
      )
      timeline.to(shadow, { opacity: 0, duration: FLIP_DURATION / 2, ease: 'power1.out' }, FLIP_DURATION / 2)
    }

    // Reflejo especular que barre la hoja: sugiere la curvatura sin geometría.
    if (sheen) {
      timeline.fromTo(
        sheen,
        { opacity: 0, backgroundPosition: '0% 50%' },
        {
          opacity: 0.42,
          backgroundPosition: '100% 50%',
          duration: FLIP_DURATION * 0.6,
          ease: 'power1.inOut',
        },
        FLIP_DURATION * 0.12,
      )
      timeline.to(sheen, { opacity: 0, duration: FLIP_DURATION * 0.28 }, FLIP_DURATION * 0.72)
    }

    return () => {
      timeline.kill()
    }
  }, [leaves.length, onFlipEnd, reducedMotion, spreadIndex])

  const halfWidth = size.width / 2
  const firstSpread = spreads[0]

  return (
    <div
      className="book-stage relative"
      style={{ width: size.width, height: size.height }}
      aria-live="polite"
    >
      {/* Sombra de contacto bajo el libro. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 left-1/2 h-10 -translate-x-1/2 rounded-[50%] blur-2xl"
        style={{
          width: size.width * 0.86,
          background: 'radial-gradient(ellipse, rgba(22,0,25,0.7) 0%, transparent 70%)',
        }}
      />

      {/* Base izquierda: primera página del libro, bajo todas las hojas. */}
      <div className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: halfWidth }}>
        {firstSpread && (
          <JournalPage content={firstSpread.left} active={activeSpread === 0} spineSide="right" />
        )}
      </div>

      {/* Base derecha: tablero vacío cuando ya se han pasado todas las hojas. */}
      <div className="absolute right-0 top-0 h-full overflow-hidden" style={{ width: halfWidth }}>
        <JournalPage content={{ kind: 'blank', id: 'board-right' }} active={false} spineSide="left" />
      </div>

      {/* Hojas. Se renderizan una vez; sus transforms los gobierna GSAP. */}
      {leaves.map((leaf, index) => {
        const isCurrentRight = index === activeSpread
        const isCurrentLeft = index === activeSpread - 1

        return (
          <div
            key={leaf.index}
            ref={(node) => {
              leafRefs.current[index] = node
            }}
            className="absolute top-0 h-full"
            // Sin `transform`: lo escribe GSAP, incluida la rotación inicial.
            style={{
              left: halfWidth,
              width: halfWidth,
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Cara frontal: página derecha de este spread. */}
            <div className="leaf-face absolute inset-0 overflow-hidden">
              <JournalPage
                content={leaf.front}
                active={isCurrentRight}
                spineSide="left"
                priority={index <= 1}
              />
            </div>

            {/* Reverso: página izquierda del spread siguiente. */}
            <div
              className="leaf-face absolute inset-0 overflow-hidden"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <JournalPage content={leaf.back} active={isCurrentLeft} spineSide="right" />
            </div>

            {/* Sombra dinámica del giro. */}
            <div
              ref={(node) => {
                shadowRefs.current[index] = node
              }}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(22,0,25,0.55) 0%, rgba(22,0,25,0.18) 45%, transparent 100%)',
              }}
            />

            {/* Reflejo que barre la hoja durante el giro. */}
            <div
              ref={(node) => {
                sheenRefs.current[index] = node
              }}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                backgroundImage:
                  'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
                backgroundSize: '260% 100%',
                mixBlendMode: 'screen',
              }}
            />
          </div>
        )
      })}

      {/* Pliegue central: profundidad alrededor del lomo, por encima del papel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2"
        style={{
          width: size.width * 0.045,
          zIndex: leaves.length + 4,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(22,0,25,0.22) 35%, rgba(22,0,25,0.32) 50%, rgba(22,0,25,0.22) 65%, transparent 100%)',
        }}
      />
    </div>
  )
}
