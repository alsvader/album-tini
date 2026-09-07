'use client'

/**
 * Edición de un álbum: añadir fotos, reordenarlas, editar su descripción, y
 * también su subtítulo y texto de cierre. Fuera de alcance a propósito: el
 * título del álbum y la "época" de una foto que ya estaba guardada.
 *
 * Misma regla que `CreateAlbumForm`: nada toca la red hasta que se pulsa
 * «Guardar cambios». Las fotos nuevas viven como `URL.createObjectURL` local
 * y el orden se resuelve arrastrando (o con «Subir»/«Bajar», porque el
 * arrastre por puntero no es operable por teclado) hasta ese momento.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Reorder } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { PHOTOS_BUCKET } from '@/lib/supabase/env'
import { MAX_CAPTION, MAX_CLOSING, MAX_PHOTOS, MAX_SUBTITLE } from '@/lib/albumRules'
import { resizeImage, UnsupportedImageError } from '@/lib/resizeImage'
import { deleteAlbum, saveAlbumPhotos, type SavePhotoItem } from './actions'
import { Doodle } from '@/components/ui/Doodle'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { EditablePhoto } from '@/lib/albums'

type ExistingItem = { kind: 'existing'; id: string; url: string; caption: string }
type NewItem = {
  kind: 'new'
  /** Id local, también el nombre del archivo en Storage. */
  id: string
  file: File
  previewUrl: string
  caption: string
  takenLabel: string
}
type Item = ExistingItem | NewItem

type Phase = { kind: 'idle' } | { kind: 'uploading'; done: number; total: number } | { kind: 'saving' }

type Props = {
  albumId: string
  title: string
  initialSubtitle: string | null
  initialClosing: string | null
  initialPhotos: EditablePhoto[]
}

export function EditAlbumForm({
  albumId,
  title,
  initialSubtitle,
  initialClosing,
  initialPhotos,
}: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [subtitle, setSubtitle] = useState(initialSubtitle ?? '')
  const [closing, setClosing] = useState(initialClosing ?? '')

  const [items, setItems] = useState<Item[]>(() =>
    initialPhotos.map((photo) => ({
      kind: 'existing',
      id: photo.id,
      url: photo.url,
      caption: photo.caption,
    })),
  )
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [error, setError] = useState<string | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(
    () => () => {
      for (const item of items) {
        if (item.kind === 'new') URL.revokeObjectURL(item.previewUrl)
      }
    },
    [items],
  )

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return

      const picked = Array.from(files).filter((file) => file.type.startsWith('image/'))

      if (inputRef.current) inputRef.current.value = ''

      if (picked.length === 0) {
        setError('Esos archivos no son imágenes.')
        return
      }

      const room = MAX_PHOTOS - items.length

      if (room <= 0) {
        setError(`Ya has llegado al máximo de ${MAX_PHOTOS} fotos.`)
        return
      }

      const incoming = picked.slice(0, room)

      setError(
        incoming.length < picked.length
          ? `Sólo caben ${MAX_PHOTOS} fotos por álbum; se han añadido las primeras.`
          : null,
      )

      setItems((current) => [
        ...current,
        ...incoming.map(
          (file): NewItem => ({
            kind: 'new',
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            caption: '',
            takenLabel: '',
          }),
        ),
      ])
    },
    [items.length],
  )

  const updateCaption = (id: string, caption: string) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, caption } : item)))

  const updateTakenLabel = (id: string, takenLabel: string) =>
    setItems((current) =>
      current.map((item) => (item.kind === 'new' && item.id === id ? { ...item, takenLabel } : item)),
    )

  const removeNew = (id: string) =>
    setItems((current) => {
      const target = current.find((item) => item.kind === 'new' && item.id === id)
      if (target?.kind === 'new') URL.revokeObjectURL(target.previewUrl)
      return current.filter((item) => !(item.kind === 'new' && item.id === id))
    })

  const moveBy = (index: number, direction: -1 | 1) =>
    setItems((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      const temp = next[index]!
      next[index] = next[target]!
      next[target] = temp
      return next
    })

  const busy = phase.kind !== 'idle'

  const missingCaption = items.some((item) => !item.caption.trim())
  const canSave = items.length > 0 && !missingCaption && !busy

  async function handleSave() {
    if (!canSave) return
    setError(null)

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Tu sesión ha caducado. Vuelve a entrar.')
      return
    }

    const newItems = items.filter((item): item is NewItem => item.kind === 'new')

    try {
      const uploadedPaths = new Map<string, string>()

      if (newItems.length > 0) {
        setPhase({ kind: 'uploading', done: 0, total: newItems.length })

        for (const [index, item] of newItems.entries()) {
          const { blob } = await resizeImage(item.file)
          const storagePath = `${user.id}/${albumId}/${item.id}.webp`

          const { error: uploadError } = await supabase.storage
            .from(PHOTOS_BUCKET)
            .upload(storagePath, blob, { contentType: 'image/webp', upsert: false })

          if (uploadError) throw new Error(`No se pudo subir la foto nueva ${index + 1}.`)

          uploadedPaths.set(item.id, storagePath)
          setPhase({ kind: 'uploading', done: index + 1, total: newItems.length })
        }
      }

      setPhase({ kind: 'saving' })

      const payload: SavePhotoItem[] = items.map((item, position) =>
        item.kind === 'existing'
          ? { kind: 'existing', id: item.id, position, caption: item.caption.trim() }
          : {
              kind: 'new',
              storagePath: uploadedPaths.get(item.id)!,
              caption: item.caption.trim(),
              takenLabel: item.takenLabel.trim() || undefined,
              position,
            },
      )

      const result = await saveAlbumPhotos({ albumId, subtitle, closing, items: payload })

      if (!result.ok) {
        setError(result.error)
        setPhase({ kind: 'idle' })
        return
      }

      router.push('/mis-albumes')
    } catch (cause) {
      setError(
        cause instanceof UnsupportedImageError
          ? `No hemos podido leer «${cause.fileName}». Si viene de un iPhone, prueba a exportarla como JPG.`
          : cause instanceof Error
            ? cause.message
            : 'Algo ha ido mal al guardar los cambios.',
      )
      setPhase({ kind: 'idle' })
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    setDeleteError(null)

    const result = await deleteAlbum(albumId)

    // Solo se llega aquí si falló: en éxito, `deleteAlbum` ya redirige.
    if (result && !result.ok) {
      setDeleteError(result.error)
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-script text-[clamp(2.2rem,7vw,3.4rem)] text-paper">
        Editando «{title}»
      </h1>
      <p className="mt-3 text-sm text-paper-lilac/60">
        Añade fotos, edita sus descripciones, arrastra para reordenar y pulsa «Guardar cambios»
        cuando termines. Nada se guarda antes de eso.
      </p>

      {/* ---------------- Subtítulo y cierre ---------------- */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
            Texto de cierre{' '}
            <span className="normal-case tracking-normal opacity-60">(opcional)</span>
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

      {/* ---------------- Fotos actuales y nuevas ---------------- */}
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="mt-8 flex flex-col gap-4">
        {items.map((item, index) => (
          <Reorder.Item
            key={item.id}
            value={item}
            whileDrag={{ scale: 1.02 }}
            className="flex cursor-grab gap-4 rounded-2xl border border-soft-pink/15 bg-dark-violet/25 p-4 active:cursor-grabbing"
          >
            <img
              src={item.kind === 'existing' ? item.url : item.previewUrl}
              alt=""
              className="h-24 w-24 flex-none rounded-lg object-cover sm:h-28 sm:w-28"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-soft-pink/60">
                  Foto {index + 1}
                  {item.kind === 'new' && ' · nueva'}
                </span>
                {item.kind === 'new' && (
                  <button
                    type="button"
                    onClick={() => removeNew(item.id)}
                    disabled={busy}
                    aria-label={`Quitar la foto ${index + 1}`}
                    className="text-xs text-paper-lilac/45 transition-colors hover:text-hot-pink disabled:opacity-40"
                  >
                    Quitar
                  </button>
                )}
              </div>

              <textarea
                value={item.caption}
                onChange={(event) => updateCaption(item.id, event.target.value)}
                maxLength={MAX_CAPTION}
                rows={2}
                required
                placeholder="¿Qué recuerda esta foto?"
                aria-label={`Descripción de la foto ${index + 1}`}
                className="w-full resize-none rounded-lg border border-soft-pink/20 bg-deep/40 px-3 py-2 font-script text-lg text-paper outline-none transition-colors placeholder:font-sans placeholder:text-sm placeholder:text-paper-lilac/30 focus:border-hot-pink/60"
              />

              {item.kind === 'new' ? (
                <div className="flex items-center justify-between gap-3">
                  <input
                    value={item.takenLabel}
                    onChange={(event) => updateTakenLabel(item.id, event.target.value)}
                    maxLength={24}
                    placeholder="Marzo (opcional)"
                    aria-label={`Época de la foto ${index + 1}`}
                    className="min-w-0 flex-1 rounded-lg border border-soft-pink/15 bg-deep/40 px-3 py-1.5 text-xs text-paper outline-none transition-colors placeholder:text-paper-lilac/25 focus:border-hot-pink/50"
                  />
                  <span className="flex-none text-xs text-paper-lilac/35">
                    {item.caption.length}/{MAX_CAPTION}
                  </span>
                </div>
              ) : (
                <div className="flex justify-end">
                  <span className="text-xs text-paper-lilac/35">
                    {item.caption.length}/{MAX_CAPTION}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-none flex-col justify-center gap-1">
              <button
                type="button"
                onClick={() => moveBy(index, -1)}
                disabled={busy || index === 0}
                aria-label="Subir"
                className="grid h-7 w-7 place-items-center rounded-full border border-soft-pink/20 text-soft-pink transition-colors hover:border-hot-pink/50 hover:text-hot-pink disabled:opacity-30"
              >
                <Doodle name="arrowNext" className="h-3.5 w-3.5 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => moveBy(index, 1)}
                disabled={busy || index === items.length - 1}
                aria-label="Bajar"
                className="grid h-7 w-7 place-items-center rounded-full border border-soft-pink/20 text-soft-pink transition-colors hover:border-hot-pink/50 hover:text-hot-pink disabled:opacity-30"
              >
                <Doodle name="arrowNext" className="h-3.5 w-3.5 rotate-90" />
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* ---------------- Añadir fotos ---------------- */}
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          addFiles(event.dataTransfer.files)
        }}
        className="mt-8 rounded-2xl border border-dashed border-soft-pink/25 bg-dark-violet/20 px-6 py-10 text-center"
      >
        <Doodle name="camera" className="mx-auto h-9 w-9 text-hot-pink/70" />
        <p className="mt-4 text-sm text-paper-lilac/70">Arrastra fotos nuevas aquí, o</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-4 rounded-full border border-soft-pink/35 px-6 py-2.5 text-sm text-soft-pink transition-colors hover:border-hot-pink/70 hover:text-hot-pink disabled:opacity-40"
        >
          Añadir fotos
        </button>
        <p className="mt-4 text-xs text-paper-lilac/40">
          {items.length} de {MAX_PHOTOS}
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

      {/* ---------------- Guardar ---------------- */}
      {error && (
        <p role="alert" className="mt-8 rounded-xl bg-magenta/20 px-4 py-3 text-sm text-soft-pink">
          {error}
        </p>
      )}

      {missingCaption && !error && (
        <p className="mt-8 text-sm text-paper-lilac/50">
          Cada foto necesita su descripción antes de guardar.
        </p>
      )}

      <div className="mt-8 flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="rounded-full bg-hot-pink px-8 py-3.5 text-sm font-medium text-deep transition-transform duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
        >
          {phase.kind === 'uploading'
            ? `Subiendo ${phase.done} de ${phase.total}…`
            : phase.kind === 'saving'
              ? 'Guardando…'
              : 'Guardar cambios'}
        </button>

        {busy && (
          <p aria-live="polite" className="text-xs text-paper-lilac/45">
            No cierres esta pestaña hasta que termine.
          </p>
        )}
      </div>

      {/* ---------------- Zona de peligro ---------------- */}
      <div className="mt-16 rounded-2xl border border-magenta/30 bg-magenta/10 px-6 py-6">
        <p className="text-sm font-medium text-soft-pink">Zona de peligro</p>
        <p className="mt-1 text-xs text-paper-lilac/50">
          Borrar el álbum es definitivo: se pierden las fotos y el enlace deja de funcionar.
        </p>

        {deleteError && (
          <p role="alert" className="mt-3 rounded-xl bg-magenta/20 px-4 py-3 text-sm text-soft-pink">
            {deleteError}
          </p>
        )}

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={deleting}
          className="mt-4 rounded-full border border-hot-pink/50 px-6 py-2.5 text-sm text-hot-pink transition-colors hover:bg-hot-pink/10 disabled:opacity-40"
        >
          Eliminar álbum
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar este álbum?"
        description={`Se borrará «${title}» junto con todas sus fotos, de forma permanente.`}
        confirmLabel="Eliminar álbum"
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className="pb-16" />
    </div>
  )
}
