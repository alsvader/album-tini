'use client'

/**
 * Zona de peligro: eliminar la cuenta.
 *
 * Mismo patrón que la de borrar un álbum en `EditAlbumForm.tsx` — confirmación
 * con `<ConfirmDialog>` antes de llamar al Server Action, que en éxito ya
 * redirige solo.
 */

import { useState } from 'react'
import { deleteAccount } from './actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export function DeleteAccountSection() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setDeleting(true)
    setError(null)

    const result = await deleteAccount()

    // Solo se llega aquí si falló: en éxito, `deleteAccount` ya redirige.
    if (result && !result.ok) {
      setError(result.error)
      setDeleting(false)
    }
  }

  return (
    <div className="mt-16 rounded-2xl border border-magenta/30 bg-magenta/10 px-6 py-6">
      <p className="text-sm font-medium text-soft-pink">Zona de peligro</p>
      <p className="mt-1 text-xs text-paper-lilac/50">
        Eliminar tu cuenta es definitivo: se borran todos tus álbumes y fotos, y los enlaces que
        hayas compartido dejan de funcionar.
      </p>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-magenta/20 px-4 py-3 text-sm text-soft-pink">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={deleting}
        className="mt-4 rounded-full border border-hot-pink/50 px-6 py-2.5 text-sm text-hot-pink transition-colors hover:bg-hot-pink/10 disabled:opacity-40"
      >
        Eliminar mi cuenta
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar tu cuenta?"
        description="Se borrarán todos tus álbumes y fotos, de forma permanente. No hay vuelta atrás."
        confirmLabel="Eliminar cuenta"
        busy={deleting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
