import { useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { MAX_PORTFOLIO, removeImage, uploadImage, validateImage } from '../lib/images'
import { card, sectionTitle } from '../lib/ui'
import Spinner from './Spinner'

export default function PortfolioManager() {
  const { userId, myBarista, updateMyMedia } = useStore()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const photos = myBarista?.portfolio ?? []
  const remaining = MAX_PORTFOLIO - photos.length

  async function handleFiles(e) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    setError('')
    for (const f of files) {
      const problem = validateImage(f)
      if (problem) {
        setError(problem)
        return
      }
    }

    const chosen = files.slice(0, remaining)
    setBusy(true)
    const uploaded = []
    try {
      for (const f of chosen) uploaded.push(await uploadImage(userId, f, 'portfolio'))
      const ok = await updateMyMedia({ portfolio: [...photos, ...uploaded] })
      if (!ok) await Promise.all(uploaded.map(removeImage))
      else if (files.length > remaining) {
        setError(`Only ${MAX_PORTFOLIO} photos are allowed. Extra photos were skipped.`)
      }
    } catch (err) {
      setError(err.message)
      await Promise.all(uploaded.map(removeImage))
    }
    setBusy(false)
  }

  async function handleRemove(url) {
    setError('')
    setBusy(true)
    const ok = await updateMyMedia({ portfolio: photos.filter((u) => u !== url) })
    if (ok) await removeImage(url)
    setBusy(false)
  }

  return (
    <section className={`${card} p-5`}>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className={sectionTitle}>Portfolio</h2>
        <span className="text-xs text-stone-500">
          {photos.length}/{MAX_PORTFOLIO} photos
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {photos.map((url) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-200">
            <img src={url} alt="Portfolio" loading="lazy" className="h-full w-full object-cover" />
            <button
              type="button"
              disabled={busy}
              onClick={() => handleRemove(url)}
              aria-label="Remove photo"
              className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-700 shadow transition hover:scale-110 active:scale-90 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#E2D3C2] bg-[#FBF6EF] text-xs font-semibold text-[#8A4F1E] transition duration-200 hover:border-[#B8742F] hover:bg-[#F6E6D2] active:scale-95 disabled:opacity-60"
          >
            {busy ? <Spinner className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            {busy ? 'Uploading...' : 'Add photo'}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-stone-500">
        Photos upload right away. Photos are resized automatically.
      </p>
    </section>
  )
}