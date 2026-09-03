> **Histórico.** Esta especificación describe un `journal.glb` que nunca se
> autoró. La implementación no usa ningún modelo: cada pieza del diario es
> geometría procedural (`RoundedBox` + planos con la textura del arte), y los
> ángulos y pivotes reales viven en `src/lib/three/journalDims.ts` y en los
> componentes de `src/components/experience/journal/`. Se conserva como registro
> de la intención inicial; **no seguirla como referencia**.

# journal.glb — especificación para la fase 3D

## Formato
GLB / glTF 2.0

## Escala y orientación
- Alto lógico: 2.4 unidades
- Ancho cerrado: 1.6 unidades
- Grosor: 0.10–0.14 unidades
- Y = arriba
- Z = frente

## Nodos
- `JournalRoot`
- `FrontCover`
- `BackCover`
- `Spine`
- `PageBlock`
- `PageLeft`
- `PageRight`
- `ClosureFlower`

## Pivotes
`FrontCover` debe pivotar desde el borde izquierdo/lomo.
Las páginas deben tener el pivote en el centro/lomo.

## Materiales
- CoverMaterial: roughness 0.48–0.58, normalMap `cover-normal.png`
- PaperMaterial: roughness 0.82–0.92
- ClosureMaterial: roughness 0.65

## Animaciones sugeridas
- `cover_open`: 0° → -168°
- `cover_close`
- `page_flip_left`
- `page_flip_right`

Para web, mantener el modelo por debajo de ~30k tris y texturas máximas de 2K.
