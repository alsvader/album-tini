/**
 * Hero de la landing.
 *
 * Server component. La entrada escalonada del texto son retardos fijos al
 * montar, no reacciones al scroll, así que la hace CSS (`.landing-rise` y
 * `.landing-pop` en `globals.css`) y no framer. Dos ventajas concretas: corre
 * sin esperar la hidratación —antes el H1 se servía a opacidad 0 y no se movía
 * hasta que bajaba el JS— y el bloque de `prefers-reduced-motion` la apaga
 * sola, desde el primer frame.
 *
 * Lo único que necesita JavaScript es la constelación de Polaroids, que va en
 * `<HeroConstellation>` porque su parallax sí depende del scroll. Sigue sin
 * haber canvas WebGL a propósito: el diario 3D es el momento de impacto de la
 * experiencia y montarlo aquí duplicaría el coste de la primera visita.
 */

import Link from 'next/link'
import { ASSETS } from '@/lib/assets'
import { Doodle } from '../ui/Doodle'
import { HeroConstellation } from './HeroConstellation'

/**
 * Doodles flotantes. Las clases son literales completas porque sin
 * `tailwind.config` el scanner de Tailwind v4 no ve valores interpolados.
 */
/**
 * Doodles flotantes. Las clases son literales completas porque sin
 * `tailwind.config` el scanner de Tailwind v4 no ve valores interpolados.
 *
 * Van colocados en los huecos que dejan la constelación y el titular, no en las
 * posiciones del mockup: allí caían justo encima de las instantáneas de los
 * planos medio y cercano, que son papel opaco, y se leían como un garabato
 * pintado sobre la foto.
 */
const FLOATING = [
  {
    name: 'heart',
    className: 'left-[22%] top-24 h-7 w-7 -rotate-12 text-soft-pink/70',
    delay: '0.5s',
  },
  {
    name: 'sparkle',
    className: 'right-[24%] top-28 h-8 w-8 rotate-12 text-hot-pink/80',
    delay: '0.65s',
  },
  {
    name: 'musicNote',
    className: 'left-[24%] top-[62%] h-8 w-8 rotate-6 text-soft-pink/60',
    delay: '0.8s',
  },
  {
    name: 'trebleClef',
    className: 'right-[26%] top-[58%] h-9 w-9 -rotate-12 text-cyan/50',
    delay: '0.95s',
  },
  {
    name: 'star',
    className: 'bottom-32 left-[34%] h-6 w-6 rotate-45 text-lime/70',
    delay: '1.1s',
  },
] as const

export function LandingHero() {
  return (
    <section
      className="relative isolate flex min-h-[100svh] flex-col items-center justify-between overflow-hidden pb-24 pt-32"
      style={{
        background:
          'radial-gradient(circle at 50% 35%, rgba(138,0,106,0.55) 0%, rgba(41,0,35,0.8) 45%, #160019 85%)',
      }}
    >
      {/* Manchas de luz detrás de las Polaroids. */}
      <div
        aria-hidden="true"
        className="glow-blob absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple/40"
      />
      <div
        aria-hidden="true"
        className="glow-blob absolute right-1/4 top-1/3 h-[28rem] w-[28rem] rounded-full bg-magenta/30"
      />
      <div
        aria-hidden="true"
        className="glow-blob absolute -bottom-10 left-1/2 h-60 w-[42rem] -translate-x-1/2 rounded-full bg-hot-pink/20"
      />

      {/* Doodles sueltos. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
        {FLOATING.map((item) => (
          <div
            key={item.name}
            className={`landing-pop absolute hidden sm:block ${item.className}`}
            style={{ animationDelay: item.delay }}
          >
            <Doodle name={item.name} className="h-full w-full" />
          </div>
        ))}
      </div>

      <HeroConstellation />

      <div className="relative z-30 mx-auto mt-12 max-w-3xl px-6 text-center sm:mt-16">
        <p
          className="landing-rise mb-6 inline-flex items-center gap-2 rounded-full border border-soft-pink/25 bg-soft-pink/10 px-4 py-1.5"
          style={{ animationDelay: '0s' }}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 animate-ping rounded-full bg-hot-pink"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-soft-pink">
            Tu propio diario
          </span>
        </p>

        <h1
          className="landing-rise text-balance-tight mb-6 font-script text-6xl font-bold leading-[1.08] text-paper text-glow-title sm:text-7xl md:text-8xl lg:text-[6.25rem]"
          style={{ animationDelay: '0.1s' }}
        >
          Un diario que se abre de verdad
        </h1>

        <p
          className="landing-rise mx-auto mb-9 max-w-xl text-base leading-relaxed text-paper-lilac/75 sm:text-lg"
          style={{ animationDelay: '0.25s' }}
        >
          Sube tus fotos, escribe qué recuerda cada una y comparte un enlace. Quien lo
          abra verá tu diario abrirse página a página.
        </p>

        <div
          className="landing-rise mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: '0.4s' }}
        >
          <Link
            href="/crear"
            className="w-full rounded-full bg-hot-pink px-9 py-4 text-base font-semibold text-deep shadow-neon-pink transition duration-300 hover:-translate-y-1 hover:brightness-110 sm:w-auto"
          >
            Crear mi álbum
          </Link>
          <Link
            href="/demo"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-soft-pink/40 px-8 py-4 text-base text-paper-lilac transition duration-300 hover:border-soft-pink/70 hover:bg-soft-pink/10 sm:w-auto"
          >
            <span>Ver un ejemplo</span>
            <Doodle name="arrowNext" className="h-4 w-4 text-soft-pink" />
          </Link>
        </div>

        <p
          className="landing-rise text-xs tracking-wide text-paper-lilac/45"
          style={{ animationDelay: '0.55s' }}
        >
          Gratis · Sin instalar nada · Listo en 3 minutos
        </p>
      </div>

      {/*
        El canto superior del diario asomando, que invita a seguir bajando.
        Usa el recorte de la portada real y no un render: es la tapa que el
        usuario va a ver de verdad al abrir su álbum.
      */}
      <div
        aria-hidden="true"
        className="relative z-20 -mb-8 mt-12 flex w-full max-w-2xl justify-center px-6"
      >
        <div className="relative h-32 w-72 overflow-hidden rounded-t-3xl border-x border-t border-soft-pink/40 shadow-[0_-20px_50px_rgba(255,36,228,0.25)] sm:w-80">
          <img
            src={ASSETS.landingJournal.peek}
            alt=""
            /* Está sobre el pliegue en desktop, pero no debe competir con el
               H1 por el LCP: se descarga ya, con prioridad baja. */
            loading="eager"
            fetchPriority="low"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-transparent" />

          <div className="absolute -top-3 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border-2 border-soft-pink/60 bg-purple shadow-lg">
            <Doodle name="flower" className="h-5 w-5 text-paper/90" />
          </div>
        </div>
      </div>
    </section>
  )
}
