'use client'

/**
 * Portada, con su pivote en el lomo.
 *
 * Dos decisiones que definen esta pieza:
 *
 * 1. RoundedBox para el cuerpo + un plano con el arte encima. La caja aporta
 *    el bisel que hace que el canto capte la luz, pero sus UV no son planares;
 *    el plano lleva la textura con mapeo correcto y además permite recortar el
 *    lomo pintado en la imagen.
 *
 * 2. El grupo exterior se coloca EN el lomo y el cuerpo se desplaza media
 *    anchura hacia dentro. Así `rotation.y` del grupo abre la tapa desde la
 *    bisagra y no desde su centro.
 *
 * La cara interior usa inside-page.webp espejado: al abrirse queda mirando al
 * lector y se convierte en la página izquierda del spread, que es exactamente
 * lo que pasa en el diario físico.
 */

import { forwardRef } from 'react'
import { useTexture, RoundedBox } from '@react-three/drei'
import type { Group } from 'three'
import { ASSETS } from '@/lib/assets'
import { asDataMap, cropped, tiled } from '@/lib/three/textures'
import {
  BEVEL_SEGMENTS,
  COVER_BEVEL,
  COVER_DEPTH,
  FRONT_COVER_UV,
  JOURNAL_HEIGHT,
  JOURNAL_WIDTH,
  PAGE_BLOCK_DEPTH,
  SPINE_X,
} from '@/lib/three/journalDims'
import { ClosureFlower } from './ClosureFlower'

/** Z de la tapa cerrada: encima del bloque de páginas. */
export const FRONT_COVER_Z = PAGE_BLOCK_DEPTH / 2 + COVER_DEPTH / 2

type Props = {
  hovered: boolean
}

export const FrontCover = forwardRef<Group, Props>(function FrontCover({ hovered }, pivotRef) {
  // Forma de objeto en vez de tupla: nombra cada textura y evita el acceso
  // por índice, que con noUncheckedIndexedAccess no está garantizado.
  const { coverMap, normalMap, insideMap, paperMap } = useTexture({
    coverMap: ASSETS.journal.frontCover,
    normalMap: ASSETS.textures.coverNormal,
    insideMap: ASSETS.journal.insidePage,
    paperMap: ASSETS.textures.paper,
  })

  // Recorte del lomo pintado (medido sobre la imagen, ver journalDims).
  const art = cropped(coverMap, {
    offsetX: FRONT_COVER_UV.offsetX,
    repeatX: FRONT_COVER_UV.repeatX,
  })
  const normal = asDataMap(normalMap)
  // Espejado para que la cara interior no repita el patrón de la página derecha.
  const inside = cropped(insideMap, { offsetX: 1, repeatX: -1 })
  const paper = tiled(paperMap, 2)

  const faceInset = COVER_BEVEL * 1.5

  return (
    <group ref={pivotRef} position={[SPINE_X, 0, FRONT_COVER_Z]}>
      <group position={[JOURNAL_WIDTH / 2, 0, 0]}>
        {/* Cuerpo biselado. Da silueta y canto; el arte va en los planos. */}
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

        {/* Cara exterior: el arte de la portada. */}
        <mesh position={[0, 0, COVER_DEPTH / 2 + 0.0004]} receiveShadow>
          <planeGeometry args={[JOURNAL_WIDTH - faceInset, JOURNAL_HEIGHT - faceInset]} />
          <meshPhysicalMaterial
            map={art}
            normalMap={normal}
            normalScale={[0.38, 0.38]}
            roughness={0.5}
            metalness={0}
            clearcoat={0.28}
            clearcoatRoughness={0.4}
          />
        </mesh>

        {/* Cara interior: primera página izquierda cuando la tapa se abre. */}
        <mesh
          position={[0, 0, -(COVER_DEPTH / 2 + 0.0004)]}
          rotation={[0, Math.PI, 0]}
          receiveShadow
        >
          <planeGeometry args={[JOURNAL_WIDTH - faceInset, JOURNAL_HEIGHT - faceInset]} />
          <meshStandardMaterial map={inside} roughness={0.88} metalness={0} />
        </mesh>

        {/* Velo de papel: unifica el interior y baja el contraste del patrón. */}
        <mesh position={[0, 0, -(COVER_DEPTH / 2 + 0.0008)]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[JOURNAL_WIDTH - faceInset, JOURNAL_HEIGHT - faceInset]} />
          <meshStandardMaterial
            map={paper}
            color="#FAF7F4"
            roughness={0.9}
            transparent
            opacity={0.4}
          />
        </mesh>

        <ClosureFlower hovered={hovered} />
      </group>
    </group>
  )
})
