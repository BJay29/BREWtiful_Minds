import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import { removeImage, uploadImage, validateImage } from '../lib/images'
import { btnOutline, card } from '../lib/ui'
import BaristaAvatar from './BaristaAvatar'
import Spinner from './Spinner'

export default function AvatarUpload() {
  const { profile } = useAuth()
  const { userId, myBarista, updateMyMedia } = useStore()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const problem = validateImage(file)
    if (problem) {
      setError(problem)
      return
    }

    setError('')
    setBusy(true)
    let url = null
    try {
      url = await uploadImage(userId, file, 'avatar')
      const previous = myBarista?.avatarUrl
      const ok = await updateMyMedia({ avatar_url: url })
      if (ok && previous) await removeImage(previous)
      if (!ok) await removeImage(url)
    } catch (err) {
      setError(err.message)
      if (url) await removeImage(url)
    }
    setBusy(false)
  }

  return (
    <section className={`${card} p-5`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <BaristaAvatar
            src={myBarista?.avatarUrl}
            color={myBarista?.color}
            className="h-20 w-20 shrink-0"
          />
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 text-[#8A4F1E]">
              <Spinner className="h-6 w-6" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-[#2B1A12]">{profile?.full_name}</p>
          <p className="mb-2 text-xs text-stone-500">Your photo shows on your public profile.</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className={`${btnOutline} h-10 px-4 text-sm`}
          >
            <Camera className="h-4 w-4" />
            {myBarista?.avatarUrl ? 'Change photo' : 'Upload photo'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
    </section>
  )
}