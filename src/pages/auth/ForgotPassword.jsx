import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { btnPrimary, labelClass } from '../../lib/ui'
import AuthLayout from '../../components/AuthLayout'
import IconInput from '../../components/IconInput'
import Spinner from '../../components/Spinner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <AuthLayout title="BREWtiful Minds" subtitle="Find the barista behind your favorite cup.">
      <div>
        <h2 className="font-display text-2xl font-bold text-[#2B1A12]">Forgot password?</h2>
        <p className="mt-1 text-sm text-stone-500">
          Enter your email and we will send you a link to reset it.
        </p>
      </div>

      {sent ? (
        <p className="animate-fade-in rounded-xl bg-green-50 p-3 text-sm text-green-800">
          If an account exists for <b>{email}</b>, a reset link is on its way. Check your inbox
          and spam folder.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className={labelClass}>
            Email
            <IconInput
              icon={Mail}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </label>

          {error && (
            <p role="alert" className="animate-fade-in rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading && <Spinner />}
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-stone-600">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-[#8A4F1E] hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  )
}