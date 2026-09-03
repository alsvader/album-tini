# Album Tini — Asset Pack v1

Este paquete está preparado para acompañar el prompt de implementación en Cursor / Claude Code.

## Estructura

Los assets viven en `public/assets/` (las rutas de abajo son relativas a esa
carpeta). Las referencias originales se movieron a `docs/`.

- `journal/front-cover.webp` — portada reconstruida para uso como textura.
- `journal/back-cover.webp` — patrón exterior en formato vertical.
- `journal/inside-page.webp` — interior suavizado para colocar fotos por encima.
- `journal/flower-closure.svg` — cierre floral independiente.
- `textures/paper.webp` — textura cálida y sutil para las hojas.
- `textures/polaroid-paper.webp` — textura blanca para marcos de fotos instantáneas.
- `textures/cover-normal.png` — normal map aproximado para dar relieve al material 3D.
- `doodles/*.svg` — elementos vectoriales con `currentColor`, listos para animarse con CSS/GSAP.
- `environment/particle.png` — sprite para partículas.
- `environment/glow-magenta.png` y `glow-violet.png` — glows transparentes.
- `environment/sparkle.png` — destello transparente.
- `docs/references/*` — imágenes originales de referencia.

Además, derivados generados (no forman parte del pack original):

- `landing/journal-peek.webp` — franja superior de la portada, 640x256.
- `landing/journal-cover-sm.webp` — portada completa a 448x672.
- `landing/journal-page.webp` — página interior a 640x960.
- `landing/{escapada,tarde,risas,abrazos}.webp` — fotografías decorativas de las
  Polaroids de la landing: fotos reales de banco (CC0), elegidas a mano para
  encajar con el `alt` de cada una en `src/data/landing.ts`.

Los cinco primeros se regeneran con `npm run assets:landing`.

## Recomendación de uso

### Three.js / React Three Fiber
Usar `front-cover.webp`, `back-cover.webp` y `cover-normal.png` como texturas del modelo del diario.
Los glows y partículas pueden usarse como sprites o billboards.

### Interior del álbum
Usar `inside-page.webp` como fondo decorativo. Colocar por encima las fotografías con marco tipo instantánea.

### Landing
**No** usar `front-cover.webp` ni `inside-page.webp` directamente en la landing: pesan 599 KB
y 107 KB porque son texturas del modelo 3D, y ahí se pintan como adornos de 128 a 224 px.
Usar los derivados de `landing/` (`ASSETS.landingJournal` en `src/lib/assets.ts`).

### Doodles
Los SVG usan `stroke="currentColor"` para que Cursor/Claude pueda cambiar su color desde CSS/Tailwind.
Son apropiados para `stroke-dasharray` / `stroke-dashoffset`.

### Responsive
Desktop: diario abierto a doble página.
Mobile: una página por viewport y navegación por swipe.

## Modelo 3D
Este paquete NO incluye el `.glb` y la implementación tampoco lo usa: el diario
se construye con geometría procedural de Three.js (ver README). La estructura de
piezas es la que se recomendaba aquí:
- FrontCover
- BackCover
- Spine
- PageBlock
- Pages (3–6 meshes reutilizables)

El modelo debe exponer pivotes de apertura en el lomo y estar optimizado para WebGL.
