import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { supabase } from '../../lib/supabase'
import AppShell from '../../components/AppShell'
import AvailabilityCalendar from '../../components/AvailabilityCalendar'
import BaristaAvatar from '../../components/BaristaAvatar'
import EmptyState from '../../components/EmptyState'
import LocationPicker from '../../components/LocationPicker'
import PageHeader from '../../components/PageHeader'
import RatingPill from '../../components/RatingPill'
import Spinner from '../../components/Spinner'
import { customerNav } from '../../lib/nav'
import { btnPrimary, card, inputClass, labelClass, textareaClass } from '../../lib/ui'

const EVENT_TYPES = ['Birthday', 'Wedding', 'Office', 'Other']

const peso = (n) => `₱${Number(n).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`

export default function Booking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getBarista, createBooking } = useStore()
  const barista = getBarista(id)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pay, setPay] = useState(null)
  const [blocked, setBlocked] = useState(new Set())
  const [booked, setBooked] = useState(new Set())
  const [place, setPlace] = useState({ address: '', lat: null, lng: null })
  const [form, setForm] = useState({
    date: '',
    time: '',
    eventType: 'Birthday',
    notes: '',
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase
        .from('barista_payment')
        .select('rate, deposit_percent, accepts_gcash, accepts_cash')
        .eq('barista_id', id)
        .maybeSingle(),
      supabase.rpc('get_unavailable_dates', { p_barista: id }),
    ]).then(([p, d]) => {
      if (cancelled) return
      setPay(p.data)
      const rows = d.data ?? []
      setBlocked(new Set(rows.filter((r) => r.kind === 'blocked').map((r) => r.unavailable_date)))
      setBooked(new Set(rows.filter((r) => r.kind === 'booked').map((r) => r.unavailable_date)))
    })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!barista) {
    return (
      <AppShell items={customerNav}>
        <EmptyState title="Barista not found" to="/customer" actionLabel="Back to home" />
      </AppShell>
    )
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const deposit =
    pay?.rate != null && pay.deposit_percent ? (pay.rate * pay.deposit_percent) / 100 : null

  const accepted = [
    pay?.accepts_gcash !== false ? 'GCash' : null,
    pay?.accepts_cash !== false ? 'Cash on event day' : null,
  ]
    .filter(Boolean)
    .join(' or ')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.date) {
      setError('Please choose an available date.')
      return
    }
    if (place.lat == null || place.lng == null) {
      setError('Please pin the event location on the map.')
      return
    }

    setSubmitting(true)
    const ok = await createBooking({
      baristaId: id,
      eventType: form.eventType,
      date: form.date,
      time: form.time,
      notes: form.notes,
      location: place.address.trim() || 'Pinned location',
      latitude: place.lat,
      longitude: place.lng,
    })
    setSubmitting(false)
    if (ok) navigate('/customer/bookings')
  }

  return (
    <AppShell items={customerNav}>
      <PageHeader
        title="Book your barista"
        subtitle="Send a request. The barista will accept or decline."
        back={`/customer/barista/${id}`}
      />

      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#3B2316] p-4 text-[#F6E9D8] shadow-md">
        <BaristaAvatar src={barista.avatarUrl} color={barista.color} className="h-12 w-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{barista.name}</p>
          <p className="truncate text-xs text-[#D9BFA3]">
            {[barista.cafe, barista.city].filter(Boolean).join(' · ')}
          </p>
        </div>
        <RatingPill value={barista.rating} />
      </div>

      {pay?.rate != null && (
        <div className="mb-4 rounded-2xl border border-[#EADCCB] bg-[#F6E6D2]/70 p-4 text-sm text-[#4A2B18]">
          <p>
            Rate: <b>{peso(pay.rate)}</b> per event
            {deposit != null && pay.accepts_gcash !== false && (
              <>
                {' '}· GCash deposit ({pay.deposit_percent}%): <b>{peso(deposit)}</b>
              </>
            )}
          </p>
          <p className="mt-1 text-xs">
            Accepts: {accepted}. You pay after the barista accepts your request. Payment details
            will appear in My bookings.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${card} flex flex-col gap-4 p-5`}>
        <div>
          <p className="mb-2 text-sm font-semibold text-[#2B1A12]">Date</p>
          <AvailabilityCalendar
            selected={form.date || null}
            blocked={blocked}
            booked={booked}
            onSelect={(iso) => set('date', iso)}
          />
        </div>

        <label className={labelClass}>
          Time
          <input
            required
            value={form.time}
            onChange={(e) => set('time', e.target.value)}
            placeholder="2PM - 6PM"
            className={inputClass}
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-semibold text-[#2B1A12]">Event type</p>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => set('eventType', t)}
                aria-pressed={form.eventType === t}
                className={`h-10 rounded-full border px-5 text-sm font-semibold transition duration-200 active:scale-95 ${
                  form.eventType === t
                    ? 'border-[#3B2316] bg-[#3B2316] text-[#F6E9D8] shadow-sm'
                    : 'border-[#E2D3C2] bg-white text-[#2B1A12] hover:border-[#B8742F]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-[#2B1A12]">Event location</p>
          <LocationPicker
            value={place}
            onChange={(v) => setPlace({ address: v.address, lat: v.lat, lng: v.lng })}
            placeholder="Search the event address"
          />
        </div>

        <label className={labelClass}>
          Notes
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Number of guests, drinks you want"
            className={textareaClass}
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting && <Spinner />}
          {submitting ? 'Sending...' : 'Send booking request'}
        </button>
      </form>
    </AppShell>
  )
}