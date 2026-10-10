import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Coffee, Mail, UserRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { homeFor } from '../../lib/roles'
import { btnPrimary, labelClass } from '../../lib/ui'
import AuthLayout from '../../components/AuthLayout'
import IconInput from '../../components/IconInput'
import PasswordInput from '../../components/PasswordInput'
import Spinner from '../../components/Spinner'

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('customer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const mismatch = confirm.length > 0 && password !== confirm
  const matches = confirm.length > 0 && password === confirm

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim(), role } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      navigate(homeFor(role), { replace: true })
    } else {
      setMessage('Account created. Check your email to confirm, then log in.')
      setLoading(false)
    }
  }

  const roleCard = (value, Icon, label, hint) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      aria-pressed={role === value}
      className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 p-3.5 text-sm font-bold transition duration-200 active:scale-[0.97] ${
        role === value
          ? 'border-[#3B2316] bg-[#F6E6D2] text-[#2B1A12] shadow-sm'
          : 'border-[#E2D3C2] bg-white text-[#2B1A12] hover:border-[#B8742F]'
      }`}
    >
      <Icon className="h-6 w-6 text-[#8A4F1E]" />
      {label}
      <span className="text-xs font-normal text-stone-500">{hint}</span>
    </button>
  )

  return (
    <AuthLayout title="Join BREWtiful Minds" subtitle="Choose how you will use the app.">
      <div>
        <h2 className="font-display text-2xl font-bold text-[#2B1A12]">Create account</h2>
        <p className="mt-1 text-sm text-stone-500">It only takes a minute.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-3">
          {roleCard('customer', Coffee, 'Customer', 'Find and book')}
          {roleCard('barista', UserRound, 'Barista', 'Build my profile')}
        </div>

        <label className={labelClass}>
          Full name
          <IconInput
            icon={UserRound}
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </label>
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
        <label className={labelClass}>
          Password
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
          Confirm password
          <PasswordInput
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type your password again"
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
        {message && (
          <p className="animate-fade-in rounded-xl bg-green-50 p-3 text-sm text-green-800">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading || mismatch} className={btnPrimary}>
          {loading && <Spinner />}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-stone-600">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-[#8A4F1E] hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}