# Sistema de diseño de la landing

Origen: proyecto de Google Stitch `7546382129284447523`, variante **«Editorial Invertido»**
(nodo `58436fa3ae404238a66a12d749d96922`, 1280×12552 a 2x). El prompt que se le dio está en
[`landing-redesign-prompt.md`](./landing-redesign-prompt.md); este documento describe **el
resultado implementado**, no la intención.

**En color y tipografía manda `src/app/globals.css`.** Esos tokens los usan también el diario
3D, las Polaroids y el álbum, así que cambiar la paleta se propaga a toda la experiencia. Lo
que sigue es la traducción del diseño a esos tokens, y al final la tabla de divergencias.

## Paleta

El diseño no introdujo ningún color nuevo: sus doce `tini-*` son los del `@theme` con otro
nombre. Ninguna sección de la landing escribe un hex suelto.

| Nombre en Stitch | Token | Clase de uso |
|---|---|---|
| `tini-bg` `#160019` | `--color-deep` | `bg-deep` |
| `tini-dark` `#290023` | `--color-dark-violet` | `bg-dark-violet/50` en las tarjetas |
| `tini-plum` `#51003F` | `--color-purple` | `bg-purple/40` en los badges de icono |
| `tini-glow` `#8A006A` | `--color-magenta` | `bg-magenta/20` en las manchas de luz |
| `tini-hotPink` `#FF24E4` | `--color-hot-pink` | CTA primario, acentos |
| `tini-softPink` `#FF6DB6` | `--color-soft-pink` | bordes, antetítulos, foco |
| `tini-violet` `#BD00FF` | `--color-electric` | acento del paso 2 |
| `tini-cyan` `#00F3FF` | `--color-cyan` | acento del paso 3 |
| `tini-lime` `#BDED00` | `--color-lime` | acento «Listo en minutos» |
| `tini-paper` `#FAF7F4` | `--color-paper` | titulares, papel de la Polaroid |
| `tini-paperWarm` `#F6F0E9` | `--color-paper-warm` | papel alternativo |
| `tini-lilac` `#EDE6F2` | `--color-paper-lilac` | cuerpo de texto, al 60–80 % |
| `tini-ink` `#3A2340` | `--color-ink` | tinta manuscrita sobre papel |

## Tipografía

Dancing Script (`font-script`) y Poppins (`font-sans`), ya cargadas con `next/font` en
`src/app/layout.tsx` como variables CSS.

| Uso | Clases |
|---|---|
| H1 del hero | `font-script text-6xl sm:text-7xl md:text-8xl lg:text-[6.25rem] leading-[1.08]` |
| H2 de sección | `font-script text-5xl sm:text-6xl font-bold` |
| H2 del cierre | `font-script text-6xl sm:text-7xl lg:text-8xl` |
| Antetítulo | `text-xs font-semibold uppercase tracking-[0.3em] text-soft-pink` |
| Cuerpo | `text-base sm:text-lg leading-relaxed text-paper-lilac/70` |
| Nota manuscrita | `font-script text-[clamp(1.15rem,2.1vw,1.7rem)] text-ink` (en `Polaroid`) |

El `leading` del H1 es explícito y no se debe quitar: Dancing Script tiene ascendentes muy
altos y a 100 px sin interlineado pisa el párrafo de debajo.

## Tokens y utilidades añadidos

En `@theme`: `--shadow-polaroid`, `--shadow-polaroid-lg`, `--shadow-neon-pink`,
`--shadow-neon-glow` (generan `shadow-polaroid`, `shadow-neon-pink`…).

Utilidades: `text-glow-title` (resplandor de dos capas de los titulares), `washi-tape` y
`washi-tape-pink` (el material de la cinta; la geometría va en clases en el sitio de uso) y
`glow-blob` (el `blur(80px)` de las manchas atmosféricas).

Animaciones, todas en `globals.css` dentro de `@media (prefers-reduced-motion:
no-preference)`: `landing-rise` y `landing-pop` (entrada del hero), el estado oculto de
`[data-reveal]` y `scroll-behavior: smooth`.

## Ritmo vertical

`py-28 sm:py-36` entre secciones, `max-w-7xl px-6 sm:px-12 lg:px-16` de contenedor (el FAQ
usa `max-w-3xl`, la sección 5 `max-w-6xl`). A 1280 px la página mide **6236 px** frente a los
6276 del diseño: la misma cadencia.

Las secciones con ancla (`#el-diario`, `#como-funciona`, `#preguntas`, `#crear`) llevan
`scroll-mt-24`, porque la barra superior es `fixed` y sin ese margen el titular quedaría
debajo al pulsar un enlace del menú.

## Estructura

| # | Sección | Componente | Boundary |
|---|---|---|---|
| 1 | Barra superior | `LandingNav` | server |
| 2 | Hero + constelación | `LandingHero` → `HeroConstellation` → `HeroPolaroid` | server → client |
| 3 | Se abre, se pasa, se cierra | `LandingJournal` | server |
| 4 | Cómo funciona | `LandingSteps` | server |
| 5 | Así se ve un recuerdo | `LandingSample` | server |
| 6 | Hecho con cariño | `LandingWhy` | server |
| 7 | Preguntas | `LandingFaq` | server |
| 8 | Tu diario te está esperando | `LandingClosing` | server |
| 9 | Pie | `LandingFooter` | server |

Todo el contenido y la copy están en `src/data/landing.ts`. Al navegador sólo bajan `Doodle`,
`Polaroid`, `Reveal` y la constelación; las nueve secciones se renderizan en servidor.

## Divergencias respecto al diseño de Stitch

### Copy: tres frases que el diseño daba por buenas y no lo eran

| Diseño | Implementado | Por qué |
|---|---|---|
| «No necesitas registrarte» (cierre) | «Solo necesitas un correo» | `/crear` está en `PROTECTED` de `src/proxy.ts`: exige cuenta con correo y contraseña |
| «Sin editores complicados ni cuentas de más» | «Sin editores complicados: eliges, escribes y publicas.» | igual que arriba |
| «¿Puedo editarlo después de publicarlo?» sin respuesta | «Todavía no… La edición está en camino» | `src/lib/albums.ts` sólo expone lectura y `crear/actions.ts` sólo `publishAlbum`: no hay edición ni borrado |

Las otras dos respuestas que el mockup dejaba en blanco («¿Quién puede ver mi álbum?»,
«¿Funciona en el celular?») se redactaron desde el comportamiento real del código.

Los números del FAQ no están escritos a mano: salen de `MAX_PHOTOS` y `MAX_CAPTION` de
`src/lib/albumRules.ts`, para que la landing no prometa un límite que el formulario ya no
aplica.

### Imágenes: los placeholders del diseño no existen

Los 14 placeholders de Stitch (`lh3.googleusercontent.com/aida-public/…`) ya no se sirven:
las 14 URLs devuelven el mismo archivo, el board de dirección de arte del proyecto. En su
lugar:

- Las Polaroids que el diseño rotula con recuerdos del álbum («Nuestro concierto»,
  «Atardecer mágico», «Mejores amigas», «Momentos inolvidables») usan las **fotos reales** de
  `journalEntries`.
- Las cuatro decorativas sin equivalente (`escapada`, `tarde`, `risas`, `abrazos`) se
  **generan** con el motor de `scripts/lib/mock-photo.mjs`, el mismo de las fotos de la demo.
  Un generador es reproducible; esa CDN no.
- El pliego abierto y la portada de la sección 3 usan los **assets reales del diario**
  recortados al tamaño de render (`ASSETS.landingJournal`), no el render IA que traía el
  diseño: enseñarlo habría sido enseñar un producto que no existe. El pliego se compone en el
  JSX con la página interior real, doodles y una `<Polaroid>` de verdad encima.

Peso: la portada original son 599 KB a 1600×2400 porque el libro 3D la usa como textura; los
recortes la dejan en 17 y 39 KB. Todo `public/assets/landing/` ocupa 108 KB.

### Composición y comportamiento

| Diseño | Implementado | Por qué |
|---|---|---|
| Cinta washi con `backdrop-filter: blur(2px)` | degradado translúcido con `mix-blend-mode: screen` | diez capas de backdrop compositado sobre Polaroids que se mueven con el scroll cuestan frames, y a 20 px de alto el desenfoque no se distingue |
| `hover:rotate-0` en las Polaroids del hero | `hover:scale-[1.04]` en el envoltorio | un hover de CSS no puede pisar la transformada inline que framer escribe dentro de `Polaroid` |
| Anotaciones de la sección 5 con `hidden lg:flex` | lista centrada por debajo de `lg` | son afirmaciones de producto; ocultarlas del DOM las hacía inalcanzables en móvil |
| Menú central sin alternativa móvil | los tres enlaces repetidos en el pie | el diseño no trae hamburguesa y por debajo de `md` quedaban inalcanzables |
| Notas largas del álbum en el hero | notas cortas del diseño | «Un momento que nunca voy a olvidar» ocupa tres líneas en una Polaroid de 190 px y las dos de cada lado acaban solapándose sobre el titular. La nota real, íntegra, está en la Polaroid grande de la sección 5 |
| Acordeón con `div` y `cursor-pointer` | `<details name="faq">` nativo | cero JavaScript, `<summary>` es enfocable y anunciable de serie. Se pierde animar la altura, que el diseño tampoco tiene |
| `min-h-screen` en el hero | `min-h-[100svh]` | `100vh` en Safari iOS empuja el contenido bajo la barra de herramientas |
| Entrada del hero con framer | `@keyframes` en CSS | anima sin esperar la hidratación, y el bloque global de `prefers-reduced-motion` la apaga desde el primer frame |

### Un detalle que se paga fuera de la landing

`Polaroid` ganó una prop opcional `entrance` (por defecto `true`, así que el diario no cambia).
Con la entrada activa, el HTML del servidor trae la instantánea a `opacity: 0` y no aparece
hasta que hidrata: en el diario da igual porque está detrás de la pantalla de carga, pero en
la landing eso dejaba media composición del hero invisible hasta que bajaba el JavaScript.
Todas las Polaroids de la landing van con `entrance={false}`.

Y todas van con `typeCaption={false}` **salvo** la grande de la sección 5, que es la que
promete el efecto manuscrito. Esa lleva un `id` propio (`landing-memoria`) aunque su foto,
nota y fecha sean las reales: con el id original, el typewriter marcaría la entrada «01» como
ya escrita en el store global —que sobrevive a la navegación de cliente— y al entrar luego al
diario su nota saldría completa en vez de escribiéndose.

## Comprobado

A 390 / 768 / 1024 / 1280 / 1440: sin scroll horizontal en ninguno, y la constelación pasa
por sus tres estados (0 / 2 / 6 Polaroids). Parallax medido en los tres planos (−40, −80 y
−130 px). Con `prefers-reduced-motion: reduce` emulado **antes** de cargar: sin parallax
(`transform: none`), sin `ping` ni `bounce`, `scroll-behavior: auto` y todo el contenido a
`opacity: 1` sin depender del reveal. FAQ abierto en la primera pregunta, con el límite real
de 24 fotos y 60 caracteres.

Queda una comprobación manual: entrar a `/`, bajar hasta «Así se ve un recuerdo», abrir el
diario de ejemplo y confirmar que las notas se escriben letra a letra. No se pudo cerrar en
navegador headless porque la primera página del diario no se activa hasta abrir el libro.
