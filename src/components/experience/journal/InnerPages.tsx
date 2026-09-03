'use client'

/**
 * Página derecha del spread: la hoja superior del bloque de páginas.
 *
 * La izquierda no está aquí a propósito —es la cara interior de la portada,
 * que al abrirse queda mirando al lector—. Modelarlo así evita duplicar una
 * página y hace que el spread se forme solo con el giro de la tapa.
 *
 * Aparece por opacidad al final de la apertura: mientras el diario está cerrado
 * no aporta nada y en cambio produce z-fighting con el bloque de páginas.
 */

import { useRef } from 'react'
import { useTexture } from '@react-three/drei'
import type { Mesh, MeshStandardMaterial } from 'three'
import { useGSAP } from '@/hooks/useGSAP'
import { ASSETS } from '@/lib/assets'
import { asColorMap, tiled } from '@/lib/three/textures'
import { PAGE_BLOCK_DEPTH, PAGE_HEIGHT, PAGE_WIDTH } from '@/lib/three/journalDims'

const PAGE_Z = PAGE_BLOCK_DEPTH / 2 + 0.0012

/**
 * Opacidad final del velo. Coincide con el scrim del álbum DOM para que el
 * papel no cambie de tono en el crossfade.
 */
const VEIL_OPACITY = 0.42

type Props = {
  /** Revela la página cuando la apertura ya la deja a la vista. */
  revealed: boolean
  duration?: number
}

export function InnerPages({ revealed, duration = 0.7 }: Props) {
  const pageRef = useRef<Mesh>(null)
  const veilRef = useRef<Mesh>(null)

  const { insideMap, paperMap } = useTexture({
    insideMap: ASSETS.journal.insidePage,
    paperMap: ASSETS.textures.paper,
  })
  const inside = asColorMap(insideMap)
  const paper = tiled(paperMap, 2)

  useGSAP(
    (gsap) => {
      const page = pageRef.current?.material as MeshStandardMaterial | undefined
      const veil = veilRef.current?.material as MeshStandardMaterial | undefined

      if (page) {
        gsap.to(page, {
          opacity: revealed ? 1 : 0,
          duration,
          ease: 'power2.out',
          overwrite: true,
        })
      }

      if (veil) {
        gsap.to(veil, {
          opacity: revealed ? VEIL_OPACITY : 0,
          duration,
          ease: 'power2.out',
          overwrite: true,
        })
      }
    },
    [revealed, duration],
  )

  return (
    <group position={[0, 0, PAGE_Z]}>
      <mesh ref={pageRef} receiveShadow>
        <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT]} />
        <meshStandardMaterial map={inside} roughness={0.88} metalness={0} transparent opacity={0} />
      </mesh>

      {/* Mismo velo cálido que el interior de la tapa: el patrón del pack es
          muy denso y las fotografías tienen que poder respirar encima. */}
      <mesh ref={veilRef} position={[0, 0, 0.0004]}>
        <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT]} />
        <meshStandardMaterial
          map={paper}
          color="#FAF7F4"
          roughness={0.9}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  )
}
