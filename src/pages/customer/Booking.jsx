import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import BaristaAvatar from '../../components/BaristaAvatar'
import EmptyState from '../../components/EmptyState'
import LocationPicker from '../../components/LocationPicker'
import PageHeader from '../../components/PageHeader'
import RatingPill from '../../components/RatingPill'
import Spinner from '../../components/Spinner'
import { customerNav } from '../../lib/nav'
import { todayISO } from '../../lib/format'
import { btnPrimary, card, inputClass, labelClass, textareaClass } from '../../lib/ui'

const EVENT_TYPES = ['Birthday', 'Wedding', 'Office', 'Other']

export default function Booking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getBarista, createBooking } = useStore()
  const barista = getBarista(id)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [place, setPlace] = useState({ address: '', lat: null, lng: null })
  const [form, setForm] = useState({
    date: '',
    time: '',
    eventType: 'Birthday',
    notes: '',
  })

  if (!barista) {
    return (
      <AppShell items={customerNav}>
        <EmptyState title="Barista not found" to="/customer" actionLabel="Back to home" />
      </AppShell>
    )
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

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

      <form onSubmit={handleSubmit} className={`${card} flex flex-col gap-4 p-5`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Date
            <input
              type="date"
              required
              min={todayISO()}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className={inputClass}
            />
          </label>
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
        </div>

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