# Prompt de rediseño del landing — Google Stitch

Contexto: el landing actual (`src/app/page.tsx` + `src/components/landing/*`) tiene solo
cuatro secciones y nunca muestra el producto real (el diario) hasta `/demo`. Este prompt
busca una versión más fuerte y más densa **conservando la identidad existente** (tokens de
`globals.css`, Dancing Script + Poppins, doodles, la polaroid como objeto de marca), para
que lo generado sea implementable casi tal cual.

## Cómo usarlo

1. Modo **Experimental** (respeta mejor paleta y composición que Standard).
2. Tipo de pantalla: **Web / Desktop**. Genera desktop primero; mobile va como seguimiento.
3. **Adjunta estas 3 imágenes como referencia** antes de enviar el prompt:
   - `docs/art-direction.png` — el art board completo (paleta, tipografías, doodles, texturas)
   - `public/assets/journal/front-cover.webp` — la portada real del diario
   - `docs/references/reference-journal.jpeg` — referencia de libro abierto
4. El prompt va en **inglés** (Stitch obedece mejor la estructura) con **toda la copy de UI
   en español entre comillas** y la instrucción explícita de copiarla literal. Es lo que
   evita que la traduzca.
5. Stitch entrega pantallas estáticas: no le pidas animaciones ni el canvas 3D. Del mockup
   solo se toma composición y jerarquía.

---

## Prompt principal

```
Design a premium, dark-mode marketing landing page (desktop, 1440px) for "Álbum de Tini",
a Spanish-language web app that turns your photos into an interactive 3D journal you can
share with a link. Photos appear as real instant/Polaroid prints taped onto paper pages,
each with a handwritten caption. The tone is intimate, nostalgic and a little magical —
like a teenage diary made of concert nights and friendships — never corporate or startup-y.

=== VISUAL SYSTEM (follow strictly, do not invent a new palette) ===
Background: near-black plum #160019, with a large soft radial glow of magenta #8A006A
fading through #290023 at the top of the page. Deep violet surfaces #290023 / #51003F.
Accents: hot pink #FF24E4 (primary action + glow), soft pink #FF6DB6 (links, labels,
hairline borders at low opacity), electric violet #BD00FF, cyan #00F3FF and lime #BDED00
used very sparingly as tiny sparks only.
Text: off-white #FAF7F4 for headings, lilac-tinted #EDE6F2 at 55-75% opacity for body.
Paper objects use #FAF7F4 / #F6F0E9 with ink #3A2340.

Typography: headings and the wordmark in "Dancing Script" (a flowing handwriting script),
large and confident. All UI, body copy, buttons and labels in "Poppins" (400/500), with
generous letter-spacing on small uppercase eyebrow labels (0.3em).

Texture and ornament: a subtle paper grain over the dark background; thin hand-drawn
single-stroke SVG doodles in hot pink and soft pink (heart, star, sparkle, music note,
treble clef, flower, camera, lightning bolt, swirl) scattered as small decorative accents
— never as section icons in boxes. Buttons are fully rounded pills. The primary button is
solid hot pink with dark #160019 text and a soft outer pink glow. The secondary button is
a transparent pill with a 1px soft-pink border at ~35% opacity.

The signature object is the POLAROID: an off-white instant photo, square image window,
tall blank band at the bottom, 3px corner radius, a handwritten caption in Dancing Script
in dark ink #3A2340 on that band, a tiny uppercase tracked date under it, a slight random
rotation between -3 and +3 degrees, and a deep soft drop shadow. Use it everywhere a photo
appears. Never show a plain rectangular photo.

=== PAGE STRUCTURE (top to bottom) ===

1. NAV — transparent, overlapping the hero, generous side padding.
   Left: a small hot-pink flower doodle + "Álbum de Tini" in Dancing Script.
   Center: text links "Cómo funciona", "Ejemplo", "Preguntas".
   Right: a ghost pill "Entrar" and a solid hot-pink pill "Crear mi álbum".

2. HERO — full viewport height, centered column, and the star of the page.
   Behind the text, a loose scattered constellation of 5 to 7 Polaroids floating at
   different depths, sizes and rotations across the full width — some partially cropped by
   the edges of the screen, the ones farther back smaller, blurred and dimmed, the ones in
   front sharp with visible handwritten captions. A few thin doodles and small glowing
   sparkle particles float between them. The photos should read as memories suspended in
   a dark room, not as a grid or a carousel.
   Centered on top:
     eyebrow, small uppercase tracked, soft pink: "tu propio diario"
     H1, Dancing Script, very large (~110px), off-white with a faint pink glow:
       "Un diario que se abre de verdad"
     paragraph, max 46 characters wide, lilac at 70%:
       "Sube tus fotos, escribe qué recuerda cada una y comparte un enlace. Quien lo abra
        verá tu diario abrirse página a página."
     two pill buttons side by side: primary "Crear mi álbum", secondary "Ver un ejemplo"
     tiny line below in lilac at 45%: "Gratis · Sin instalar nada · Listo en 3 minutos"
   At the very bottom edge, the top sliver of a closed purple journal cover peeking up,
   inviting scroll.

3. THE JOURNAL — a wide, dark, cinematic band. On the left, a large three-quarter view of
   an open journal: deep purple cover with hot-pink hand-drawn paisley and flower line-art
   on the front, cream textured paper pages inside, two Polaroids taped to the spread with
   handwritten captions and a few doodles in the margins, lit by a pink key light from the
   left and a violet rim light from the right, floating over its own soft shadow.
   On the right, a text block:
     eyebrow: "no es una galería"
     H2 in Dancing Script: "Se abre, se pasa, se cierra"
     paragraph: "Un libro real en tu pantalla: las páginas se voltean, las notas se
     escriben solas sobre cada foto y el diario se cierra al final."
     a text link with a long underline offset: "Abrir el diario de ejemplo →"

4. CÓMO FUNCIONA — centered H2 in Dancing Script: "Cómo funciona". Below, three columns.
   Each column: a huge ghost step number in Dancing Script at ~15% hot-pink opacity behind
   the content, a 64px circle with a 1px soft-pink border at 25% opacity over a translucent
   violet fill containing a hot-pink doodle, a title in Poppins medium, and a short
   paragraph max 32 characters wide.
     1 · camera doodle · "Sube tus fotos" ·
       "Elige varias de una vez. Aparecen al momento y las ordenas antes de subir nada."
     2 · speech-bubble-with-heart doodle · "Escribe cada recuerdo" ·
       "Cada foto lleva su nota, la que se escribirá a mano sobre la instantánea."
     3 · treble clef doodle · "Comparte el enlace" ·
       "Al publicar recibes una dirección única. Quien la abra verá tu diario abrirse."
   Connect the three steps with a thin dashed hand-drawn hot-pink line at low opacity.

5. ASÍ SE VE UN RECUERDO — a faint scrap of cream journal paper as a background wash at
   7% opacity behind this section. Centered H2 in Dancing Script: "Así se ve un recuerdo".
   Below it, one oversized Polaroid shown large and slightly tilted, with three thin
   annotation lines pointing at it from the sides, each with a tiny label in small uppercase
   tracked soft pink: "tu foto, sin recortes raros", "tu letra, escribiéndose sola",
   "la fecha que tú elijas". Beside it, two smaller Polaroids overlapping at the edges.

6. POR QUÉ — a 4-card grid on translucent violet surfaces with 1px soft-pink borders at
   15% opacity and generous internal padding. Each card: a small doodle, a short bold title,
   two lines of lilac body text.
     heart doodle · "Hecho a mano, no plantilla" · "Cada nota es tuya y se escribe con tu letra."
     lightning doodle · "Listo en minutos" · "Sin editores complicados ni cuentas de más."
     star doodle · "Se ve bien en el móvil" · "Una página por vez, con el mismo detalle."
     sparkle doodle · "Solo lo ve quien invites" · "Tu enlace no se indexa ni se busca."

7. PREGUNTAS — centered H2 in Dancing Script: "Preguntas". Below, a narrow single column
   (max 720px) of four collapsed accordion rows separated by 1px soft-pink hairlines at 10%
   opacity, each with the question in Poppins and a thin + sign on the right:
     "¿Cuántas fotos puedo subir?"
     "¿Quién puede ver mi álbum?"
     "¿Funciona en el celular?"
     "¿Puedo editarlo después de publicarlo?"
   Show the first row expanded with its answer in lilac:
     "Hasta 24 por álbum, con una nota de hasta 60 caracteres cada una."

8. CIERRE — a full-width band with a strong magenta radial glow rising from the bottom and
   a few Polaroids drifting out of frame at the edges. Centered:
     H2 in Dancing Script, very large: "Tu diario te está esperando"
     one line of lilac body: "Empieza con las fotos que ya tienes en el teléfono."
     a single large primary pill: "Crear mi álbum"

9. FOOTER — separated by a 1px soft-pink hairline at 10% opacity. Centered: a hot-pink
   heart doodle, then in lilac at 55%: "Hecho para guardar lo que no se quiere olvidar."
   Below, a row of small links at 45% opacity: "Ver el ejemplo", "Crear un álbum",
   "Privacidad", "Contacto".

=== RULES ===
- Keep ALL the Spanish copy exactly as written above. Do not translate it, do not rewrite it,
  do not replace it with lorem ipsum.
- One single primary button style only (solid hot pink). Everything else is a ghost pill or
  a text link.
- Very generous vertical rhythm: 120-160px between sections. Let the dark background breathe.
- No stock-photo people, no laptop or phone device mockups, no emoji, no gradient-mesh
  blobs, no glassmorphism cards, no purple-to-blue SaaS gradient buttons, no icon sets like
  Font Awesome or Material — only the hand-drawn single-stroke doodles described above.
- No pricing section, no testimonials, no logo wall.
- Every photo in the design is a Polaroid with a handwritten caption.
```

---

## Prompts de seguimiento

Enviar de uno en uno, sin repetir el prompt completo.

**Mobile:**

```
Now adapt this same landing page to mobile (390px). Stack everything to a single column.
In the hero, reduce the floating Polaroids to 3, keep one in front sharp and two behind
blurred, and shrink the H1 to about 44px. Turn the "Cómo funciona" three columns into a
vertical list with the dashed hand-drawn line running down the left side. Keep both hero
buttons full width, stacked. Keep all Spanish copy identical.
```

**Si el hero queda demasiado limpio / poco "diario":**

```
Make the hero messier and more physical: overlap the Polaroids more, add a strip of
translucent tape on the corner of two of them, tilt them more aggressively (up to 8
degrees), and add two more hand-drawn doodles crossing behind the headline.
```

**Si se va a un look SaaS genérico:**

```
Too clean and too corporate. Remove any card that looks like a generic SaaS feature box.
Lean harder into the scrapbook feel: paper grain over the dark background, hand-drawn
borders instead of straight 1px lines, and let the Dancing Script headings be much larger
relative to the body text.
```

**Variantes de una sección concreta:**

```
Give me 3 alternative layouts for section 3 (THE JOURNAL) only, keeping the same palette
and copy.
```

---

## Qué hacer con el resultado

- Stitch exporta a Figma o a código; en ambos casos **tomar composición y jerarquía, no el
  CSS**. Los colores ya son tokens en `src/app/globals.css` (`bg-deep`, `text-hot-pink`,
  `text-paper-lilac`, `font-script`…) — reimplementar con esas clases, no con hex sueltos.
- Los doodles ya son componente: `<Doodle name="heart" />` en `src/components/ui/Doodle.tsx`;
  los 11 nombres disponibles están en `src/data/doodles.generated.ts`.
- La polaroid ya está implementada en `src/components/journal/Polaroid.tsx`. El landing debe
  reutilizarla, no recrear el estilo.
- Las secciones 6 y 7 (Por qué / Preguntas) serían componentes nuevos en
  `src/components/landing/`, siguiendo el patrón de `LandingSteps.tsx` (server component,
  clases en array unido con `.join(' ')`, sin librería de UI).
- El hero de polaroids flotantes es la única pieza con coste real: framer-motion ya está
  instalado y `LandingHero.tsx` ya usa el easing `[0.22, 1, 0.36, 1]`; el resto son capas
  absolutas sobre `<Polaroid>`.

## Verificación de la salida

Antes de dar el resultado por bueno, comprobar que: (1) la copy sigue en español y literal,
(2) los hex son los del `@theme` y no una paleta inventada, (3) cada foto es una polaroid
con caption manuscrita, (4) no aparecieron cards SaaS ni iconos de librería. Si falla
alguno, usar el prompt de seguimiento de look SaaS.
