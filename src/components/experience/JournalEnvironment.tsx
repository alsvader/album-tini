'use client'

/**
 * Escenario: luces, glows y superficie.
 *
 * El esquema es el del art board: key magenta, rim violeta, fill cyan muy leve
 * y ambiente suave. La clave es que el glow está DETRÁS del diario —planos con
 * glow-magenta.png y glow-violet.png— y no sobre su superficie: así la luz
 * dibuja el canto de las tapas en lugar de aplanarlas.
 *
 * Sin postprocessing. El bloom real cuesta dos render targets y el brief pide
 * explícitamente evitar el exceso de bloom, así que el resplandor se consigue
 * con sprites aditivos, que además funcionan igual de bien en móvil.
 */

import { useRef } from 'react'
import { useTexture, ContactShadows, MeshReflectorMaterial } from '@react-three/drei'
import {
  AdditiveBlending,
  type AmbientLight,
  type DirectionalLight,
  type MeshBasicMaterial,
  type PointLight,
  type SpotLight,
} from 'three'
import { ASSETS, PALETTE } from '@/lib/assets'
import { useQualitySettings } from '@/hooks/useQualityTier'
import { useExperience } from '@/state/experience'
import { CLOSING } from '@/lib/timings'
import { useGSAP } from '@/hooks/useGSAP'
import { JOURNAL_HEIGHT, SPINE_X } from '@/lib/three/journalDims'

/** El diario se apoya aquí: media altura por debajo del origen. */
const FLOOR_Y = -JOURNAL_HEIGHT / 2 - 0.02

/**
 * Suelo oscuro. Deliberadamente por debajo del fondo de la escena: la
 * superficie tiene que insinuarse por el reflejo y la sombra de contacto, no
 * por su propio brillo. Aclararlo hace que el relleno frontal forme un charco
 * de luz en el borde inferior del encuadre.
 */
const FLOOR_COLOR = '#120517'

/**
 * El rig tiene dos configuraciones porque el diario cambia de orientación.
 *
 * Cerrado y de pie, la portada mira a cámara y necesita un relleno frontal
 * fuerte para que se lea el paisley. Abierto y recostado, esas mismas luces
 * quedan casi rasantes sobre papel blanco y lo queman a magenta puro: las
 * páginas pierden el patrón y la fotografía deja de tener contraste. Al abrir
 * se baja el relleno y entra una luz cenital suave y cálida, que es la que
 * hace que el papel se lea como papel.
 */
const RIG = {
  closed: { ambient: 0.55, key: 46, rim: 3.2, fillFront: 17, fillSide: 7, overhead: 0 },
  open: { ambient: 0.34, key: 9, rim: 0.7, fillFront: 1.4, fillSide: 0.7, overhead: 3.1 },
} as const

/**
 * Opacidad de los glows de fondo.
 *
 * Son planos verticales pensados para la vista frontal del diario cerrado.
 * En la vista cenital se ven de canto y aparecen como líneas y bordes rectos
 * en el encuadre, así que se apagan al abrir.
 */
const GLOW_OPACITY = {
  closed: { magenta: 0.85, violet: 0.6 },
  open: { magenta: 0, violet: 0 },
} as const

export function JournalEnvironment() {
  const ambientRef = useRef<AmbientLight>(null)
  const keyRef = useRef<SpotLight>(null)
  const rimRef = useRef<DirectionalLight>(null)
  const fillFrontRef = useRef<PointLight>(null)
  const fillSideRef = useRef<PointLight>(null)
  const overheadRef = useRef<DirectionalLight>(null)
  const glowMagentaRef = useRef<MeshBasicMaterial>(null)
  const glowVioletRef = useRef<MeshBasicMaterial>(null)

  const state = useExperience((s) => s.state)
  const isOpen = state === 'opening' || state === 'album'
  const isClosing = state === 'closing'

  useGSAP(
    (gsap) => {
      const target = isOpen ? RIG.open : RIG.closed
      const pairs: [React.RefObject<{ intensity: number } | null>, number][] = [
        [ambientRef, target.ambient],
        [keyRef, target.key],
        [rimRef, target.rim],
        [fillFrontRef, target.fillFront],
        [fillSideRef, target.fillSide],
        [overheadRef, target.overhead],
      ]

      // Al cerrar, la luz sigue a la tapa: mismo instante de arranque y misma
      // duración que su giro. Con los 0.6 s del caso general la escena volvía a
      // su iluminación de diario cerrado mientras la tapa todavía estaba abierta.
      const duration = isOpen ? 1.15 : isClosing ? CLOSING.cover.duration : 0.6
      const delay = isClosing ? CLOSING.cover.at : 0

      for (const [ref, intensity] of pairs) {
        if (!ref.current) continue
        gsap.to(ref.current, {
          intensity,
          // Acompaña a la reclinación del diario, no llega después.
          duration,
          delay,
          ease: 'power2.inOut',
          overwrite: true,
        })
      }

      const glowTarget = isOpen ? GLOW_OPACITY.open : GLOW_OPACITY.closed
      const glows: [React.RefObject<MeshBasicMaterial | null>, number][] = [
        [glowMagentaRef, glowTarget.magenta],
        [glowVioletRef, glowTarget.violet],
      ]

      for (const [ref, opacity] of glows) {
        if (!ref.current) continue
        gsap.to(ref.current, { opacity, duration, delay, ease: 'power2.inOut', overwrite: true })
      }
    },
    [isClosing, isOpen],
  )

  const { glowMagenta, glowViolet } = useTexture({
    glowMagenta: ASSETS.environment.glowMagenta,
    glowViolet: ASSETS.environment.glowViolet,
  })

  const { reflectiveFloor, shadows } = useQualitySettings()

  return (
    <>
      {/* ---------- Luces ---------- */}
      <ambientLight ref={ambientRef} color={PALETTE.electric} intensity={RIG.closed.ambient} />

      {/* Key: magenta desde atrás y arriba. Es la que revela los cantos. */}
      <spotLight
        ref={keyRef}
        position={[2.6, 3.4, -2.2]}
        angle={0.85}
        penumbra={0.9}
        intensity={RIG.closed.key}
        color={PALETTE.hotPink}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />

      {/* Rim violeta por el lado opuesto: separa el diario del fondo. */}
      <directionalLight
        ref={rimRef}
        position={[-3.2, 1.4, -1.8]}
        intensity={RIG.closed.rim}
        color={PALETTE.electric}
      />

      {/* Fill cyan, deliberadamente casi imperceptible: sólo acento. */}
      <pointLight position={[-1.8, -0.6, 2.4]} intensity={1.6} color={PALETTE.cyan} distance={7} />

      {/*
        Relleno frontal. Es la luz que hace legible el paisley de la portada:
        con la key detrás, la cara que mira al espectador queda a contraluz y
        el arte del diario —que es el motivo de toda la escena— se pierde.
      */}
      <pointLight
        ref={fillFrontRef}
        position={[1.1, 0.7, 3.4]}
        intensity={RIG.closed.fillFront}
        color={PALETTE.softPink}
        distance={11}
      />
      <pointLight
        ref={fillSideRef}
        position={[-1.4, 0.2, 2.8]}
        intensity={RIG.closed.fillSide}
        color={PALETTE.hotPink}
        distance={9}
      />

      {/*
        Cenital, apagada mientras el diario está cerrado. Se enciende al
        recostarse y es la que revela el papel y las fotografías del spread.
      */}
      <directionalLight
        ref={overheadRef}
        position={[SPINE_X + 0.4, 4.2, 1.2]}
        intensity={RIG.closed.overhead}
        color="#FFF2F8"
      />

      {/* ---------- Glows detrás del diario ---------- */}
      <mesh position={[0.1, 0.35, -1.9]} scale={[7.2, 7.2, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          ref={glowMagentaRef}
          map={glowMagenta}
          transparent
          opacity={GLOW_OPACITY.closed.magenta}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh position={[-1.5, -0.2, -2.6]} scale={[5.4, 5.4, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          ref={glowVioletRef}
          map={glowViolet}
          transparent
          opacity={GLOW_OPACITY.closed.violet}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* ---------- Superficie ---------- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        {reflectiveFloor ? (
          // Reflejo apenas perceptible: no es un espejo. Blur alto y mezcla baja.
          <MeshReflectorMaterial
            resolution={512}
            mixBlur={1}
            mixStrength={0.35}
            blur={[600, 120]}
            depthScale={0.8}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            color={FLOOR_COLOR}
            roughness={0.75}
            metalness={0}
          />
        ) : (
          <meshStandardMaterial color={FLOOR_COLOR} roughness={0.75} metalness={0} />
        )}
      </mesh>

      {/*
        La sombra de contacto se ajusta al diario en vez de cubrir media
        escena. Con un plano grande y mucho blur, la sombra difuminada llega
        al borde del plano y ahí se corta: aparece una línea recta sobre el
        suelo justo donde el rectángulo termina.
      */}
      {shadows && (
        <ContactShadows
          position={[0, FLOOR_Y + 0.004, 0]}
          scale={4.2}
          blur={2.2}
          opacity={0.72}
          far={2.2}
          resolution={512}
          color="#0B0010"
        />
      )}

      {/* Niebla: hunde los bordes de la escena en el fondo profundo. */}
      <fog attach="fog" args={[PALETTE.deep, 5.5, 15]} />
    </>
  )
}
