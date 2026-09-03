'use client'

/**
 * Doodles suspendidos en profundidad alrededor del diario.
 *
 * Se dibujan como sprites con la textura generada a partir del path del propio
 * SVG del pack (ver lib/three/svgTexture): siempre miran a cámara, se tiñen
 * desde la paleta y cada uno cuesta una sola llamada de dibujo.
 *
 * La cantidad depende del tier de calidad. Las posiciones se reparten a mano en
 * vez de aleatoriamente para que ninguno tape la portada ni la flor del cierre.
 */

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Sprite } from 'three'
import { DOODLES, type DoodleName } from '@/data/doodles.generated'
import { doodleTexture } from '@/lib/three/svgTexture'
import { useQualitySettings } from '@/hooks/useQualityTier'
import { PALETTE } from '@/lib/assets'

type Placement = {
  name: DoodleName
  position: [number, number, number]
  scale: number
  color: string
  /** Amplitud y ritmo del flotado. */
  amplitude: number
  speed: number
  phase: number
}

/**
 * Composición fija, ordenada de más a menos importante: al bajar el tier se
 * recortan los últimos y la escena sigue equilibrada.
 *
 * Se colocan hacia el fondo (z bajo) y sin acercarse a los bordes del
 * encuadre: con z alto quedan enormes y el viewport los recorta por la mitad,
 * que es peor que no tenerlos.
 */
const PLACEMENTS: readonly Placement[] = [
  { name: 'heart',      position: [-1.52, 0.92,  0.15], scale: 0.3,  color: PALETTE.hotPink,  amplitude: 0.08, speed: 0.5,  phase: 0 },
  { name: 'musicNote',  position: [ 1.48, 0.58,  0.05], scale: 0.27, color: PALETTE.softPink, amplitude: 0.1,  speed: 0.42, phase: 1.4 },
  { name: 'star',       position: [ 1.16,-0.98,  0.35], scale: 0.2,  color: PALETTE.electric, amplitude: 0.07, speed: 0.58, phase: 2.7 },
  { name: 'swirl',      position: [-1.78,-0.82, -0.35], scale: 0.34, color: PALETTE.magenta,  amplitude: 0.06, speed: 0.36, phase: 0.8 },
  { name: 'flower',     position: [-1.08, 1.38, -0.85], scale: 0.24, color: PALETTE.softPink, amplitude: 0.09, speed: 0.47, phase: 3.5 },
  { name: 'trebleClef', position: [ 1.82, 1.22, -0.7 ], scale: 0.3,  color: PALETTE.electric, amplitude: 0.08, speed: 0.33, phase: 2.1 },
  { name: 'sparkle',    position: [ 0.28, 1.68,  0.55], scale: 0.17, color: PALETTE.cyan,     amplitude: 0.11, speed: 0.62, phase: 4.2 },
]

type Props = {
  /** Visibilidad 0–1 por referencia; ver la nota en Particles. */
  revealRef: React.RefObject<number>
}

const BASE_OPACITY = 0.62

export function FloatingDoodles({ revealRef }: Props) {
  const groupRef = useRef<Group>(null)
  const { doodles: limit } = useQualitySettings()

  const visible = useMemo(() => PLACEMENTS.slice(0, limit), [limit])

  const sprites = useMemo(
    () =>
      visible.map((placement) => ({
        placement,
        texture: doodleTexture(DOODLES[placement.name], {
          color: placement.color,
          size: 256,
          strokeScale: 1.15,
        }),
      })),
    [visible],
  )

  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return

    const t = clock.elapsedTime
    const reveal = revealRef.current ?? 1

    group.children.forEach((child, index) => {
      const item = sprites[index]
      if (!item) return
      const { placement } = item

      // Flotado vertical + giro muy leve: hecho a mano, no mecánico.
      child.position.y =
        placement.position[1] + Math.sin(t * placement.speed + placement.phase) * placement.amplitude
      child.rotation.z = Math.sin(t * placement.speed * 0.6 + placement.phase) * 0.12

      const material = (child as Sprite).material
      if (material && 'opacity' in material) material.opacity = BASE_OPACITY * reveal
    })
  })

  return (
    <group ref={groupRef}>
      {sprites.map(({ placement, texture }) =>
        texture ? (
          <sprite
            key={placement.name}
            position={placement.position}
            scale={[placement.scale, placement.scale, 1]}
          >
            <spriteMaterial map={texture} transparent depthWrite={false} opacity={0} />
          </sprite>
        ) : null,
      )}
    </group>
  )
}
