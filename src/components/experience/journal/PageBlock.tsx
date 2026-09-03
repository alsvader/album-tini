'use client'

/**
 * Bloque de páginas cerradas.
 *
 * Una sola caja en lugar de cientos de hojas. El canto se resuelve con un
 * patrón de líneas finas generado en el fragment shader del propio material
 * (onBeforeCompile) en vez de con geometría: coste cero y se lee como un taco
 * de papel al recibir la luz de rim.
 */

import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { MeshStandardMaterial, type WebGLProgramParametersWithUniforms } from 'three'
import {
  BEVEL_SEGMENTS,
  PAGE_BLOCK_DEPTH,
  PAGE_HEIGHT,
  PAGE_WIDTH,
} from '@/lib/three/journalDims'
import { PALETTE } from '@/lib/assets'

function createPaperEdgeMaterial(): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: PALETTE.paperWarm,
    roughness: 0.92,
    metalness: 0,
  })

  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    // Franjas horizontales muy finas siguiendo la altura del modelo: son las
    // hojas individuales vistas de canto. Se atenúan en las caras planas
    // (normal.z dominante) para que sólo aparezcan en los cantos.
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vLocalPos;
       varying vec3 vLocalNormal;`,
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       vLocalPos = position;
       vLocalNormal = normal;`,
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vLocalPos;
       varying vec3 vLocalNormal;`,
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
       float edgeMask = 1.0 - abs(normalize(vLocalNormal).z);
       float lines = smoothstep(0.35, 0.65, abs(sin(vLocalPos.y * 420.0)));
       gl_FragColor.rgb *= 1.0 - lines * 0.16 * edgeMask;`,
    )
  }

  return material
}

export function PageBlock() {
  const material = useMemo(createPaperEdgeMaterial, [])

  return (
    <RoundedBox
      args={[PAGE_WIDTH, PAGE_HEIGHT, PAGE_BLOCK_DEPTH]}
      radius={0.006}
      smoothness={BEVEL_SEGMENTS}
      material={material}
      castShadow
      receiveShadow
    />
  )
}
