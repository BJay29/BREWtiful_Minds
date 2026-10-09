import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { baristaNav, customerNav } from '../../lib/nav'
import { btnPrimary, card, labelClass } from '../../lib/ui'
import AppShell from '../../components/AppShell'
import PageHeader from '../../components/PageHeader'
import PasswordInput from '../../components/PasswordInput'
import Spinner from '../../components/Spinner'

export default function ChangePassword() {
  const { profile } = useAuth()
  const role = profile.role

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated.')
      setPassword('')
      setConfirm('')
    }
    setSaving(false)
  }

  return (
    <AppShell items={role === 'barista' ? baristaNav : customerNav}>
      <PageHeader
        title="Change password"
        subtitle="Choose a new password for your account."
        back={`/${role}/profile`}
      />

      <form onSubmit={handleSubmit} className={`${card} flex flex-col gap-4 p-5`}>
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
          />
        </label>

        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}

        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving && <Spinner />}
          {saving ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </AppShell>
  )
}