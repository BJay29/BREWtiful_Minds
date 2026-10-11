import { useEffect } from 'react'
import { LogOut } from 'lucide-react'
import Spinner from './Spinner'

export default function LogoutModal({ open, busy = false, onCancel, onConfirm }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onCancel])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      onClick={() => !busy && onCancel()}
      className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-black/60 p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-fade-up rounded-3xl bg-white p-6 text-center shadow-2xl"
      >
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F6E6D2]">
          <LogOut className="h-6 w-6 text-[#8A4F1E]" />
        </span>
        <h2 id="logout-title" className="font-display text-xl font-bold text-[#2B1A12]">
          Log out?
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Are you sure you want to log out of BREWtiful Minds?
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#3B2316] bg-white text-sm font-bold text-[#3B2316] transition hover:bg-[#F6E6D2] active:scale-[0.97] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            autoFocus
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#3B2316] text-sm font-bold text-[#F6E9D8] transition hover:bg-[#2B1A12] active:scale-[0.97] disabled:opacity-70"
          >
            {busy && <Spinner className="h-4 w-4" />}
            {busy ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </div>
    </div>
  )
}