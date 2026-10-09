import { Link } from 'react-router-dom'
import { Award, CalendarCheck, CalendarDays, Inbox, MapPin, Navigation, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import BaristaAvatar from '../../components/BaristaAvatar'
import EmptyState from '../../components/EmptyState'
import RequestCard from '../../components/RequestCard'
import StatusPill from '../../components/StatusPill'
import { baristaNav } from '../../lib/nav'
import { formatDate, greeting, todayISO } from '../../lib/format'
import { mapsLink } from '../../lib/geo'
import { btnPrimary, card, sectionTitle } from '../../lib/ui'

export default function Dashboard() {
  const { profile } = useAuth()
  const { userId, myBarista, bookings, setBookingStatus } = useStore()

  const mine = bookings.filter((k) => k.baristaId === userId)
  const requests = mine.filter((k) => k.status === 'pending')
  const upcoming = mine.filter((k) => k.status === 'accepted' && k.date >= todayISO())

  const stats = [
    { icon: Star, value: myBarista?.rating ? myBarista.rating.toFixed(1) : '—', label: 'Rating' },
    { icon: Award, value: String(myBarista?.points ?? 0), label: 'Points' },
    { icon: CalendarCheck, value: String(upcoming.length), label: 'Upcoming' },
  ]

  return (
    <AppShell items={baristaNav}>
      <section className="rounded-3xl bg-[radial-gradient(circle_at_85%_30%,#5A3622,#2B1A12_75%)] px-5 pb-14 pt-6 text-[#F6E9D8] md:px-8 md:pt-8">
        <div className="flex items-center gap-4">
          <BaristaAvatar
            src={myBarista?.avatarUrl}
            color={myBarista?.color}
            className="h-14 w-14 shrink-0 rounded-full border-2 border-white/30 bg-white/10"
          />
          <div>
            <p className="text-sm text-[#D9BFA3]">{greeting()}</p>
            <h1 className="font-display text-2xl font-bold md:text-3xl">{profile?.full_name}</h1>
          </div>
        </div>
      </section>

      <div className="relative -mt-9 mb-6 grid grid-cols-3 gap-3 px-3 md:gap-4 md:px-8">
        {stats.map(({ icon: Icon, value, label }, i) => (
          <div
            key={label}
            style={{ animationDelay: `${i * 80}ms` }}
            className={`${card} animate-fade-up py-3.5 text-center transition duration-300 hover:-translate-y-1 hover:shadow-md md:py-5`}
          >
            <Icon className="mx-auto mb-1 h-4 w-4 text-[#B8742F] md:h-5 md:w-5" />
            <p className="font-display text-xl font-bold text-[#2B1A12] md:text-3xl">{value}</p>
            <p className="text-[11px] text-stone-500 md:text-xs">{label}</p>
          </div>
        ))}
      </div>

      {!myBarista && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl bg-[#F6E6D2]/70 p-5 text-sm text-[#4A2B18] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">Complete your profile so customers can find you.</p>
          <Link to="/barista/profile/edit" className={`${btnPrimary} h-11 shrink-0`}>
            Complete profile
          </Link>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className={sectionTitle}>New booking requests</h2>
            <Link to="/barista/requests" className="text-xs font-semibold text-[#8A4F1E] hover:underline">
              See all
            </Link>
          </div>
          {requests.length === 0 ? (
            <EmptyState icon={Inbox} title="No new requests" text="New requests will appear here." />
          ) : (
            <div className="grid gap-3">
              {requests.slice(0, 3).map((k, i) => (
                <RequestCard
                  key={k.id}
                  index={i}
                  booking={k}
                  onAccept={(id) => setBookingStatus(id, 'accepted')}
                  onDecline={(id) => setBookingStatus(id, 'declined')}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className={`${sectionTitle} mb-3`}>Upcoming gigs</h2>
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No upcoming gigs" text="Accepted bookings show up here." />
          ) : (
            <div className="grid gap-3">
              {upcoming.map((k, i) => (
                <div
                  key={k.id}
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                  className={`${card} animate-fade-up p-4 text-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-[#2B1A12]">
                      {k.eventType} · {formatDate(k.date)}
                    </p>
                    <StatusPill status="accepted" />
                  </div>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {[k.time, k.customerName].filter(Boolean).join(' · ')}
                  </p>
                  {k.location && (
                    <p className="mt-1 flex items-start gap-1 text-xs text-stone-500">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-2">{k.location}</span>
                    </p>
                  )}
                  {k.latitude != null && k.longitude != null && (
                    <a
                      href={mapsLink(k.latitude, k.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#8A4F1E] hover:underline"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Open in Maps
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}