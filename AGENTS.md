<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Álbum de Tini — reglas del proyecto

Este archivo no explica el proyecto: dice **dónde está explicado** y recoge lo que no está
escrito en ningún otro sitio. Si algo aparece aquí y también en el README, sobra aquí.

> El bloque de arriba lo escribe y lo re-añade `next dev`. **No borrarlo**: quitarlo solo
> vuelve a crear el cambio sin commitear. Todo lo nuevo va **por debajo** del marcador
> `END:nextjs-agent-rules`, que es la única zona que el generador no toca
> (`upsertAgentRulesBlock` en `node_modules/next/dist/server/lib/generate-agent-files.js`
> reconstruye el archivo como `antes + bloque + después`).
>
> `CLAUDE.md` es un único `@AGENTS.md`. No duplicar nada ahí.

## Antes de dar algo por bueno

```bash
npm run typecheck    # tsc --noEmit
npm run build        # lo único que valida los boundaries server/client
```

- **`npm run lint` no funciona.** `next lint` se eliminó en Next 16
  (`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md:1084`) y el repo no
  tiene eslint ni biome. No instalar un linter de paso: es un cambio de tooling y merece su
  propio PR.
- **En un checkout limpio `typecheck` falla** hasta ejecutar `npm run assets:doodles`:
  `src/data/doodles.generated.ts` está gitignorado. `dev` y `build` ya lo generan en
  `predev`/`prebuild`; `typecheck` no.
- No hay tests. Y `scripts/` está excluido de `tsconfig.json`, así que los `.mjs` no se
  typechequean: al tocarlos, ejecutarlos.

## Dónde está cada cosa

| Necesito… | Está en |
|---|---|
| Arrancar, tabla de scripts, despliegue | `README.md` → *Arranque*, *Despliegue a producción* |
| Rutas y árbol de `src/` | `README.md` → *Rutas*, *Arquitectura* |
| El **porqué** de las decisiones de fondo | `README.md` → *Decisiones que conviene conocer* |
| Tiers de calidad, accesibilidad, límites del producto | `README.md` → *Rendimiento*, *Accesibilidad*, *Límites conocidos de esta versión* |
| Añadir fotos al álbum de ejemplo | `README.md` → *Añadir fotografías al álbum de ejemplo* |
| Paleta, tipografía, tokens y estructura de la landing | `docs/DESIGN.md` |
| Qué asset usar, cuánto pesa y cuál no servir en el DOM | `ASSETS.md` |
| Regenerar o iterar el diseño en Stitch | `docs/landing-redesign-prompt.md` |
| Variables de entorno y checklist de producción | `.env.example` |
| APIs de Next 16 (cambiaron respecto a lo que "sabes") | `node_modules/next/dist/docs/` |
| Paleta y rutas de assets en JSON | `manifest.json` |

`docs/MODEL_SPEC.md` es **histórico**: describe un `journal.glb` que nunca se autoró. El
diario es geometría procedural. No seguirlo como especificación.

## Estilo de código

No hay prettier, eslint ni editorconfig: el estilo solo vive en el código.

- Comillas **simples**, **sin punto y coma**, 2 espacios, coma final en multilínea.
- Docblock `/** */` en **español** al principio de cada módulo, explicando el **porqué** y no
  el qué. Es la convención más visible del repo: mantenerla.
- Clases condicionales de Tailwind: array unido con `[...].join(' ')`.
- Imports: `@/…` para cruzar módulos, `./…` entre hermanos.
- `'use client'` en la primera línea, antes del docblock.
- Identificadores en inglés; comentarios, copy y documentación en español.

**No ejecutar `npx prettier --write` sin flags.** No hay configuración, así que usa sus
valores por defecto y mete punto y coma y comillas dobles en todo lo que toque. Si hace
falta formatear:

```bash
npx prettier --write --no-semi --single-quote --print-width 90 <archivos>
```

`noUncheckedIndexedAccess` está activo. El repo resuelve el indexado con `!`
(ver `src/data/spreads.ts`), no con guardas inventadas.

## Reglas por tipo de tarea

### Añadir o cambiar una sección de la landing

Server component por defecto: hoy solo bajan al navegador `Doodle`, `Polaroid`, `Reveal` y la
constelación del hero. Concretamente:

- La copy va a **`src/data/landing.ts`**, no en el JSX. Ahí está toda la de las 9 secciones.
- Envolver en **`<Reveal>`** (`src/components/landing/Reveal.tsx`) para la aparición al
  scroll. Acepta `className` —hace falta cuando es hijo directo de un grid— y `delay`.
  Ojo: `Reveal` lleva `transform` mientras está oculto, así que es el bloque contenedor de
  cualquier hijo absoluto; si el hijo debe posicionarse contra otra cosa, pon el `relative`
  donde corresponda.
- Reutilizar `<Doodle>`, `<Polaroid>` y `<WashiTape>`. No recrear el estilo.
- Colores y tipografías **solo con los tokens** de `src/app/globals.css`. Ningún hex suelto.
- Si la sección lleva `id` para el menú, añadir `scroll-mt-24`: la barra es `fixed` y sin eso
  el titular queda debajo.
- Ritmo: `py-28 sm:py-36`, contenedor `max-w-7xl px-6 sm:px-12 lg:px-16`.
- Montarla en **`src/app/page.tsx`**, en su sitio del orden. Ese archivo es lo único de la
  landing que necesita servidor: resuelve `getUser()` para que la barra salga con el enlace
  correcto en el primer HTML, sin parpadear de «Entrar» a «Mis álbumes».
- Cada sección pone su propio fondo; no hay un degradado global.

### Usar `<Polaroid>` fuera del diario

Siempre con los dos flags, y con un `id` propio:

```tsx
<Polaroid entry={...} active typeCaption={false} entrance={false} />
```

- `typeCaption={false}` — el typewriter marca la entrada como «ya escrita» en el store global
  de zustand, que **sobrevive a la navegación de cliente**. Una Polaroid decorativa dejaba los
  captions de `/demo` completos en vez de escribiéndose.
- `entrance={false}` — con la entrada activa el HTML del servidor sale con `opacity: 0` y la
  foto no aparece hasta que hidrata. En el diario da igual (está detrás de la pantalla de
  carga); en una portada de marketing, no.
- **`id` con prefijo propio** si reutilizas una entrada de `journalEntries`. Patrón:
  `MEMORY_MAIN` en `src/data/landing.ts` es `journalEntries[0]` con `id: 'landing-memoria'`.
  Sin eso, el id colisiona con `'01'` en ese mismo store.

### Escribir clases de Tailwind

Tailwind v4 sin `tailwind.config`: el escáner solo ve **cadenas literales completas**.
`left-[${x}%]` o `` `rotate-[${deg}deg]` `` **no generan CSS y fallan en silencio**.

- Geometría que viene de datos → literal completo en la constante. Patrón: el campo `place` de
  `HeroPolaroidSpec` en `src/data/landing.ts`.
- O bien `style={{}}`, como hace el hero con los degradados.
- El escape es `@source inline(…)` en `globals.css`, y es el último recurso.

El convenio `.join(' ')` es seguro **solo** porque las piezas son literales.

### Animación decorativa

Va en **CSS**, dentro de `@media (prefers-reduced-motion: no-preference)` de `globals.css`,
no en framer y no consultando el store.

`useReducedMotion()` lee un store que arranca en `false` y lo corrige un efecto del layout
raíz; React ejecuta los efectos de hijo a padre, así que el primer render de cualquier hijo
lee el valor equivocado y anima un frame. El bloque `prefers-reduced-motion: reduce` de
`globals.css` apaga todas las animaciones y transiciones CSS con `!important`, correctamente y
desde el primer frame. Contrapartida: **no se puede usar una transición CSS para nada
funcional**, porque para esos usuarios no ocurre.

Todo lo que **oculta** contenido va dentro de `no-preference`, para que quien tenga la
preferencia activa reciba la página visible y sin depender de JavaScript.

### Añadir o derivar un asset

- **Nunca servir las texturas del diario crudas en el DOM.**
  `public/assets/journal/front-cover.webp` son 599 KB a 1600×2400 porque el libro 3D la usa
  como textura. Para el DOM, derivados al tamaño de render con
  `scripts/make-landing-photos.mjs` (`npm run assets:landing`).
- Declarar la ruta en `src/lib/assets.ts`; si el asset deriva del pack, además en
  `manifest.json` y `ASSETS.md`. Las fotos decorativas son **contenido**, no pack: van en
  `src/data/landing.ts`.
- Un script de assets **no** se engancha a `predev`/`prebuild` si depende de la red: un build
  en CI no puede depender de una CDN. `extract-doodles` sí va ahí porque su fuente está en el
  repo.

### Tocar la paleta

Manda **`src/app/globals.css`** y se propaga al diario 3D, las Polaroids y el álbum. Está
duplicada a propósito en dos sitios más, y los tres se cambian juntos: `manifest.json` y
`PALETTE` de `src/lib/assets.ts`.

Regla del propio `globals.css`: rosas, violetas y magentas dominan; el cyan y el lima son
**solo acentos**.

### Añadir un doodle

SVG con `stroke="currentColor"` en `public/assets/doodles/`, luego `npm run assets:doodles`.
**No editar `src/data/doodles.generated.ts`**: es autogenerado y gitignorado, y la fuente de
verdad son los SVG. Los 11 nombres disponibles salen de ahí como tipo `DoodleName`.

### Cambiar los límites (24 fotos / 60 caracteres)

Están sincronizados en **tres** sitios: `src/lib/albumRules.ts`, la función SQL
`create_published_album`, y la copy del FAQ de la landing (que los importa de `albumRules`, no
los escribe a mano). Subir el tope de fotos exige antes paginar las hojas de `DesktopBook`,
que las monta todas a la vez.

### Cruzar la frontera servidor/cliente

`src/lib/albums.ts` y `src/lib/supabase/server.ts` importan `next/headers`: **un componente de
cliente que los importe rompe el build**. Por eso los valores puros viven aparte, en
`src/lib/albumRules.ts` y `src/lib/supabase/env.ts`. Antes de importar algo desde un
`'use client'`, comprobar que la cadena de imports no llega a `next/headers`.

### Tocar el diario o la escena 3D

Leer el docblock del archivo **antes** de editarlo: ahí está el porqué, y suele haber un aviso.
Lo transversal:

- **GSAP es dueño único de los transforms de las hojas** en el page flip. El JSX no declara
  `transform` ni rotación inicial.
- El compás compartido entre las capas 3D y DOM está en `src/lib/timings.ts`, y los valores
  encajan entre sí (`at + duration * 2` de una animación en yoyo debe caer en `total`).
- `useTexture` **cachea por URL**: mutar `offset`/`repeat` sobre la textura original afecta a
  todos los materiales que la comparten. Clonar con `cropped()` / `tiled()` de
  `src/lib/three/textures.ts`.
- Mapas de color con `asColorMap()` (sRGB), normal maps con `asDataMap()` (lineal).
- La cámara no se anima escribiendo en `camera.position`: GSAP interpola un objeto plano y un
  único `useFrame` hace `position.set` + `lookAt`.
- Ajustar rendimiento se hace en un solo sitio: `QUALITY_SETTINGS` de
  `src/hooks/useQualityTier.ts`.

### Tocar la base de datos

- Migración **nueva**; nunca editar una ya aplicada.
- Las políticas RLS de un mismo comando se combinan con **OR**. Sobre `albums` hay dos de
  lectura (la del dueño y la pública de los publicados), así que las consultas **filtran
  explícitamente**: el `.eq('owner_id', …)` de `getMyAlbums` no es redundante. RLS es el suelo,
  no la consulta.
- `create_published_album` sigue siendo `security invoker` (para que `auth.uid()` y RLS
  apliquen dentro) y conserva `set search_path = public, extensions` (pgcrypto vive ahí).
- El prefijo `{uid}/{albumId}/` de Storage se valida en el Server Action **y** dentro de la
  función SQL. Esa duplicación es deliberada: la ruta llega como entrada del usuario porque la
  subida va directa del navegador. No quitar ninguna de las dos.
- No hace falta la service-role key en ninguna parte. Si aparece, algo se está saltando RLS.

### Enviar una feature que cambie el producto

Revisar si la copy de la landing pasó a mentir. Hoy hay dos frases acopladas al código:

- El FAQ dice que la edición de álbumes **«está en camino»** → si se implementa (o se descarta),
  cambiar `FAQ` en `src/data/landing.ts`.
- El cierre dice **«Solo necesitas un correo»** → depende de que `/crear` siga exigiendo sesión
  (`PROTECTED` en `src/proxy.ts`).

Los límites del FAQ no hay que tocarlos: se importan de `albumRules`.

## Comprobar el resultado en el navegador

`npm run dev` y Chrome headless por CDP (Node 22 ya trae `WebSocket`, no hace falta instalar
playwright):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars \
  --remote-debugging-port=9222 --user-data-dir=/tmp/perfil about:blank
```

Tres cosas que cuestan horas si no se saben:

1. **La página headless arranca en `visibilityState: 'hidden'`, y eso congela
   `requestAnimationFrame`.** Framer, el typewriter y el parallax no corren, y parece un bug
   del código: las Polaroids se quedan a `opacity: 0` para siempre. Hay que emitir
   `Emulation.setFocusEmulationEnabled {enabled:true}` y
   `Page.setWebLifecycleState {state:'active'}` antes de medir.
2. **`prefers-reduced-motion` hay que emularlo *antes* de navegar** (`Emulation.setEmulatedMedia`),
   o no se ve el primer render, que es justo donde están los fallos. Y la emulación **persiste
   en la pestaña**: limpiarla antes de la siguiente prueba.
3. Para leer el typewriter hay que consultar el **`span[aria-hidden]`**: `figcaption` contiene
   además el texto íntegro en un `sr-only`, así que su `textContent` siempre parece completo.

Para una captura de página completa con los reveals disparados: recorrer el scroll en pasos
antes de `Page.captureScreenshot` con `captureBeyondViewport`.

## Trampas que no están en el README

Una línea cada una, con su archivo. Las de tuning (luces, sombras, tamaño de partícula) viven
en los docblocks correspondientes.

- **`src/data/spreads.ts`** — no volver a exportar `PAGES`/`SPREADS`/`LEAVES` como constantes
  de módulo: ataba la experiencia a un único álbum. El contenido baja por props vía
  `buildAlbum(album)`.
- **`src/data/spreads.ts`** — `hashId` debe seguir siendo determinista en cliente y servidor, o
  las rotaciones y doodles derivados provocan saltos de hidratación. Nada de `Math.random()`.
- **`src/components/journal/DesktopBook.tsx`** — `useLayoutEffect` y no `useEffect`: GSAP tiene
  que fijar el estado de partida antes del primer pintado.
- **`src/components/experience/IntroExperience.tsx`** — el wrapper del Canvas se renderiza
  **siempre**; lo condicional es el `<Canvas>` de dentro. Y lleva `pointer-events-none` en
  `album`/`closing`: `opacity: 0` no desactiva el hit-testing.
- **`Particles` / `FloatingDoodles`** — el progreso de aparición se pasa como **ref**, no como
  estado: como estado re-renderizaría la escena 60 veces por segundo.
- **`useJournalNavigation`, `CreateAlbumForm.addFiles`** — los setters se llaman al mismo nivel,
  nunca dentro del updater de otro: React puede invocar un updater más de una vez.
- **`CreateAlbumForm.addFiles`** — copiar el `FileList` **antes** de vaciar `input.value`: es el
  mismo objeto que `event.target.files`.
- **`src/hooks/useMediaQuery.ts`** — devuelve `false` en SSR y en el primer render. Para
  distinguir «aún no sé» de «no», usar `useBreakpoint()`, que devuelve `'unknown'`.
- **`src/hooks/useBookSize.ts`** — devuelve `null` hasta el primer efecto; `AlbumExperience` no
  pinta nada mientras.
- **`useReducedMotionSync()`** se llama **una sola vez**, en `<MotionPreference />` del layout
  raíz. Llamarlo por página fue el bug original.
- **`src/app/globals.css`** — el bloqueo de scroll es **por ruta** (`<ViewportLock />` en
  `(journal)/layout.tsx`), no un `overflow: hidden` global: con eso la landing quedaba
  recortada a una pantalla.
- **`src/proxy.ts`** — se llama `proxy` y no `middleware` porque Next 16 renombró la
  convención. No renombrarlo.
- **`src/state/experience.ts`** — zustand y no Context porque el estado se lee a ambos lados del
  root de R3F (el `<Canvas>` monta su propio reconciler). Y `requestOpen`/`requestClose`/
  `skipIntro` son guardas: llamarlos desde otro estado no hace nada **y no avisa**.
- **`useTexture`** se usa en forma de **objeto** y no de tupla, por `noUncheckedIndexedAccess`.
- **`src/components/ui/Doodle.tsx`** — se renderiza inline y no como `<img>` porque hay que
  animar `stroke-dashoffset`; `pathLength={1}` normaliza el trazo.
- **`TypewriterCaption`** deja el texto completo en un `sr-only` y el nodo animado en
  `aria-hidden`, o el lector de pantalla anunciaría letra por letra.
- **La clave de Stitch** va en el entorno (`STITCH_API_KEY`), no en `.mcp.json`, que se versiona.

## Estado y deuda conocida

- La landing se reimplementó desde el diseño de Stitch «Editorial Invertido». Sistema y tabla de
  divergencias en `docs/DESIGN.md`.
- Falta `public/assets/audio/ambient.mp3`: `useAmbientAudio` está listo y el control se habilita
  solo cuando el archivo exista.
- La edición permite añadir fotos, editar sus descripciones, reordenarlas y borrar el álbum
  entero; no permite tocar el título, el subtítulo, el texto de cierre ni la "época" de una foto
  ya guardada. El acceso con Facebook está cableado e inactivo.
- Los ficheros de Storage huérfanos (pestaña muerta durante la subida) no se limpian.
- `npm run lint` está roto y seguirá roto hasta que se instale un linter.
