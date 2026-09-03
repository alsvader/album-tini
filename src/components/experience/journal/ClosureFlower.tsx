'use client'

/**
 * Flor del cierre.
 *
 * flower-closure.svg son ocho elipses girando alrededor de un círculo, así que
 * se reconstruye con geometría en vez de usarlo como plano transparente: unos
 * pétalos con volumen captan la luz de rim y hacen que el cierre sobresalga de
 * verdad de la portada, que es justo lo que se quiere sentir al tocarlo.
 *
 * Las proporciones y los colores son los del SVG (#7050A7 / #5B3C91), y su
 * posición es la de la flor ya pintada en la textura de la portada, medida
 * sobre la imagen: el pétalo 3D queda registrado con su propia sombra.
 */

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGSAP } from '@/hooks/useGSAP'
import type { Group, Mesh } from 'three'
import { CLOSURE_FLOWER } from '@/lib/three/journalDims'

/** Ocho pétalos: cuatro en cruz y cuatro en diagonal, como en el SVG. */
const PETALS = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4)

type Props = {
  /** Se resalta al pasar el cursor por encima del diario completo. */
  hovered: boolean
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export function ClosureFlower({ hovered, onPointerOver, onPointerOut }: Props) {
  const groupRef = useRef<Group>(null)
  const glowRef = useRef<Mesh>(null)
  const [selfHover, setSelfHover] = useState(false)

  const active = hovered || selfHover
  const radius = CLOSURE_FLOWER.diameter / 2

  // scale 1 → 1.05 y un glow suave. Con GSAP para que interrumpirlo a mitad
  // de recorrido no produzca saltos.
  useGSAP(
    (gsap) => {
      if (!groupRef.current) return
      gsap.to(groupRef.current.scale, {
        x: active ? 1.05 : 1,
        y: active ? 1.05 : 1,
        z: active ? 1.05 : 1,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: true,
      })
    },
    [active],
  )

  useFrame(({ clock }) => {
    if (!glowRef.current) return
    const material = glowRef.current.material
    if (Array.isArray(material) || !('opacity' in material)) return
    // Latido lento; sube al hacer hover.
    const pulse = 0.5 + Math.sin(clock.elapsedTime * 1.6) * 0.5
    const base = active ? 0.34 : 0.09
    material.opacity = base + pulse * (active ? 0.14 : 0.05)
  })

  return (
    <group
      ref={groupRef}
      position={[CLOSURE_FLOWER.x, CLOSURE_FLOWER.y, CLOSURE_FLOWER.lift]}
      onPointerOver={(event) => {
        event.stopPropagation()
        setSelfHover(true)
        onPointerOver?.()
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setSelfHover(false)
        onPointerOut?.()
      }}
    >
      {PETALS.map((angle) => (
        <mesh
          key={angle}
          rotation={[0, 0, angle]}
          position={[
            Math.cos(angle + Math.PI / 2) * radius * 0.42,
            Math.sin(angle + Math.PI / 2) * radius * 0.42,
            0,
          ]}
          // Muy achatada en Z: el cierre del diario es de tela, no una pelota.
          // La escala está calculada para que el diámetro final coincida con
          // el de la flor ya pintada en la textura de la portada.
          scale={[0.4, 0.58, 0.1]}
          castShadow
        >
          <sphereGeometry args={[radius, 20, 14]} />
          <meshPhysicalMaterial
            color="#8A6BC4"
            roughness={0.65}
            metalness={0}
            clearcoat={0.3}
            clearcoatRoughness={0.4}
          />
        </mesh>
      ))}

      {/* Centro, algo más oscuro y elevado. */}
      <mesh position={[0, 0, radius * 0.1]} scale={[1, 1, 0.35]} castShadow>
        <sphereGeometry args={[radius * 0.3, 24, 16]} />
        <meshPhysicalMaterial
          color="#5B3C91"
          roughness={0.55}
          metalness={0}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Halo plano detrás de la flor; su opacidad la anima useFrame. */}
      <mesh ref={glowRef} position={[0, 0, -radius * 0.3]}>
        <circleGeometry args={[radius * 1.9, 32]} />
        <meshBasicMaterial color="#BD00FF" transparent opacity={0.1} depthWrite={false} />
      </mesh>
    </group>
  )
}
