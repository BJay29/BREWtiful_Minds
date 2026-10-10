import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { btnPrimary, labelClass } from '../../lib/ui'
import AuthLayout from '../../components/AuthLayout'
import PasswordInput from '../../components/PasswordInput'
import Spinner from '../../components/Spinner'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [expired, setExpired] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const mismatch = confirm.length > 0 && password !== confirm
  const matches = confirm.length > 0 && password === confirm

  // The link in the email signs the user in temporarily so they can set a new password.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) setReady(true)
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })

    const timer = setTimeout(() => setExpired(true), 4000)

    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    setDone(true)
    setLoading(false)
    setTimeout(() => navigate('/login', { replace: true }), 2000)
  }

  return (
    <AuthLayout title="BREWtiful Minds" subtitle="Find the barista behind your favorite cup.">
      <div>
        <h2 className="font-display text-2xl font-bold text-[#2B1A12]">Set a new password</h2>
        <p className="mt-1 text-sm text-stone-500">Choose a password you have not used before.</p>
      </div>

      {done ? (
        <p className="animate-fade-in rounded-xl bg-green-50 p-3 text-sm text-green-800">
          Password updated. Taking you to log in...
        </p>
      ) : !ready ? (
        expired ? (
          <div className="flex flex-col gap-3">
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
              This reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/forgot-password" className={btnPrimary}>
              Request a new link
            </Link>
          </div>
        ) : (
          <div className="flex justify-center py-6 text-[#8A4F1E]">
            <Spinner className="h-6 w-6" />
          </div>
        )
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className={labelClass}>
            New password
            <PasswordInput
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </label>
          <label className={labelClass}>
            Confirm new password
            <PasswordInput
              required
              minLength={6}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again"
              aria-invalid={mismatch}
            />
            {mismatch && (
              <span role="status" className="animate-fade-in text-xs font-normal text-red-700">
                Passwords do not match.
              </span>
            )}
            {matches && (
              <span
                role="status"
                className="animate-fade-in flex items-center gap-1 text-xs font-normal text-green-700"
              >
                <Check className="h-3.5 w-3.5" /> Passwords match.
              </span>
            )}
          </label>

          {error && (
            <p role="alert" className="animate-fade-in rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading || mismatch} className={btnPrimary}>
            {loading && <Spinner />}
            {loading ? 'Saving...' : 'Update password'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}