import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { homeFor } from '../../lib/roles'
import { btnPrimary, labelClass } from '../../lib/ui'
import AuthLayout from '../../components/AuthLayout'
import IconInput from '../../components/IconInput'
import PasswordInput from '../../components/PasswordInput'
import Spinner from '../../components/Spinner'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    navigate(homeFor(profile?.role), { replace: true })
  }

  return (
    <AuthLayout title="My BT Mate" subtitle="Find the barista behind your favorite cup.">
      <div>
        <h2 className="font-display text-2xl font-bold text-[#2B1A12]">Welcome back</h2>
        <p className="mt-1 text-sm text-stone-500">Log in to find or book your favorite barista.</p>
      </div>

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
        <label className={labelClass}>
          Password
          <PasswordInput
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </label>

        {error && (
          <p role="alert" className="animate-fade-in rounded-xl bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading && <Spinner />}
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="text-center text-sm text-stone-600">
        New here?{' '}
        <Link to="/register" className="font-semibold text-[#8A4F1E] hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}