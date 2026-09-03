'use client'

/**
 * Canvas de React Three Fiber y contenido de la escena.
 *
 * Todo lo que carga texturas vive bajo un único <Suspense>. Eso importa para
 * el arranque: React confirma un límite de Suspense completo de una vez, así
 * que `ReadySignal` sólo se monta cuando TODAS las texturas de la escena están
 * listas. Es una señal determinista, a diferencia de vigilar un porcentaje de
 * progreso, que puede llegar a 100 antes de que empiece la última carga.
 */

import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'
import { PALETTE } from '@/lib/assets'
import { useQualitySettings } from '@/hooks/useQualityTier'
import { CAMERA_FOV } from '@/lib/three/journalDims'
import { Journal3D, type Journal3DHandle } from './Journal3D'
import { JournalEnvironment } from './JournalEnvironment'
import { Particles } from './Particles'
import { FloatingDoodles } from './FloatingDoodles'
import { CameraController } from './CameraController'

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

type Props = {
  journalRef: React.RefObject<Journal3DHandle | null>
  pagesRevealed: boolean
  onPagesReveal: (revealed: boolean) => void
  onReady: () => void
  /** 0–1: la intro va subiendo partículas y doodles. Por ref, no por estado. */
  ambientRevealRef: React.RefObject<number>
  /** El Canvas deja de renderizar tras el crossfade para liberar la GPU. */
  active: boolean
}

export function ThreeCanvas({
  journalRef,
  pagesRevealed,
  onPagesReveal,
  onReady,
  ambientRevealRef,
  active,
}: Props) {
  const { dpr, shadows } = useQualitySettings()

  return (
    <Canvas
      dpr={dpr}
      shadows={shadows}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: CAMERA_FOV, near: 0.1, far: 100, position: [0.3, 0.2, 7.8] }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      // El diario es lo único clicable; el resto de la escena no necesita raycast.
      onCreated={({ gl }) => gl.setClearColor(PALETTE.deep)}
    >
      <color attach="background" args={[PALETTE.deep]} />

      <Suspense fallback={null}>
        <JournalEnvironment />
        <Particles revealRef={ambientRevealRef} />
        <FloatingDoodles revealRef={ambientRevealRef} />
        <Journal3D ref={journalRef} pagesRevealed={pagesRevealed} />
        <CameraController journalRef={journalRef} onPagesReveal={onPagesReveal} />
        <Preload all />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
