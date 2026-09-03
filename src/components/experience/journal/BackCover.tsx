'use client'

/**
 * Contratapa. Misma proporción exacta que la portada y con el patrón exterior
 * de back-cover.webp, que se ve al abrir el diario del todo.
 *
 * A diferencia de la portada, esta textura no trae lomo pintado ni flor, así
 * que se mapea completa sin recortes.
 */

import { useTexture, RoundedBox } from '@react-three/drei'
import { ASSETS } from '@/lib/assets'
import { asColorMap, asDataMap, cropped, tiled } from '@/lib/three/textures'
import {
  BEVEL_SEGMENTS,
  COVER_BEVEL,
  COVER_DEPTH,
  JOURNAL_HEIGHT,
  JOURNAL_WIDTH,
  PAGE_BLOCK_DEPTH,
} from '@/lib/three/journalDims'

const BACK_COVER_Z = -(PAGE_BLOCK_DEPTH / 2 + COVER_DEPTH / 2)

export function BackCover() {
  const { backMap, normalMap, insideMap, paperMap } = useTexture({
    backMap: ASSETS.journal.backCover,
    normalMap: ASSETS.textures.coverNormal,
    insideMap: ASSETS.journal.insidePage,
    paperMap: ASSETS.textures.paper,
  })

  const art = asColorMap(backMap)
  const normal = asDataMap(normalMap)
  const inside = cropped(insideMap, { offsetY: 1, repeatY: -1 })
  const paper = tiled(paperMap, 2)

  const faceInset = COVER_BEVEL * 1.5

  return (
    <group position={[0, 0, BACK_COVER_Z]}>
      <RoundedBox
        args={[JOURNAL_WIDTH, JOURNAL_HEIGHT, COVER_DEPTH]}
        radius={COVER_BEVEL}
        smoothness={BEVEL_SEGMENTS}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#2A0322"
          roughness={0.52}
          metalness={0}
          normalMap={normal}
          normalScale={[0.35, 0.35]}
          clearcoat={0.22}
          clearcoatRoughness={0.45}
        />
      </RoundedBox>

      {/* Cara exterior, mirando hacia atrás. */}
      <mesh
        position={[0, 0, -(COVER_DEPTH / 2 + 0.0004)]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <planeGeometry args={[JOURNAL_WIDTH - faceInset, JOURNAL_HEIGHT - faceInset]} />
        <meshPhysicalMaterial
          map={art}
          normalMap={normal}
          normalScale={[0.5, 0.5]}
          roughness={0.5}
          metalness={0}
          clearcoat={0.28}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Cara interior, visible bajo el bloque de páginas. */}
      <mesh position={[0, 0, COVER_DEPTH / 2 + 0.0004]} receiveShadow>
        <planeGeometry args={[JOURNAL_WIDTH - faceInset, JOURNAL_HEIGHT - faceInset]} />
        <meshStandardMaterial map={inside} roughness={0.88} metalness={0} />
      </mesh>

      <mesh position={[0, 0, COVER_DEPTH / 2 + 0.0008]}>
        <planeGeometry args={[JOURNAL_WIDTH - faceInset, JOURNAL_HEIGHT - faceInset]} />
        <meshStandardMaterial
          map={paper}
          color="#FAF7F4"
          roughness={0.9}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  )
}
