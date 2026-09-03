'use client'

/**
 * El diario completo: ensambla las piezas y expone los pivotes que la timeline
 * de apertura necesita.
 *
 * Jerarquía (todo procedural, sin ningún .glb):
 *
 *   root  ─ inclinación de reposo + parallax de cursor
 *    ├ BackCover
 *    ├ Spine
 *    ├ PageBlock
 *    ├ InnerPages          página derecha del spread
 *    └ coverPivot          EN el lomo → rotation.y abre la tapa
 *        └ cuerpo desplazado media anchura + ClosureFlower
 */

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import { useExperience } from '@/state/experience'
import { useQualitySettings } from '@/hooks/useQualityTier'
import { JOURNAL_REST_ROTATION } from '@/lib/three/journalDims'
import { BackCover } from './journal/BackCover'
import { FrontCover } from './journal/FrontCover'
import { InnerPages } from './journal/InnerPages'
import { PageBlock } from './journal/PageBlock'
import { Spine } from './journal/Spine'

export type Journal3DHandle = {
  root: Group | null
  coverPivot: Group | null
}

type Props = {
  /** Revela la página interior al final de la apertura. */
  pagesRevealed: boolean
}

/** Parallax máximo en radianes: ~2.5°, para que el diario se sienta pesado. */
const PARALLAX_MAX = 0.045

export const Journal3D = forwardRef<Journal3DHandle, Props>(function Journal3D(
  { pagesRevealed },
  ref,
) {
  const rootRef = useRef<Group>(null)
  const coverPivotRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)

  const state = useExperience((s) => s.state)
  const requestOpen = useExperience((s) => s.requestOpen)
  const skipIntro = useExperience((s) => s.skipIntro)
  const { parallax } = useQualitySettings()

  useImperativeHandle(ref, () => ({
    root: rootRef.current,
    coverPivot: coverPivotRef.current,
  }))

  const interactive = state === 'ready' || state === 'intro'

  /* Parallax de cursor. Se aplica encima de la rotación de reposo y sólo
     mientras el diario está cerrado: durante la apertura manda la timeline. */
  useFrame(({ pointer }, delta) => {
    const root = rootRef.current
    if (!root || parallax === 0 || state !== 'ready') return

    const targetY = JOURNAL_REST_ROTATION.y + pointer.x * PARALLAX_MAX * parallax
    const targetX = JOURNAL_REST_ROTATION.x - pointer.y * PARALLAX_MAX * parallax

    // Interpolación dependiente de delta: mismo resultado a 60 y a 120 Hz.
    const damping = 1 - Math.exp(-4 * delta)
    root.rotation.y = MathUtils.lerp(root.rotation.y, targetY, damping)
    root.rotation.x = MathUtils.lerp(root.rotation.x, targetX, damping)
  })

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation()
      // Un click durante la intro la salta; el siguiente abre.
      if (state === 'intro') {
        skipIntro()
        return
      }
      requestOpen()
    },
    [requestOpen, skipIntro, state],
  )

  const handleOver = useCallback(() => {
    if (!interactive) return
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }, [interactive])

  const handleOut = useCallback(() => {
    setHovered(false)
    document.body.style.cursor = ''
  }, [])

  return (
    <group
      ref={rootRef}
      rotation={[JOURNAL_REST_ROTATION.x, JOURNAL_REST_ROTATION.y, JOURNAL_REST_ROTATION.z]}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <BackCover />
      <Spine />
      <PageBlock />
      <InnerPages revealed={pagesRevealed} />
      <FrontCover ref={coverPivotRef} hovered={hovered && interactive} />
    </group>
  )
})
