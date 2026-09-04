# Álbum de Tini

Herramienta para crear tu propio diario con tus fotos: se sube un puñado de
imágenes, se escribe qué recuerda cada una, y se publica con un enlace propio.
Quien lo abra ve un diario físico dentro de una escena 3D que se abre de verdad,
con las fotos como instantáneas y los textos escribiéndose a mano.

```
intro 3D  →  diario cerrado  →  apertura  →  álbum (doble página / página única)
                   ↑                                        │
                   └──────────────  cierre  ────────────────┘
```

El ciclo se cierra: en la última página hay un botón «Cerrar el diario» que
devuelve al libro cerrado, desde donde se puede abrir otra vez. La intro no se
repite —es una primera impresión— y el álbum arranca de nuevo desde la primera
página, con los captions volviendo a escribirse.

## Arranque

Hace falta Docker en marcha para el Supabase local.

```bash
npm install
npx supabase start          # levanta Postgres, Auth y Storage en Docker
cp .env.example .env.local  # y rellenar con lo que imprime `supabase status`
npm run dev                 # http://localhost:3000
```

> Los puertos son **544xx** y no los 543xx por defecto (ver `supabase/config.toml`):
> este equipo tenía otro proyecto Supabase ocupando ese bloque y ambos deben
> poder correr a la vez. Los valores reales salen siempre de
> `npx supabase status`.

Scripts:

| Script | Qué hace |
|---|---|
| `npm run dev` / `build` | Next.js. Ambos ejecutan antes `assets:doodles`. |
| `npm run typecheck` | `tsc --noEmit` en modo estricto. |
| `npm run assets:doodles` | Extrae los `d` de `public/assets/doodles/*.svg` a `src/data/doodles.generated.ts`. |
| `npm run assets:photos` | Descarga las fotografías (banco CC0) de `public/photos/` (sólo las de la demo). |
| `npm run assets:landing` | Descarga las fotografías decorativas de la landing y deriva los recortes del diario en `public/assets/landing/`. |
| `npx supabase start` / `stop` | Stack local en Docker. |
| `npx supabase db reset` | Recrea la base aplicando las migraciones desde cero. |

> En un checkout limpio, `npm run typecheck` falla hasta ejecutar
> `npm run assets:doodles`: `src/data/doodles.generated.ts` está gitignorado y
> sólo lo generan `predev`/`prebuild`. Y `npm run lint` no funciona —`next lint`
> se eliminó en Next 16 y no hay linter instalado—: la verificación son
> `typecheck` y `build`. Las reglas de trabajo están en `AGENTS.md`.

## Diseño (Google Stitch)

El sistema de diseño de la landing está en `docs/DESIGN.md`, generado desde el
diseño de Stitch. **En color y tipografía manda `src/app/globals.css`**: esos
tokens los usan también el diario 3D, las Polaroids y el álbum, así que cambiar
la paleta se propagaría a toda la experiencia. `DESIGN.md` trae al final una
tabla de divergencias con lo que no coincide.

Para consultar el diseño desde Claude Code hay un servidor MCP declarado en
`.mcp.json`, que lee la clave del entorno:

```bash
export STITCH_API_KEY=…   # antes de arrancar Claude Code
```

> La clave va en el entorno y **no** en `.mcp.json`: ese archivo se versiona y
> `.gitignore` sólo cubre `.env*`, así que una clave literal ahí quedaría
> publicada en el primer commit.

`docs/landing-redesign-prompt.md` es el prompt que se le dio a Stitch, no su
resultado. Sirve como referencia de intención; la estructura real de la landing
es la del diseño.

Las reglas para *implementar* sobre ese sistema —qué componentes reutilizar, qué
flags necesita `Polaroid` fuera del diario, por qué las clases de Tailwind tienen
que ser literales— están en `AGENTS.md`.

## Rutas

```
/                  landing
/demo              álbum de ejemplo, con las fotos mock del repo
/album/[slug]      álbum publicado (público con el enlace, noindex)
/login             acceso y registro
/crear             subir fotos, escribir descripciones y publicar   (con sesión)
/mis-albumes       listado de tus álbumes                            (con sesión)
/auth/callback     retorno de OAuth (login con Google)
```

## Añadir fotografías al álbum de ejemplo

Sólo afecta a `/demo`. Los álbumes de usuario vienen de la base de datos.
Es el único paso necesario: editar `src/data/journal.ts`.

```ts
export const journalEntries: readonly JournalEntry[] = [
  {
    id: '05',                          // único y estable
    photo: '/photos/photo-05.webp',    // cuadrada; el marco es 1:1
    caption: 'Nuestro verano',
    date: 'Julio',                     // opcional
    rotation: -1.8,                    // opcional; si falta se deriva del id
    alt: 'Descripción de la imagen',   // opcional; por defecto el caption
    doodles: ['heart', 'star'],        // opcional; máximo 2
  },
]
```

La paginación, los spreads, las hojas del page flip, los puntos de navegación y
el total de páginas se derivan de ese arreglo en `src/data/spreads.ts`. No hay
páginas escritas a mano en el JSX.

Las fotos de la demo son reales, de un banco de imágenes CC0 (dominio público),
descargadas por `scripts/fetch-demo-photos.mjs`. Para usar otras basta
sobrescribir los archivos de `public/photos/` (cuadradas, WebP, ~960px) o
apuntar `photo` a otra ruta.

## Arquitectura

```
src/
├── app/
│   ├── page.tsx             landing
│   ├── (journal)/           rutas a pantalla completa: /demo y /album/[slug]
│   ├── login/               formulario + Server Actions de auth
│   ├── crear/               composición y publicación de un álbum
│   ├── mis-albumes/         listado del usuario
│   ├── auth/callback/       retorno de OAuth
│   └── globals.css          tokens de paleta y tipografías, utilidades propias
├── state/experience.ts      máquina de estados: loading → intro → ready → opening → album
├── proxy.ts                 refresco de sesión y rutas protegidas
├── lib/
│   ├── supabase/            clientes de navegador y servidor, env validado
│   ├── albums.ts            consultas (servidor) · albumRules.ts (límites, puro)
│   ├── assets.ts            rutas del pack de assets, tipadas
│   ├── resizeImage.ts       redimensionado en canvas antes de subir
│   ├── framing.ts           puente cámara 3D ↔ tamaño del libro DOM
│   ├── timings.ts           compás compartido entre las capas 3D y DOM
│   └── three/               dimensiones, texturas, doodle → textura
├── data/
│   ├── journal.ts           contenido del álbum de ejemplo (/demo)
│   ├── landing.ts           Polaroids decorativas y toda la copy de la landing
│   ├── spreads.ts           páginas → spreads → hojas (funciones puras)
│   └── doodles.generated.ts autogenerado desde los SVG
├── hooks/                   media query, reduced motion, calidad, navegación,
│                            typewriter, tamaño del libro, GSAP, audio
└── components/
    ├── experience/          escena 3D: entorno, partículas, doodles, cámara, intro
    │   └── journal/         piezas del diario: tapas, lomo, páginas, cierre floral
    ├── journal/             álbum DOM: libro doble, libro móvil, página,
    │                        Polaroid, caption, controles
    ├── landing/             las 9 secciones de la portada + Reveal y WashiTape
    └── ui/                  doodle inline, carga, música, fallback sin WebGL
```

### Decisiones que conviene conocer

**El álbum se pasa por props, no se importa.** `spreads.ts` exportaba `PAGES`,
`SPREADS` y `LEAVES` como constantes calculadas al cargar el módulo desde el
arreglo estático, lo que ataba la experiencia a un único álbum. Ahora
`buildAlbum(album)` recibe el contenido y la cadena
`page → IntroExperience → AlbumExperience → Desktop/MobileBook` lo baja. El
diario no sabe si viene de un arreglo o de la base de datos.

**Los bytes de las fotos no pasan por el servidor.** Las mutaciones van en
Server Actions —validación inesquivable y `revalidatePath`—, pero la subida va
directa del navegador a Storage: un Server Action es un único POST con límite de
cuerpo y sin progreso por archivo, y el redimensionado ocurre en canvas, así que
el archivo ya está en el cliente. Como contrapartida, las rutas de Storage
llegan como entrada del usuario y hay que validar que empiecen por
`{auth.uid()}/{albumId}/` — se comprueba en el action **y** dentro de la función
SQL.

**El álbum se crea al final, en una transacción.** El SDK no da transacciones, así
que la inserción va en una función SQL (`create_published_album`) con
`security invoker`, para que `auth.uid()` y RLS sigan aplicando dentro. Primero
se sube todo y después se crea el álbum: si algo falla antes, no queda ningún
álbum a medias.

**RLS es el suelo, no la consulta.** Las políticas de un mismo comando se
combinan con OR, y sobre `albums` hay dos de lectura: la del dueño y la pública
de los publicados. Por eso `/mis-albumes` **tiene que** filtrar por `owner_id`
explícitamente; sin ese filtro listaba los álbumes publicados de cualquiera.

**El diario es geometría, no un modelo.** No hay `.glb`. Cada tapa es un
`RoundedBox` (aporta el bisel que capta la luz de rim) más un plano con la
textura del arte, porque las UV de una caja redondeada no son planares.

**El lomo pintado se recorta.** `front-cover.webp` trae un lomo oscuro en el
borde izquierdo de la imagen. Se recorta por UV (`FRONT_COVER_UV`) y el lomo se
construye como geometría aparte; los valores salen de medir la luminancia por
columna de la propia imagen. La flor del cierre también viene pintada, y el
pétalo 3D se posiciona sobre ella con esa misma medición.

**Las dos capas se dimensionan con la misma función.** `lib/framing.ts` decide
a la vez dónde termina la cámara y qué tamaño en píxeles tiene el libro DOM, así
que el crossfade encaja por construcción y sigue encajando al redimensionar. En
móvil el 3D encuadra una sola página, porque el álbum DOM muestra una.

**El rig de luces tiene dos configuraciones.** Cerrado y de pie, la portada
necesita relleno frontal fuerte. Abierto y recostado, esas mismas luces queman
el papel blanco. El rig interpola entre ambas al abrir, y al cerrar sigue el
mismo compás que el giro de la tapa en lugar de adelantarse.

**El Canvas sobrevive al álbum, con el bucle detenido.** Para cerrar el diario
animando la apertura en reversa hace falta que el estado 3D —cámara cenital,
tapa abierta, diario recostado— siga existiendo mientras se leen las páginas: un
montaje nuevo nacería con el diario ya cerrado y no habría nada que invertir. Con
`frameloop` en `never` el coste por frame es nulo y lo único que se paga es la
memoria de GPU de las texturas. En el tier `low` no compensa: allí el Canvas se
desmonta y el cierre pasa a ser un fundido (`keepCanvasAlive` en
`hooks/useQualityTier.ts`).

**GSAP es dueño único de los transforms de las hojas** en el page flip. React
las renderiza una vez y no vuelve a tocar su `transform`.

### Rendimiento

`hooks/useQualityTier.ts` deriva un tier (`high` / `medium` / `low`) y de ahí
salen partículas, doodles, DPR, sombras, reflejo del suelo y si el Canvas
sobrevive al álbum. Las partículas son un único `THREE.Points` animado en el
vertex shader (coste en JS por frame: cero). No hay postprocessing. Tras el
crossfade el bucle de render se detiene siempre; el Canvas sólo se desmonta en
el tier `low`.

### Accesibilidad

Botones reales con `aria-label`, navegación con `ArrowLeft` / `ArrowRight`,
`alt` en cada fotografía, caption completo en un nodo para lectores de pantalla
mientras el visible se teclea, y `prefers-reduced-motion` respetado (sin intro
larga, sin parallax, flip simplificado, typewriter instantáneo, cierre
inmediato). Al cerrar el diario el foco vuelve al botón «Abre el diario», porque
la página que lo tenía se desmonta. Sin WebGL se entra directamente al álbum.

### Música

`useAmbientAudio` está preparado pero el pack no incluye audio todavía. Coloca
`public/assets/audio/ambient.mp3` y el control se habilita solo. Nunca suena sin
interacción del usuario.

## Límites conocidos de esta versión

- **Tope de 24 fotos por álbum.** `DesktopBook` monta todas las hojas a la vez,
  así que el coste crece de forma lineal. Subirlo pide paginar las hojas por
  ventana antes.
- **HEIC**: las fotos de iPhone pueden no decodificarse en canvas fuera de
  Safari. iOS suele convertirlas a JPEG al elegirlas de la galería; si llega un
  HEIC de verdad se avisa en vez de fallar en silencio.
- **Bucket público.** Una foto de un álbum no publicado es alcanzable si se
  conoce la ruta exacta (tres UUID, no adivinable). Es lo coherente con
  «público con el enlace» y evita URLs firmadas que caducan.
- **Ficheros huérfanos.** No se sube nada mientras se compone, así que abandonar
  la página no deja rastro. Si la pestaña muere *durante* la subida quedan
  ficheros sin álbum: invisibles, pero ocupan espacio. Falta una tarea de
  limpieza.
- Se puede añadir fotos, editar sus descripciones, reordenarlas y borrar el
  álbum entero desde «Mis álbumes», pero no editar el título, el subtítulo, el
  texto de cierre ni la "época" de una foto ya guardada.

## Despliegue a producción

1. Aplicar las migraciones: `npx supabase link` y `npx supabase db push`.
2. `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` del proyecto real.
3. **Authentication → Providers → Email → *Confirm email* desactivado.** En local
   lo desactiva `config.toml`; si en producción queda activado no da error, pero
   el registro no devuelve sesión y el usuario se queda fuera.
4. Authentication → URL Configuration con el dominio real, incluido
   `<dominio>/auth/callback`, necesario para el login con Google.
5. **El dominio no puede ser un subdominio de Vercel (`*.vercel.app`).** La pantalla de
   consentimiento OAuth de Google exige que el homepage esté en un dominio registrado a tu
   nombre, comprobado por verificación de **dominio** (DNS) en Search Console; un
   `*.vercel.app` es de Vercel Inc., así que Google lo rechaza con «el sitio web de tu
   página principal no está registrado a tu nombre» aunque la etiqueta
   `google-site-verification` de `src/app/layout.tsx` esté verificada. Por eso producción
   corre en `https://www.mialbumtini.com` (dominio propio comprado aparte, añadido como
   Custom Domain en Vercel y verificado por DNS), no en el subdominio por defecto.

## Referencias

- `AGENTS.md` — reglas de trabajo: verificación, estilo de código y qué hacer al
  añadir cosas. Es el punto de entrada para quien (o lo que) vaya a escribir código.
- `docs/DESIGN.md` — sistema de diseño de la landing y tabla de divergencias.
- `manifest.json` — paleta y rutas de assets.
- `docs/art-direction.png` — art board original (paleta, tipografías, storyboard).
- `docs/references/` — fotografías del diario físico.
- `ASSETS.md` — inventario del pack.
- `docs/MODEL_SPEC.md` — **histórico**: especificación de un `journal.glb` que nunca
  se autoró. El diario acabó siendo geometría procedural.
