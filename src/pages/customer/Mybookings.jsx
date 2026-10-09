import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import BaristaAvatar from '../../components/BaristaAvatar'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import StatusPill from '../../components/StatusPill'
import Tabs from '../../components/Tabs'
import { customerNav } from '../../lib/nav'
import { formatDate } from '../../lib/format'
import { btnOutline, btnPrimary, card } from '../../lib/ui'

const TABS = ['Pending', 'Accepted', 'Completed', 'Closed']
const STATUS_BY_TAB = {
  Pending: ['pending'],
  Accepted: ['accepted'],
  Completed: ['completed'],
  Closed: ['declined', 'cancelled'],
}

export default function MyBookings() {
  const { userId, bookings, getBarista, hasReview, setBookingStatus } = useStore()
  const [tab, setTab] = useState('Pending')

  const list = bookings.filter(
    (k) => k.customerId === userId && STATUS_BY_TAB[tab].includes(k.status)
  )

  return (
    <AppShell items={customerNav}>
      <PageHeader title="My bookings" subtitle="Track and manage your requests." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <div key={tab} className="grid gap-4 md:grid-cols-2">
        {list.length === 0 && (
          <EmptyState
            icon={CalendarDays}
            title="Nothing here yet"
            text="Book a barista and your requests will show up here."
            to="/customer"
            actionLabel="Find a barista"
          />
        )}
        {list.map((k, i) => {
          const barista = getBarista(k.baristaId)
          return (
            <div
              key={k.id}
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              className={`${card} animate-fade-up p-4 text-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <BaristaAvatar
                  src={barista?.avatarUrl}
                  color={barista?.color}
                  className="h-12 w-12 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/customer/barista/${k.baristaId}`}
                    className="font-bold text-[#2B1A12] hover:underline"
                  >
                    {barista?.name ?? 'Barista'}
                  </Link>
                  <p className="text-xs text-stone-500">
                    {k.eventType} · {formatDate(k.date)}
                    {k.time ? `, ${k.time}` : ''}
                  </p>
                  {k.location && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {k.location}
                    </p>
                  )}
                </div>
                <StatusPill status={k.status} />
              </div>

              {k.status === 'pending' && (
                <button
                  onClick={() => setBookingStatus(k.id, 'cancelled')}
                  className={`${btnOutline} mt-4 h-11 w-full`}
                >
                  Cancel booking
                </button>
              )}

              {k.status === 'accepted' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setBookingStatus(k.id, 'cancelled')}
                    className={`${btnOutline} h-11 flex-1`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setBookingStatus(k.id, 'completed')}
                    className={`${btnPrimary} h-11 flex-1`}
                  >
                    Mark as completed
                  </button>
                </div>
              )}

              {k.status === 'completed' &&
                (hasReview(k.id) ? (
                  <p className="mt-4 rounded-xl bg-[#FBF6EF] py-2.5 text-center text-xs font-semibold text-stone-500">
                    You reviewed this booking
                  </p>
                ) : (
                  <Link to={`/customer/review/${k.id}`} className={`${btnPrimary} mt-4 h-11 w-full`}>
                    Rate this barista
                  </Link>
                ))}
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}