'use client'

/**
 * Orquestador de toda la experiencia.
 *
 * Aquí viven las tres transiciones que no pertenecen ni al 3D ni al DOM por
 * separado:
 *
 * 1. Carga → intro, disparada por el <Suspense> de la escena (señal
 *    determinista, no un porcentaje).
 * 2. La subida de partículas y doodles durante la intro, escrita en un ref
 *    para no re-renderizar la escena en cada frame.
 * 3. El crossfade 3D → álbum, con un destello rosa muy corto que enmascara
 *    cualquier diferencia de sub-píxel entre las dos capas.
 * 4. El relevo inverso al cerrar el diario.
 *
 * Sobre el ciclo de vida del Canvas: para poder cerrar el diario animando la
 * apertura en reversa, el estado 3D —cámara cenital, tapa abierta, diario
 * recostado— tiene que seguir existiendo mientras se leen las páginas. Por eso
 * el Canvas se queda montado con el bucle de render detenido en lugar de
 * desmontarse. En el tier de calidad bajo sí se desmonta para liberar la GPU, y
 * allí el cierre pasa a ser un fundido: no hay nada que invertir.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useExperience } from '@/state/experience'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useQualitySettings, useQualityTierSync } from '@/hooks/useQualityTier'
import { CLOSING, CLOSING_FADE, HANDOFF, INTRO, REDUCED } from '@/lib/timings'
import { AlbumExperience } from '../journal/AlbumExperience'
import { BackToAlbumsButton } from '../ui/BackToAlbumsButton'
import { CopyLinkButton } from '../ui/CopyLinkButton'
import { LoadingScreen } from '../ui/LoadingScreen'
import { MusicToggle } from '../ui/MusicToggle'
import { NoWebGLNotice, useWebGLSupport } from '../ui/NoWebGLFallback'
import { IntroOverlay } from './IntroOverlay'
import { ThreeCanvas } from './ThreeCanvas'
import type { Journal3DHandle } from './Journal3D'
import type { AlbumData } from '@/data/spreads'

type Props = {
  /** Contenido del álbum a mostrar: la demo o el de un usuario. */
  album: AlbumData
  /** Si el visitante es el dueño del álbum: muestra los controles de dueño. */
  isOwner?: boolean
  /** Slug del álbum, para el botón de copiar enlace. */
  slug?: string
}

export function IntroExperience({ album, isOwner, slug }: Props) {
  const journalRef = useRef<Journal3DHandle | null>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const albumRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const ambientRevealRef = useRef(0)

  const [pagesRevealed, setPagesRevealed] = useState(false)
  const [canvasMounted, setCanvasMounted] = useState(true)
  const [canvasActive, setCanvasActive] = useState(true)
  const [sceneReady, setSceneReady] = useState(false)
  /**
   * Se llega a `ready` desde un cierre y no desde la intro.
   *
   * Sólo sirve para devolver el foco al CTA: al desmontarse la página de cierre
   * el foco del usuario de teclado se queda en <body> y quedaría sin punto de
   * partida. En la carga inicial no debe enfocarse nada.
   */
  const [returnedFromAlbum, setReturnedFromAlbum] = useState(false)

  const state = useExperience((s) => s.state)
  const setState = useExperience((s) => s.setState)
  const requestOpen = useExperience((s) => s.requestOpen)
  const completeClose = useExperience((s) => s.completeClose)
  const progress = useExperience((s) => s.progress)
  const setProgress = useExperience((s) => s.setProgress)

  // Sólo lee: la sincronización con matchMedia la hace <MotionPreference /> en
  // el layout raíz, para que valga en todas las rutas y no sólo aquí.
  const reducedMotion = useReducedMotion()
  useQualityTierSync()
  const { keepCanvasAlive } = useQualitySettings()
  const webglSupported = useWebGLSupport()

  /* ---------- Sin WebGL: se entra directo al álbum ---------- */
  useEffect(() => {
    if (webglSupported !== false) return
    setCanvasMounted(false)
    setCanvasActive(false)
    setState('album')
  }, [setState, webglSupported])

  /* ---------- Carga → intro ---------- */
  const handleSceneReady = useCallback(() => {
    setSceneReady(true)
    setProgress(1)
  }, [setProgress])

  useEffect(() => {
    if (!sceneReady || state !== 'loading') return
    // Un respiro para que la pantalla de carga no parpadee en conexiones rápidas.
    const timer = setTimeout(() => setState('intro'), 420)
    return () => clearTimeout(timer)
  }, [sceneReady, setState, state])

  // Progreso aproximado mientras carga, sólo para la pantalla de espera.
  useEffect(() => {
    if (sceneReady) return
    const tween = gsap.to(
      { value: 0 },
      {
        value: 0.9,
        duration: 2.6,
        ease: 'power1.out',
        onUpdate() {
          setProgress((this.targets()[0] as { value: number }).value)
        },
      },
    )
    return () => {
      tween.kill()
    }
  }, [sceneReady, setProgress])

  /* ---------- Intro: subida del ambiente ---------- */
  useEffect(() => {
    if (state !== 'intro') {
      // Al saltar la intro el ambiente debe quedar visible igualmente.
      if (state !== 'loading') ambientRevealRef.current = 1
      return
    }

    const tween = gsap.to(ambientRevealRef, {
      current: 1,
      duration: reducedMotion ? 0.3 : INTRO.particlesIn.duration,
      delay: reducedMotion ? 0 : INTRO.particlesIn.at,
      ease: 'power2.out',
    })

    return () => {
      tween.kill()
    }
  }, [reducedMotion, state])

  /* ---------- Crossfade 3D → álbum ---------- */
  useEffect(() => {
    if (state !== 'album') return

    const crossfade = (reducedMotion ? REDUCED.crossfadeMs : HANDOFF.crossfadeMs) / 1000
    const timeline = gsap.timeline()

    // El álbum entra desde una escala mínima: se materializa donde estaba el
    // diario en lugar de aparecer de golpe.
    if (albumRef.current) {
      timeline.fromTo(
        albumRef.current,
        { opacity: 0, scale: reducedMotion ? 1 : 0.985 },
        { opacity: 1, scale: 1, duration: crossfade, ease: 'power2.out' },
        0,
      )
    }

    if (canvasWrapRef.current) {
      timeline.to(
        canvasWrapRef.current,
        { opacity: 0, duration: crossfade * 0.9, ease: 'power2.in' },
        crossfade * 0.15,
      )
    }

    // Destello rosa brevísimo: cubre el instante del relevo entre capas.
    if (flashRef.current && !reducedMotion) {
      timeline.fromTo(
        flashRef.current,
        { opacity: 0 },
        { opacity: 0.4, duration: crossfade * 0.35, ease: 'power2.out' },
        0,
      )
      timeline.to(
        flashRef.current,
        { opacity: 0, duration: crossfade * 0.65, ease: 'power2.in' },
        crossfade * 0.35,
      )
    }

    // Se detiene el bucle de render en cualquier caso: es lo que libera la GPU
    // del coste por frame. El desmontaje, en cambio, sólo ocurre si el tier no
    // puede permitirse retener las texturas, porque desmontar destruye el
    // estado 3D que el cierre necesita invertir.
    const stopTimer = setTimeout(() => setCanvasActive(false), crossfade * 1000)
    const unmountTimer = keepCanvasAlive
      ? null
      : setTimeout(
          () => setCanvasMounted(false),
          reducedMotion ? REDUCED.crossfadeMs + 200 : HANDOFF.unmountDelayMs,
        )

    return () => {
      timeline.kill()
      clearTimeout(stopTimer)
      if (unmountTimer) clearTimeout(unmountTimer)
    }
  }, [keepCanvasAlive, reducedMotion, state])

  /* ---------- Cierre: relevo inverso álbum → 3D ---------- */
  useEffect(() => {
    if (state !== 'closing') return

    setReturnedFromAlbum(true)

    /**
     * Camino sin animación: el Canvas se desmontó al entrar al álbum, así que
     * no queda estado 3D que invertir. Se funde el álbum y se cierra el ciclo
     * pasando a `ready`, que es quien vuelve a montar la escena —ya cerrada—.
     *
     * `completeClose()` se llama ANTES de montar a propósito: montar durante
     * `closing` dispararía la timeline de cierre de `CameraController` sobre un
     * diario que ya está cerrado, y el usuario esperaría dos segundos de nada.
     */
    if (!keepCanvasAlive) {
      const timeline = gsap.timeline({ onComplete: completeClose })
      if (albumRef.current) {
        timeline.to(albumRef.current, {
          opacity: 0,
          duration: CLOSING_FADE.outMs / 1000,
          ease: 'power2.in',
        })
      }
      return () => {
        timeline.kill()
      }
    }

    // Camino animado: hay que reanudar el bucle antes de nada. Con frameloop
    // en "never" los useFrame no corren y la cámara no se actualizaría.
    setCanvasActive(true)

    const timeline = gsap.timeline()
    const handoff = reducedMotion ? REDUCED.crossfadeMs / 1000 : CLOSING.handoff.duration

    if (albumRef.current) {
      timeline.to(
        albumRef.current,
        { opacity: 0, scale: reducedMotion ? 1 : 0.985, duration: handoff, ease: 'power2.in' },
        CLOSING.handoff.at,
      )
    }

    if (canvasWrapRef.current) {
      timeline.to(
        canvasWrapRef.current,
        { opacity: 1, duration: handoff, ease: 'power2.out' },
        CLOSING.handoff.at,
      )
    }

    // El mismo destello que cubre el relevo de ida, ahora en sentido contrario.
    if (flashRef.current && !reducedMotion) {
      timeline.fromTo(
        flashRef.current,
        { opacity: 0 },
        { opacity: 0.34, duration: handoff * 0.4, ease: 'power2.out' },
        CLOSING.handoff.at,
      )
      timeline.to(
        flashRef.current,
        { opacity: 0, duration: handoff * 0.6, ease: 'power2.in' },
        CLOSING.handoff.at + handoff * 0.4,
      )
    }

    // Quien llama a completeClose() es la timeline 3D de CameraController: es
    // la que sabe cuándo la tapa acabó de cerrarse.
    return () => {
      timeline.kill()
    }
  }, [completeClose, keepCanvasAlive, reducedMotion, state])

  /* ---------- Vuelta a `ready`: remontar la escena si hacía falta ---------- */
  useEffect(() => {
    if (state !== 'ready' || canvasMounted) return

    setCanvasMounted(true)
    setCanvasActive(true)

    // El envoltorio quedó a opacidad 0 tras el relevo de ida; se funde de
    // entrada con la escena ya en su pose de reposo.
    if (canvasWrapRef.current) {
      gsap.to(canvasWrapRef.current, {
        opacity: 1,
        duration: CLOSING_FADE.inMs / 1000,
        ease: 'power2.out',
      })
    }
  }, [canvasMounted, state])

  const showIntroOverlay = state === 'intro' || state === 'ready'

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-deep">
      {/*
        El envoltorio se renderiza siempre y lo condicional es el Canvas de
        dentro. Así el ref es estable entre montajes y conserva la opacidad que
        le dejó GSAP: con el envoltorio condicional, cada montaje crearía un div
        nuevo sin opacidad inline y la escena aparecería de golpe antes de que
        el efecto pudiera ponerla a cero.

        `pointer-events` se desactiva mientras manda el álbum: la opacidad 0 no
        desactiva el hit-testing, y un Canvas pausado por encima no debe poder
        interceptar clicks.
      */}
      <div
        ref={canvasWrapRef}
        className={[
          'absolute inset-0',
          state === 'album' || state === 'closing' ? 'pointer-events-none' : '',
        ].join(' ')}
      >
        {canvasMounted && (
          <ThreeCanvas
            journalRef={journalRef}
            pagesRevealed={pagesRevealed}
            onPagesReveal={setPagesRevealed}
            onReady={handleSceneReady}
            ambientRevealRef={ambientRevealRef}
            active={canvasActive}
          />
        )}
      </div>

      {showIntroOverlay && (
        <IntroOverlay
          phase={state === 'intro' ? 'intro' : 'ready'}
          onOpen={requestOpen}
          focusCta={returnedFromAlbum}
        />
      )}

      {/* Sigue montado durante el cierre: si no, no habría nada que fundir. */}
      {(state === 'album' || state === 'closing') && (
        <AlbumExperience ref={albumRef} album={album} />
      )}

      {/* Destello del relevo entre capas. */}
      <div
        ref={flashRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 opacity-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 50% 50%, rgba(255,36,228,0.75) 0%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      <LoadingScreen visible={state === 'loading'} progress={progress} />

      {state === 'album' && <MusicToggle />}
      {state === 'album' && isOwner && <BackToAlbumsButton />}
      {state === 'album' && isOwner && slug && (
        <div className="fixed left-4 top-16 z-40">
          <CopyLinkButton slug={slug} />
        </div>
      )}
      {webglSupported === false && <NoWebGLNotice />}
    </main>
  )
}
