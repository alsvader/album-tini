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

## Recomendación de uso

### Three.js / React Three Fiber
Usar `front-cover.webp`, `back-cover.webp` y `cover-normal.png` como texturas del modelo del diario.
Los glows y partículas pueden usarse como sprites o billboards.

### Interior del álbum
Usar `inside-page.webp` como fondo decorativo. Colocar por encima las fotografías con marco tipo instantánea.

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
