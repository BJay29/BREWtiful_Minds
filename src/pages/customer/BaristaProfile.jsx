import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  MessageSquareText,
  Navigation,
  X,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import BaristaAvatar from '../../components/BaristaAvatar'
import EmptyState from '../../components/EmptyState'
import LatteArt from '../../components/LatteArt'
import MapView from '../../components/MapView'
import RateAvailability from '../../components/RateAvailability'
import RatingPill from '../../components/RatingPill'
import { customerNav } from '../../lib/nav'
import { formatDate } from '../../lib/format'
import { directionsLink } from '../../lib/geo'
import { btnOutline, btnPrimary, card, sectionTitle } from '../../lib/ui'

export default function BaristaProfile() {
  const { id } = useParams()
  const { getBarista, reviews, favorites, toggleFavorite } = useStore()
  const barista = getBarista(id)
  const [viewer, setViewer] = useState(null)

  const photos = barista?.portfolio ?? []

  useEffect(() => {
    if (viewer === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setViewer(null)
      if (e.key === 'ArrowRight') setViewer((v) => (v + 1) % photos.length)
      if (e.key === 'ArrowLeft') setViewer((v) => (v - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewer, photos.length])

  if (!barista) {
    return (
      <AppShell items={customerNav}>
        <EmptyState
          title="Barista not found"
          text="This profile may have been removed."
          to="/customer"
          actionLabel="Back to home"
        />
      </AppShell>
    )
  }

  const list = reviews.filter((r) => r.baristaId === id)
  const isFav = favorites.includes(id)
  const where = [barista.cafe, barista.city].filter(Boolean).join(', ')
  const hasPin = barista.latitude != null && barista.longitude != null
  const meta = [
    barista.years ? `${barista.years} years experience` : null,
    `${barista.reviewCount} ${barista.reviewCount === 1 ? 'review' : 'reviews'}`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <AppShell items={customerNav}>
      <div className="grid gap-6 md:grid-cols-[330px_1fr] md:items-start">
        <aside className="md:sticky md:top-24">
          <div className={`${card} overflow-hidden`}>
            <div className="relative h-32 bg-[radial-gradient(circle_at_80%_40%,#5A3622,#2B1A12_75%)]">
              <Link
                to="/customer"
                aria-label="Back"
                className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 transition hover:scale-110 active:scale-95"
              >
                <ArrowLeft className="h-5 w-5 text-[#2B1A12]" />
              </Link>
              <LatteArt className="absolute right-6 top-6 h-24 w-24" />
              <BaristaAvatar
                src={barista.avatarUrl}
                color={barista.color}
                className="absolute -bottom-10 left-5 h-20 w-20 rounded-full border-4 border-white bg-white shadow-md"
              />
            </div>

            <div className="px-5 pb-5 pt-12">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="font-display text-2xl font-bold leading-tight text-[#2B1A12]">
                    {barista.name}
                  </h1>
                  <p className="mt-0.5 text-xs text-stone-500">{meta}</p>
                </div>
                <RatingPill value={barista.rating} />
              </div>

              {(where || barista.schedule) && (
                <div className="mt-4 rounded-2xl bg-[#3B2316] p-4 text-sm text-[#F6E9D8]">
                  <p className="mb-2 text-[11px] font-semibold tracking-wide text-[#D9BFA3]">
                    WHERE TO FIND ME
                  </p>
                  {where && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-[#E9B77E]" />
                      {where}
                    </p>
                  )}
                  {barista.schedule && (
                    <p className="mt-1.5 flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-[#E9B77E]" />
                      {barista.schedule}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-2.5">
                <button
                  onClick={() => toggleFavorite(id)}
                  aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
                  className={`${btnOutline} w-12 shrink-0 px-0`}
                >
                  <Heart className="h-5 w-5" fill={isFav ? '#3B2316' : 'none'} />
                </button>
                {barista.openForEvents ? (
                  <Link to={`/customer/book/${id}`} className={`${btnPrimary} flex-1`}>
                    <CalendarCheck className="h-5 w-5" />
                    Book for event
                  </Link>
                ) : (
                  <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-stone-200 text-sm font-semibold text-stone-600">
                    Not open for events
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          {barista.bio && (
            <section className={`${card} animate-fade-up p-5`}>
              <h2 className={`${sectionTitle} mb-2`}>About</h2>
              <p className="text-sm leading-relaxed text-stone-700">{barista.bio}</p>
            </section>
          )}

          <RateAvailability baristaId={id} />

          {hasPin && (
            <section className={`${card} animate-fade-up p-5`} style={{ animationDelay: '40ms' }}>
              <h2 className={`${sectionTitle} mb-1`}>Location</h2>
              {barista.address && (
                <p className="mb-3 text-sm text-stone-600">{barista.address}</p>
              )}
              <MapView lat={barista.latitude} lng={barista.longitude} className="h-56" />
              <a
                href={directionsLink(barista.latitude, barista.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnOutline} mt-3 h-11 w-full`}
              >
                <Navigation className="h-4 w-4" />
                Get directions
              </a>
            </section>
          )}

          {barista.drinks.length > 0 && (
            <section className={`${card} animate-fade-up p-5`} style={{ animationDelay: '80ms' }}>
              <h2 className={`${sectionTitle} mb-3`}>Signature drinks</h2>
              <div className="grid grid-cols-3 gap-3">
                {barista.drinks.slice(0, 3).map((d) => (
                  <div
                    key={d}
                    className="rounded-2xl border border-[#EADCCB] bg-[#FBF6EF] px-2 py-3 text-center text-xs font-semibold text-[#2B1A12] transition duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <LatteArt className="mx-auto mb-2 h-12 w-12" />
                    {d}
                  </div>
                ))}
              </div>
            </section>
          )}

          {barista.skills.length > 0 && (
            <section className={`${card} animate-fade-up p-5`} style={{ animationDelay: '120ms' }}>
              <h2 className={`${sectionTitle} mb-3`}>Skills</h2>
              <div className="flex flex-wrap gap-2">
                {barista.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-[#F6E6D2] px-3.5 py-1.5 text-xs font-semibold text-[#6B3F24]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {photos.length > 0 && (
            <section className={`${card} animate-fade-up p-5`} style={{ animationDelay: '180ms' }}>
              <h2 className={`${sectionTitle} mb-3`}>Portfolio</h2>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setViewer(i)}
                    aria-label={`View photo ${i + 1}`}
                    className="aspect-square overflow-hidden rounded-2xl bg-stone-200"
                  >
                    <img
                      src={url}
                      alt="Portfolio"
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="animate-fade-up" style={{ animationDelay: '240ms' }}>
            <h2 className={`${sectionTitle} mb-3`}>Reviews</h2>
            {list.length === 0 ? (
              <EmptyState
                icon={MessageSquareText}
                title="No reviews yet"
                text="Reviews appear after a completed booking."
              />
            ) : (
              <div className="grid gap-3">
                {list.map((r) => (
                  <div key={r.id} className={`${card} p-4 text-sm`}>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#2B1A12]">{r.customerName || 'Customer'}</p>
                      <span className="text-xs font-bold text-[#B8742F]">★ {r.rating}</span>
                    </div>
                    <p className="text-xs text-stone-500">{formatDate(r.date)}</p>
                    {r.text && <p className="mt-2 text-stone-700">{r.text}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {viewer !== null && photos[viewer] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio photo"
          onClick={() => setViewer(null)}
          className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/85 p-4"
        >
          <button
            onClick={() => setViewer(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X className="h-6 w-6" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setViewer((viewer - 1 + photos.length) % photos.length)
                }}
                aria-label="Previous photo"
                className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setViewer((viewer + 1) % photos.length)
                }}
                aria-label="Next photo"
                className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img
            src={photos[viewer]}
            alt="Portfolio"
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </AppShell>
  )
}