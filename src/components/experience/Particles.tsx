'use client'

/**
 * Polvo mágico del escenario.
 *
 * Un único THREE.Points con shader propio, no cientos de meshes. Todo el
 * movimiento se calcula en el vertex shader a partir de `uTime`, así que el
 * coste en JavaScript por frame es cero y el número de partículas sólo afecta
 * a la GPU. Los atributos por partícula (semilla, escala, velocidad) dan la
 * variación de tamaño, profundidad, opacidad y ritmo.
 *
 * No debe leerse como nieve: la deriva vertical es lenta y hay tanto subida
 * como bajada, con un vaivén horizontal desfasado por partícula.
 */

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { AdditiveBlending, Color, type ShaderMaterial } from 'three'
import { ASSETS } from '@/lib/assets'
import { useQualitySettings } from '@/hooks/useQualityTier'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uReveal;

  attribute float aScale;
  attribute float aSeed;
  attribute float aSpeed;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Deriva vertical con envolvente: al salir por arriba reaparece por abajo.
    float span = 7.0;
    float drift = mod(pos.y + uTime * aSpeed + aSeed * span, span) - span * 0.5;
    pos.y = drift;

    // Vaivén horizontal desfasado por semilla.
    pos.x += sin(uTime * 0.22 * aSpeed + aSeed * 6.283) * 0.32;
    pos.z += cos(uTime * 0.17 * aSpeed + aSeed * 4.712) * 0.24;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Tamaño con atenuación por distancia real. El factor es deliberadamente
    // pequeño: son motas de polvo, no bokeh. Con valores altos las partículas
    // se convierten en manchas que lavan el fondo y se comen al diario.
    gl_PointSize = aScale * uPixelRatio * (14.0 / -mvPosition.z);

    // Las lejanas y las que se acercan al borde del recorrido se apagan.
    float depthFade = smoothstep(-9.0, -2.0, mvPosition.z);
    float edgeFade = 1.0 - smoothstep(2.2, 3.4, abs(drift));
    vAlpha = depthFade * edgeFade * (0.14 + aSeed * 0.46) * uReveal;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying float vAlpha;

  void main() {
    vec4 sprite = texture2D(uMap, gl_PointCoord);
    if (sprite.a < 0.01) discard;

    // Mezcla de rosa y violeta según el brillo del sprite.
    vec3 tint = mix(uColorA, uColorB, sprite.r);
    gl_FragColor = vec4(tint, sprite.a * vAlpha);
  }
`

type Props = {
  /**
   * Visibilidad 0–1, por referencia y no por prop.
   *
   * La intro la anima frame a frame; pasarla como estado de React
   * re-renderizaría toda la escena unas sesenta veces por segundo. Con un ref
   * la lee `useFrame` y React no se entera.
   */
  revealRef: React.RefObject<number>
}

export function Particles({ revealRef }: Props) {
  const materialRef = useRef<ShaderMaterial>(null)

  const map = useTexture(ASSETS.environment.particle)
  const { particles: count } = useQualitySettings()

  // Se recalcula sólo si cambia el número de partículas, nunca por frame.
  const attributes = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const seeds = new Float32Array(count)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Distribución en una caja alrededor del diario, más densa al centro.
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7
      // Sesgadas hacia atrás: delante del diario estorban.
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1.4

      // Sesgado a lo pequeño: unas pocas destacan y el resto son polvo fino.
      scales[i] = 1 + Math.random() * Math.random() * 4.2
      seeds[i] = Math.random()
      // Algunas suben y otras bajan: evita la lectura de "nieve".
      speeds[i] = (0.08 + Math.random() * 0.26) * (Math.random() > 0.3 ? 1 : -1)
    }

    return { positions, scales, seeds, speeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(typeof window === 'undefined' ? 1 : devicePixelRatio, 2) },
      uReveal: { value: 0 },
      uMap: { value: map },
      uColorA: { value: new Color('#FF6DB6') },
      uColorB: { value: new Color('#BD00FF') },
    }),
    [map],
  )

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material) return
    material.uniforms.uTime!.value += delta
    material.uniforms.uReveal!.value = revealRef.current ?? 1
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        {/* `count` sale del tamaño del array y del itemSize; declararlo además
            como prop sólo abre la puerta a que ambos se desincronicen. */}
        <bufferAttribute attach="attributes-position" args={[attributes.positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[attributes.scales, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[attributes.seeds, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[attributes.speeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}
