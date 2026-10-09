import { useState } from 'react'
import { Mail, UserRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'
import { supabase } from '../../lib/supabase'
import { baristaNav, customerNav } from '../../lib/nav'
import { btnPrimary, card, labelClass } from '../../lib/ui'
import AppShell from '../../components/AppShell'
import IconInput from '../../components/IconInput'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'

export default function AccountEdit() {
  const { session, profile, refreshProfile } = useAuth()
  const { reload } = useStore()
  const role = profile.role

  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')

    const name = fullName.trim()
    if (!name) {
      setError('Please enter your name.')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', session.user.id)

    if (error) {
      setError(error.message)
    } else {
      await refreshProfile()
      await reload()
      setMessage('Account updated.')
    }
    setSaving(false)
  }

  return (
    <AppShell items={role === 'barista' ? baristaNav : customerNav}>
      <PageHeader
        title="Edit account"
        subtitle="Update how your name appears."
        back={`/${role}/profile`}
      />

      <form onSubmit={handleSubmit} className={`${card} flex flex-col gap-4 p-5`}>
        <label className={labelClass}>
          Full name
          <IconInput
            icon={UserRound}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Email
          <IconInput icon={Mail} value={session.user.email} readOnly disabled className="bg-stone-50 text-stone-500" />
          <span className="text-xs font-normal text-stone-500">Email cannot be changed here.</span>
        </label>

        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}

        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving && <Spinner />}
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </AppShell>
  )
}