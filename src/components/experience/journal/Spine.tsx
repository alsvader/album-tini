'use client'

/**
 * Lomo del diario: pieza independiente con volumen real, no una línea.
 *
 * Es lo que une visualmente las dos tapas y lo que hace que el diario se lea
 * como un objeto grueso. Se recorta el lomo pintado de front-cover.webp
 * precisamente para que este cuerpo sea el único lomo visible.
 */

import { RoundedBox } from '@react-three/drei'
import {
  BEVEL_SEGMENTS,
  COVER_BEVEL,
  JOURNAL_DEPTH,
  JOURNAL_HEIGHT,
  SPINE_WIDTH,
  SPINE_X,
} from '@/lib/three/journalDims'

export function Spine() {
  return (
    <group position={[SPINE_X - SPINE_WIDTH * 0.28, 0, 0]}>
      <RoundedBox
        args={[SPINE_WIDTH, JOURNAL_HEIGHT, JOURNAL_DEPTH * 0.98]}
        radius={COVER_BEVEL * 1.6}
        smoothness={BEVEL_SEGMENTS}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#1A0A18"
          roughness={0.62}
          metalness={0}
          clearcoat={0.2}
          clearcoatRoughness={0.5}
        />
      </RoundedBox>

      {/* Hendidura vertical: sugiere el pliegue de la tela sin más geometría. */}
      <mesh position={[0, 0, JOURNAL_DEPTH * 0.5]}>
        <planeGeometry args={[SPINE_WIDTH * 0.18, JOURNAL_HEIGHT * 0.94]} />
        <meshBasicMaterial color="#0D040C" transparent opacity={0.55} />
      </mesh>
    </group>
  )
}
