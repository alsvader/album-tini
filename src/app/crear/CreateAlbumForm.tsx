'use client'

/**
 * Composición y publicación de un álbum.
 *
 * Regla que gobierna la pantalla: **nada toca la red hasta que se pulsa «Crear
 * álbum»**. Mientras se compone, las miniaturas son `URL.createObjectURL` de los
 * archivos locales y las descripciones viven en estado. Así abandonar la página
 * no deja imágenes sueltas en Storage de álbumes que nunca existieron.
 *
 * Al publicar: reescalar → subir a Storage (directo desde el navegador, con
 * progreso) → un Server Action inserta álbum y fotos en una transacción. El
 * álbum se crea al final, de modo que un fallo a mitad no deja nada a medias.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PHOTOS_BUCKET } from '@/lib/supabase/env'
import { MAX_CAPTION, MAX_CLOSING, MAX_PHOTOS, MAX_SUBTITLE } from '@/lib/albumRules'
import { resizeImage, UnsupportedImageError } from '@/lib/resizeImage'
import { publishAlbum } from './actions'
import { Doodle } from '@/components/ui/Doodle'

type Draft = {
  /** Id local, también el nombre del archivo en Storage. */
  id: string
  file: File
  previewUrl: string
  caption: string
  takenLabel: string
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'uploading'; done: number; total: number }
  | { kind: 'saving' }

export function CreateAlbumForm() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [closing, setClosing] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [error, setError] = useState<string | null>(null)

  // Las object URL son un recurso: sin revocarlas, el navegador mantiene vivos
  // los archivos mientras dure la pestaña.
  useEffect(
    () => () => {
      for (const draft of drafts) URL.revokeObjectURL(draft.previewUrl)
    },
    [drafts],
  )

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return

      /*
       * La lista se copia AHORA, antes que nada.
       *
       * Más abajo se hace `input.value = ''` para poder volver a elegir el mismo
       * archivo si se quitó por error, y eso vacía el propio FileList —es el
       * mismo objeto que `event.target.files`—. Leerlo dentro del updater de
       * `setDrafts`, que React ejecuta más tarde, lo encontraría ya vacío y no
       * se añadiría ninguna foto.
       */
      const picked = Array.from(files).filter((file) => file.type.startsWith('image/'))

      // Permite volver a elegir el mismo archivo si se quitó por error.
      if (inputRef.current) inputRef.current.value = ''

      if (picked.length === 0) {
        setError('Esos archivos no son imágenes.')
        return
      }

      const room = MAX_PHOTOS - drafts.length

      if (room <= 0) {
        setError(`Ya has añadido el máximo de ${MAX_PHOTOS} fotos.`)
        return
      }

      const incoming = picked.slice(0, room)

      // Los setters se llaman al mismo nivel, nunca dentro del updater de otro:
      // React puede invocar un updater más de una vez y debe ser puro.
      setError(
        incoming.length < picked.length
          ? `Sólo caben ${MAX_PHOTOS} fotos por álbum; se han añadido las primeras.`
          : null,
      )

      setDrafts((current) => [
        ...current,
        ...incoming.map((file) => ({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          caption: '',
          takenLabel: '',
        })),
      ])
    },
    [drafts.length],
  )

  const update = (id: string, patch: Partial<Draft>) =>
    setDrafts((current) => current.map((d) => (d.id === id ? { ...d, ...patch } : d)))

  const remove = (id: string) =>
    setDrafts((current) => {
      const target = current.find((d) => d.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return current.filter((d) => d.id !== id)
    })

  const busy = phase.kind !== 'idle'

  const missingCaption = drafts.some((d) => !d.caption.trim())
  const canPublish = title.trim().length > 0 && drafts.length > 0 && !missingCaption && !busy

  async function handlePublish() {
    if (!canPublish) return
    setError(null)

    const albumId = crypto.randomUUID()
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Tu sesión ha caducado. Vuelve a entrar.')
      return
    }

    try {
      setPhase({ kind: 'uploading', done: 0, total: drafts.length })

      const uploaded: { storagePath: string; caption: string; takenLabel?: string }[] = []

      for (const [index, draft] of drafts.entries()) {
        const { blob } = await resizeImage(draft.file)
        const storagePath = `${user.id}/${albumId}/${draft.id}.webp`

        const { error: uploadError } = await supabase.storage
          .from(PHOTOS_BUCKET)
          .upload(storagePath, blob, { contentType: 'image/webp', upsert: false })

        if (uploadError) throw new Error(`No se pudo subir la foto ${index + 1}.`)

        uploaded.push({
          storagePath,
          caption: draft.caption.trim(),
          takenLabel: draft.takenLabel.trim() || undefined,
        })

        setPhase({ kind: 'uploading', done: index + 1, total: drafts.length })
      }

      setPhase({ kind: 'saving' })

      const result = await publishAlbum({
        albumId,
        title,
        subtitle,
        closing,
        photos: uploaded,
      })

      if (!result.ok) {
        setError(result.error)
        setPhase({ kind: 'idle' })
        return
      }

      router.push(`/album/${result.slug}`)
    } catch (cause) {
      setError(
        cause instanceof UnsupportedImageError
          ? `No hemos podido leer «${cause.fileName}». Si viene de un iPhone, prueba a exportarla como JPG.`
          : cause instanceof Error
            ? cause.message
            : 'Algo ha ido mal al publicar el álbum.',
      )
      setPhase({ kind: 'idle' })
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-script text-[clamp(2.2rem,7vw,3.4rem)] text-paper">Nuevo álbum</h1>
      <p className="mt-3 text-sm text-paper-lilac/60">
        Elige tus fotos y escribe qué recuerda cada una. No se sube nada hasta que
        pulses «Crear álbum».
      </p>

      {/* ---------------- Datos del álbum ---------------- */}
      <div className="mt-10 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-[0.7rem] uppercase tracking-[0.22em] text-soft-pink/70">
            Título
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            required
            placeholder="Diario de Tini"
            className="rounded-xl border border-soft-pink/25 bg-dark-violet/40 px-4 py-3 text-paper outline-none transition-colors placeholder:text-paper-lilac/30 focus:border-hot-pink/60"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-soft-pink/70">
              Subtítulo <span className="normal-case tracking-normal opacity-60">(opcional)</span>
            </span>
            <input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              maxLength={MAX_SUBTITLE}
              placeholder="un lugar para guardar lo que no quiero olvidar"
              className="rounded-xl border border-soft-pink/25 bg-dark-violet/40 px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-paper-lilac/30 focus:border-hot-pink/60"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-soft-pink/70">
              Texto de cierre <span className="normal-case tracking-normal opacity-60">(opcional)</span>
            </span>
            <input
              value={closing}
              onChange={(event) => setClosing(event.target.value)}
              maxLength={MAX_CLOSING}
              placeholder="y la historia sigue…"
              className="rounded-xl border border-soft-pink/25 bg-dark-violet/40 px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-paper-lilac/30 focus:border-hot-pink/60"
            />
          </label>
        </div>
      </div>

      {/* ---------------- Selector de fotos ---------------- */}
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          addFiles(event.dataTransfer.files)
        }}
        className="mt-10 rounded-2xl border border-dashed border-soft-pink/25 bg-dark-violet/20 px-6 py-10 text-center"
      >
        <Doodle name="camera" className="mx-auto h-9 w-9 text-hot-pink/70" />
        <p className="mt-4 text-sm text-paper-lilac/70">
          Arrastra tus fotos aquí, o
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-4 rounded-full border border-soft-pink/35 px-6 py-2.5 text-sm text-soft-pink transition-colors hover:border-hot-pink/70 hover:text-hot-pink disabled:opacity-40"
        >
          Elegir fotos
        </button>
        <p className="mt-4 text-xs text-paper-lilac/40">
          {drafts.length} de {MAX_PHOTOS}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => addFiles(event.target.files)}
          className="sr-only"
        />
      </div>

      {/* ---------------- Una fila por foto ---------------- */}
      {drafts.length > 0 && (
        <ul className="mt-8 flex flex-col gap-4">
          {drafts.map((draft, index) => (
            <li
              key={draft.id}
              className="flex gap-4 rounded-2xl border border-soft-pink/15 bg-dark-violet/25 p-4"
            >
              {/* Miniatura local: el archivo aún no ha salido del navegador. */}
              <img
                src={draft.previewUrl}
                alt=""
                className="h-24 w-24 flex-none rounded-lg object-cover sm:h-28 sm:w-28"
              />

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[0.7rem] uppercase tracking-[0.22em] text-soft-pink/60">
                    Foto {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(draft.id)}
                    disabled={busy}
                    aria-label={`Quitar la foto ${index + 1}`}
                    className="text-xs text-paper-lilac/45 transition-colors hover:text-hot-pink disabled:opacity-40"
                  >
                    Quitar
                  </button>
                </div>

                <textarea
                  value={draft.caption}
                  onChange={(event) => update(draft.id, { caption: event.target.value })}
                  maxLength={MAX_CAPTION}
                  rows={2}
                  required
                  placeholder="¿Qué recuerda esta foto?"
                  aria-label={`Descripción de la foto ${index + 1}`}
                  className="w-full resize-none rounded-lg border border-soft-pink/20 bg-deep/40 px-3 py-2 font-script text-lg text-paper outline-none transition-colors placeholder:font-sans placeholder:text-sm placeholder:text-paper-lilac/30 focus:border-hot-pink/60"
                />

                <div className="flex items-center justify-between gap-3">
                  <input
                    value={draft.takenLabel}
                    onChange={(event) => update(draft.id, { takenLabel: event.target.value })}
                    maxLength={24}
                    placeholder="Marzo (opcional)"
                    aria-label={`Época de la foto ${index + 1}`}
                    className="min-w-0 flex-1 rounded-lg border border-soft-pink/15 bg-deep/40 px-3 py-1.5 text-xs text-paper outline-none transition-colors placeholder:text-paper-lilac/25 focus:border-hot-pink/50"
                  />
                  <span className="flex-none text-xs text-paper-lilac/35">
                    {draft.caption.length}/{MAX_CAPTION}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ---------------- Publicar ---------------- */}
      {error && (
        <p role="alert" className="mt-8 rounded-xl bg-magenta/20 px-4 py-3 text-sm text-soft-pink">
          {error}
        </p>
      )}

      {missingCaption && drafts.length > 0 && !error && (
        <p className="mt-8 text-sm text-paper-lilac/50">
          Cada foto necesita su descripción antes de publicar.
        </p>
      )}

      <div className="mt-8 flex flex-col items-start gap-3 pb-16">
        <button
          type="button"
          onClick={handlePublish}
          disabled={!canPublish}
          className="rounded-full bg-hot-pink px-8 py-3.5 text-sm font-medium text-deep transition-transform duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
        >
          {phase.kind === 'uploading'
            ? `Subiendo ${phase.done} de ${phase.total}…`
            : phase.kind === 'saving'
              ? 'Creando el álbum…'
              : 'Crear álbum'}
        </button>

        {busy && (
          <p aria-live="polite" className="text-xs text-paper-lilac/45">
            No cierres esta pestaña hasta que termine.
          </p>
        )}
      </div>
    </div>
  )
}
