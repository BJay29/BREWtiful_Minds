import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { inputBase } from '../lib/ui'

export default function PasswordInput(props) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
      <input {...props} type={show ? 'text' : 'password'} className={`${inputBase} px-11`} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  )
}