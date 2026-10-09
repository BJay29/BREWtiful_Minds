import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import BaristaAvatar from '../../components/BaristaAvatar'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'
import { customerNav } from '../../lib/nav'
import { formatDate } from '../../lib/format'
import { btnPrimary, card, labelClass, textareaClass } from '../../lib/ui'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

export default function Review() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { loading, bookings, getBarista, hasReview, addReview } = useStore()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <AppShell items={customerNav} />

  const booking = bookings.find((k) => k.id === bookingId)
  if (!booking || booking.status !== 'completed' || hasReview(bookingId)) {
    return <Navigate to="/customer/bookings" replace />
  }
  const barista = getBarista(booking.baristaId)
  const shown = hover || rating

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) {
      setError('Please choose a star rating.')
      return
    }
    setError('')
    setSubmitting(true)
    const ok = await addReview({ bookingId, rating, text })
    setSubmitting(false)
    if (ok) navigate('/customer/bookings')
  }

  return (
    <AppShell items={customerNav}>
      <PageHeader
        title="Rate your barista"
        subtitle="Your review helps other customers."
        back="/customer/bookings"
      />

      <form onSubmit={handleSubmit} className={`${card} flex flex-col gap-5 p-5`}>
        <div className="flex items-center gap-3 rounded-2xl bg-[#FBF6EF] p-3">
          <BaristaAvatar
            src={barista?.avatarUrl}
            color={barista?.color}
            className="h-14 w-14 shrink-0"
          />
          <div>
            <p className="font-bold text-[#2B1A12]">{barista?.name ?? 'Barista'}</p>
            <p className="text-xs text-stone-500">
              {booking.eventType} · {formatDate(booking.date)}
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="flex justify-center gap-1.5" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                className="flex h-12 w-12 items-center justify-center rounded-xl transition duration-150 hover:scale-110 active:scale-90"
              >
                <Star
                  className="h-8 w-8 text-[#B8742F] transition duration-150"
                  fill={n <= shown ? '#B8742F' : 'none'}
                />
              </button>
            ))}
          </div>
          <p className="mt-1 h-5 text-sm font-semibold text-[#8A4F1E]">{LABELS[shown]}</p>
        </div>

        <label className={labelClass}>
          Your review
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How was the drink and service?"
            className={textareaClass}
          />
        </label>

        <p className="text-xs text-stone-500">
          Only customers with a completed booking can leave a review, so every review is verified.
        </p>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}

        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting && <Spinner />}
          {submitting ? 'Submitting...' : 'Submit review'}
        </button>
      </form>
    </AppShell>
  )
}