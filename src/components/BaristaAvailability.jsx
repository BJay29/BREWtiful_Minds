import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../context/StoreContext'
import { card, sectionTitle } from '../lib/ui'
import AvailabilityCalendar from './AvailabilityCalendar'
import Spinner from './Spinner'

export default function BaristaAvailability() {
  const { userId } = useStore()
  const [blocked, setBlocked] = useState(new Set())
  const [booked, setBooked] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    const { data, error: err } = await supabase.rpc('get_unavailable_dates', { p_barista: userId })
    if (err) {
      setError(err.message)
    } else {
      setBlocked(new Set(data.filter((r) => r.kind === 'blocked').map((r) => r.unavailable_date)))
      setBooked(new Set(data.filter((r) => r.kind === 'booked').map((r) => r.unavailable_date)))
    }
    setLoading(false)
  }

  useEffect(() => {
    if (userId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function toggle(iso) {
    setError('')
    const isBlocked = blocked.has(iso)

    // Optimistic update
    setBlocked((prev) => {
      const next = new Set(prev)
      if (isBlocked) next.delete(iso)
      else next.add(iso)
      return next
    })

    const { error: err } = isBlocked
      ? await supabase
          .from('barista_unavailable_dates')
          .delete()
          .eq('barista_id', userId)
          .eq('unavailable_date', iso)
      : await supabase
          .from('barista_unavailable_dates')
          .insert({ barista_id: userId, unavailable_date: iso })

    if (err) {
      setError(err.message)
      await load()
    }
  }

  return (
    <section className={`${card} flex flex-col gap-3 p-5`}>
      <div>
        <h2 className={sectionTitle}>Availability</h2>
        <p className="text-xs text-stone-500">
          Tap a date to mark it as not available. Tap it again to open it. Dates with an accepted
          booking are marked automatically.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-6 text-[#8A4F1E]">
          <Spinner className="h-5 w-5" />
        </div>
      ) : (
        <AvailabilityCalendar blocked={blocked} booked={booked} onSelect={toggle} unlockBlocked />
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
    </section>
  )
}