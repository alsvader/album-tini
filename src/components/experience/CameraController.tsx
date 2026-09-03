'use client'

/**
 * Coreografía de cámara y apertura del diario.
 *
 * Toda la animación temporal de la escena vive aquí, en timelines de GSAP
 * separadas por estado, en lugar de repartida en varios efectos que habría que
 * mantener sincronizados.
 *
 * La cámara no se anima escribiendo directamente en `camera.position`: GSAP
 * interpola un objeto plano de números y un único useFrame lo aplica llamando
 * a `lookAt`. Así el objetivo, la posición y el vector `up` pueden cambiar a la
 * vez sin que el `lookAt` pelee con los tweens —necesario porque la vista
 * cenital exige rotar también el `up`—.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useExperience } from '@/state/experience'
import { CLOSING, INTRO, OPENING, REDUCED } from '@/lib/timings'
import { fitDistance } from '@/lib/framing'
import {
  CAMERA_FOV,
  CLOSED_COVERAGE,
  COVER_OPEN_ANGLE,
  JOURNAL_HEIGHT,
  JOURNAL_RECLINE_X,
  JOURNAL_REST_ROTATION,
  JOURNAL_WIDTH,
  SPINE_X,
  SPREAD_COVERAGE,
  SPREAD_HEIGHT,
  SPREAD_WIDTH,
} from '@/lib/three/journalDims'
import type { Journal3DHandle } from './Journal3D'

/** Estado interpolable de la cámara. GSAP sólo toca números. */
type CameraPose = {
  px: number
  py: number
  pz: number
  tx: number
  ty: number
  tz: number
  ux: number
  uy: number
  uz: number
}

/**
 * Encuadre del diario cerrado: vista de tres cuartos ligeramente elevada.
 *
 * Se guarda como dirección unitaria y no como posición absoluta, porque la
 * distancia se calcula por viewport (ver `restPose`). El objetivo apunta algo
 * por debajo del centro para que el diario suba en el encuadre y quede suelo
 * libre abajo: ahí va la llamada a la acción, que de otro modo se lee encima
 * de la propia portada.
 */
const REST_TARGET = { x: 0, y: -0.16, z: 0 } as const
const REST_DIRECTION = (() => {
  const offset = { x: 0.62, y: 0.66, z: 5.0 }
  const length = Math.hypot(offset.x, offset.y, offset.z)
  return { x: offset.x / length, y: offset.y / length, z: offset.z / length }
})()

/** Cuánto se acerca la cámara al empezar la apertura, como fracción. */
const APPROACH_FACTOR = 0.84
/** Cuánto más lejos arranca la intro, como fracción. */
const INTRO_FACTOR = 1.55

type Props = {
  journalRef: React.RefObject<Journal3DHandle | null>
  /** Notifica el momento en que deben revelarse las páginas interiores. */
  onPagesReveal: (revealed: boolean) => void
}

export function CameraController({ journalRef, onPagesReveal }: Props) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  const state = useExperience((s) => s.state)
  const reducedMotion = useExperience((s) => s.reducedMotion)
  const completeOpen = useExperience((s) => s.completeOpen)
  const completeClose = useExperience((s) => s.completeClose)

  /**
   * Pose de reposo con la distancia ajustada al viewport.
   *
   * El diario mide 1.6 × 2.4: en desktop manda la altura, pero en un móvil
   * estrecho manda el ancho, y con una distancia fija el diario se sale del
   * encuadre. `fitDistance` resuelve las dos restricciones.
   */
  const restPose = useMemo<CameraPose>(() => {
    const aspect = size.width / size.height
    const coverage = size.width < 768 ? CLOSED_COVERAGE.mobile : CLOSED_COVERAGE.desktop
    const distance = fitDistance(CAMERA_FOV, aspect, JOURNAL_WIDTH, JOURNAL_HEIGHT, coverage)

    return {
      px: REST_TARGET.x + REST_DIRECTION.x * distance,
      py: REST_TARGET.y + REST_DIRECTION.y * distance,
      pz: REST_TARGET.z + REST_DIRECTION.z * distance,
      tx: REST_TARGET.x, ty: REST_TARGET.y, tz: REST_TARGET.z,
      ux: 0, uy: 1, uz: 0,
    }
  }, [size.height, size.width])

  /**
   * Arranque de la intro: la misma dirección, más lejos y algo más baja, para
   * que el acercamiento posterior se note.
   *
   * Los tres ejes escalan el offset de la pose de reposo. Mezclar offsets
   * escalados con valores fijos deja la cámara casi a ras de suelo, y a ese
   * ángulo rasante el suelo devuelve un reflejo duro en el borde inferior.
   */
  const introPose = useMemo<CameraPose>(
    () => ({
      ...restPose,
      px: REST_TARGET.x + (restPose.px - REST_TARGET.x) * INTRO_FACTOR,
      py: REST_TARGET.y + (restPose.py - REST_TARGET.y) * INTRO_FACTOR * 0.62,
      pz: REST_TARGET.z + (restPose.pz - REST_TARGET.z) * INTRO_FACTOR,
    }),
    [restPose],
  )

  // Arranca en la pose de intro; a partir de ahí manda GSAP.
  const pose = useRef<CameraPose>({ ...introPose })
  const initialised = useRef(false)

  if (!initialised.current) {
    initialised.current = true
    // La pose de partida depende del estado al montar. El Canvas puede montarse
    // más de una vez —se desmonta al entrar al álbum en el tier bajo y vuelve al
    // cerrar el diario—, y un montaje posterior a la intro no tiene motivo para
    // empezar lejos: debe aparecer ya en la pose de reposo.
    const current = useExperience.getState().state
    const fromIntro = current === 'loading' || current === 'intro'
    Object.assign(pose.current, fromIntro ? introPose : restPose)
  }

  /**
   * Pose final: mirando la página desde arriba.
   *
   * En desktop se encuadra el spread completo, cuyo centro cae en el lomo
   * (SPINE_X) y no en el origen, porque la tapa se abre hacia la izquierda.
   *
   * En móvil se encuadra SÓLO la página derecha. El álbum DOM muestra una
   * página por viewport, así que encuadrar el spread doble haría que el
   * crossfade saltara de dos páginas a una. Centrando la cámara en la página
   * derecha —cuyo centro es el origen— el relevo entre capas coincide en
   * ambos formatos.
   *
   * La distancia la calcula `fitDistance`, la misma función que dimensiona el
   * libro DOM, y de ahí que ambas capas encajen sin ajustes a ojo.
   */
  const albumPose = useMemo<CameraPose>(() => {
    const aspect = size.width / size.height
    const isMobile = size.width < 768

    const planeW = isMobile ? JOURNAL_WIDTH : SPREAD_WIDTH
    const planeH = isMobile ? JOURNAL_HEIGHT : SPREAD_HEIGHT
    const coverage = isMobile ? SPREAD_COVERAGE.mobile : SPREAD_COVERAGE.desktop
    const centerX = isMobile ? 0 : SPINE_X

    const distance = fitDistance(CAMERA_FOV, aspect, planeW, planeH, coverage)

    return {
      px: centerX, py: distance, pz: 0,
      tx: centerX, ty: 0, tz: 0,
      // Con el diario recostado, el "arriba" de la página apunta a -Z.
      ux: 0, uy: 0, uz: -1,
    }
  }, [size.height, size.width])

  /* ---------- Intro ---------- */
  useEffect(() => {
    if (state !== 'intro') return

    if (reducedMotion) {
      // Sin intro larga: se coloca la pose de reposo y queda listo.
      Object.assign(pose.current, restPose)
      useExperience.getState().setState('ready')
      return
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        // Puede haberse saltado la intro con un click; sólo avanzamos si sigue ahí.
        if (useExperience.getState().state === 'intro') {
          useExperience.getState().setState('ready')
        }
      },
    })

    timeline.to(
      pose.current,
      {
        px: restPose.px,
        py: restPose.py,
        pz: restPose.pz,
        duration: INTRO.cameraDolly.duration,
        ease: 'power2.inOut',
      },
      INTRO.cameraDolly.at,
    )

    const root = journalRef.current?.root
    if (root) {
      // Micro-rotación elegante al final de la intro.
      timeline.to(
        root.rotation,
        {
          y: JOURNAL_REST_ROTATION.y + 0.1,
          duration: INTRO.microRotation.duration,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: 1,
        },
        INTRO.microRotation.at,
      )
    }

    timeline.set({}, {}, INTRO.total)

    return () => {
      timeline.kill()
    }
  }, [journalRef, reducedMotion, restPose, state])

  /* ---------- Si se salta la intro, colocar la pose de reposo ---------- */
  useEffect(() => {
    if (state !== 'ready') return
    gsap.to(pose.current, {
      ...restPose,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }, [restPose, state])

  /* ---------- Apertura ---------- */
  useEffect(() => {
    if (state !== 'opening') return

    const root = journalRef.current?.root
    const coverPivot = journalRef.current?.coverPivot

    if (reducedMotion) {
      // Apertura simplificada: sin arco de cámara, sólo el resultado.
      const timeline = gsap.timeline({ onComplete: completeOpen })
      timeline.to(pose.current, { ...albumPose, duration: REDUCED.openingTotal, ease: 'power2.out' }, 0)
      if (coverPivot) {
        timeline.to(coverPivot.rotation, { y: COVER_OPEN_ANGLE, duration: REDUCED.openingTotal }, 0)
      }
      if (root) {
        timeline.to(root.rotation, { x: JOURNAL_RECLINE_X, y: 0, z: 0, duration: REDUCED.openingTotal }, 0)
      }
      onPagesReveal(true)
      return () => {
        timeline.kill()
      }
    }

    const timeline = gsap.timeline({ onComplete: completeOpen })

    // 1. La cámara se acerca un poco: anticipa el gesto. Es una fracción de
    // la distancia y no un valor absoluto, porque en móvil la cámara arranca
    // mucho más lejos y restar una constante la metería dentro del diario.
    timeline.to(
      pose.current,
      {
        px: REST_TARGET.x + (restPose.px - REST_TARGET.x) * APPROACH_FACTOR,
        py: REST_TARGET.y + (restPose.py - REST_TARGET.y) * APPROACH_FACTOR + 0.12,
        pz: REST_TARGET.z + (restPose.pz - REST_TARGET.z) * APPROACH_FACTOR,
        duration: OPENING.cameraApproach.duration,
        ease: 'power2.out',
      },
      OPENING.cameraApproach.at,
    )

    // 2. El diario pierde la inclinación de reposo y se recuesta sobre la mesa.
    if (root) {
      timeline.to(
        root.rotation,
        {
          x: JOURNAL_RECLINE_X,
          y: 0,
          z: 0,
          duration: OPENING.recline.duration,
          ease: 'power3.inOut',
        },
        OPENING.recline.at,
      )
    }

    // 3. La tapa gira desde el lomo. Es el gesto protagonista.
    if (coverPivot) {
      timeline.to(
        coverPivot.rotation,
        {
          y: COVER_OPEN_ANGLE,
          duration: OPENING.cover.duration,
          ease: 'power3.inOut',
        },
        OPENING.cover.at,
      )
    }

    // 4. Ascenso a vista cenital, encuadrando el spread.
    timeline.to(
      pose.current,
      {
        px: albumPose.px, py: albumPose.py, pz: albumPose.pz,
        tx: albumPose.tx, ty: albumPose.ty, tz: albumPose.tz,
        ux: albumPose.ux, uy: albumPose.uy, uz: albumPose.uz,
        duration: OPENING.cameraOverhead.duration,
        ease: 'power2.inOut',
      },
      OPENING.cameraOverhead.at,
    )

    // 5. Las páginas se revelan cuando ya han quedado a la vista.
    timeline.call(() => onPagesReveal(true), undefined, OPENING.pagesReveal.at)

    timeline.set({}, {}, OPENING.total)

    return () => {
      timeline.kill()
    }
  }, [albumPose, completeOpen, journalRef, onPagesReveal, reducedMotion, restPose, state])

  /* ---------- Cierre ---------- */
  useEffect(() => {
    if (state !== 'closing') return

    const root = journalRef.current?.root
    const coverPivot = journalRef.current?.coverPivot

    /**
     * Sin estado 3D no hay nada que invertir.
     *
     * Ocurre en el tier bajo, donde el Canvas se desmontó al entrar al álbum:
     * este componente se monta de nuevo con el diario ya cerrado. En ese caso
     * el cierre lo lleva `IntroExperience` con un fundido, así que aquí no hay
     * que animar nada —ni, sobre todo, llamar a `completeClose`, que dejaría
     * corriendo una timeline de dos segundos sobre un diario ya cerrado—.
     */
    if (!root || !coverPivot) return

    if (reducedMotion) {
      const timeline = gsap.timeline({ onComplete: completeClose })
      timeline.to(pose.current, { ...restPose, duration: REDUCED.closingTotal, ease: 'power2.out' }, 0)
      timeline.to(coverPivot.rotation, { y: 0, duration: REDUCED.closingTotal }, 0)
      timeline.to(
        root.rotation,
        {
          x: JOURNAL_REST_ROTATION.x,
          y: JOURNAL_REST_ROTATION.y,
          z: JOURNAL_REST_ROTATION.z,
          duration: REDUCED.closingTotal,
        },
        0,
      )
      onPagesReveal(false)
      return () => {
        timeline.kill()
      }
    }

    const timeline = gsap.timeline({ onComplete: completeClose })

    // 1. La tapa gira hasta cerrarse. Empieza cuando el relevo de capas ya
    //    devolvió la escena 3D a pantalla.
    timeline.to(
      coverPivot.rotation,
      { y: 0, duration: CLOSING.cover.duration, ease: 'power3.inOut' },
      CLOSING.cover.at,
    )

    // 2. El diario se levanta de la mesa y recupera su inclinación de reposo.
    timeline.to(
      root.rotation,
      {
        x: JOURNAL_REST_ROTATION.x,
        y: JOURNAL_REST_ROTATION.y,
        z: JOURNAL_REST_ROTATION.z,
        duration: CLOSING.standUp.duration,
        ease: 'power3.inOut',
      },
      CLOSING.standUp.at,
    )

    // 3. La cámara desciende de la vista cenital a la de tres cuartos. Recorre
    //    el mismo arco que la apertura, incluido el vector `up`.
    timeline.to(
      pose.current,
      {
        px: restPose.px, py: restPose.py, pz: restPose.pz,
        tx: restPose.tx, ty: restPose.ty, tz: restPose.tz,
        ux: restPose.ux, uy: restPose.uy, uz: restPose.uz,
        duration: CLOSING.cameraBack.duration,
        ease: 'power2.inOut',
      },
      CLOSING.cameraBack.at,
    )

    // 4. La página interior se apaga cuando la tapa ya la cubre.
    timeline.call(() => onPagesReveal(false), undefined, CLOSING.pagesHide.at)

    timeline.set({}, {}, CLOSING.total)

    return () => {
      timeline.kill()
    }
  }, [completeClose, journalRef, onPagesReveal, reducedMotion, restPose, state])

  /* ---------- Aplicación de la pose ---------- */
  useFrame(() => {
    const p = pose.current
    camera.position.set(p.px, p.py, p.pz)
    camera.up.set(p.ux, p.uy, p.uz)
    camera.lookAt(p.tx, p.ty, p.tz)
  })

  return null
}
