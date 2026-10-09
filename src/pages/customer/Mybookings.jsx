import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import BaristaAvatar from '../../components/BaristaAvatar'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import PaymentSection from '../../components/PaymentSection'
import StatusPill from '../../components/StatusPill'
import Tabs from '../../components/Tabs'
import { customerNav } from '../../lib/nav'
import { formatDate, todayISO } from '../../lib/format'
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
  const today = todayISO()

  let list = bookings.filter(
    (k) => k.customerId === userId && STATUS_BY_TAB[tab].includes(k.status)
  )
  if (tab === 'Completed' || tab === 'Closed') list = [...list].reverse()

  function cancel(id) {
    if (window.confirm('Cancel this booking? This cannot be undone.')) {
      setBookingStatus(id, 'cancelled')
    }
  }

  function complete(id) {
    if (window.confirm('Mark this booking as completed?')) {
      setBookingStatus(id, 'completed')
    }
  }

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
          const canComplete = k.date <= today
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

              {k.status === 'cancelled' && (
                <p className="mt-3 rounded-xl bg-[#FBF6EF] py-2 text-center text-xs font-semibold text-stone-500">
                  {k.cancelledBy === userId
                    ? 'You cancelled this booking'
                    : k.cancelledBy
                      ? 'The barista cancelled this booking'
                      : 'This booking was cancelled'}
                </p>
              )}

              {k.status === 'declined' && (
                <p className="mt-3 rounded-xl bg-[#FBF6EF] py-2 text-center text-xs font-semibold text-stone-500">
                  The barista declined this request
                </p>
              )}

              {k.status === 'pending' && (
                <button onClick={() => cancel(k.id)} className={`${btnOutline} mt-4 h-11 w-full`}>
                  Cancel booking
                </button>
              )}

              {k.status === 'accepted' && (
                <>
                  <PaymentSection booking={k} />
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => cancel(k.id)} className={`${btnOutline} h-11 flex-1`}>
                      Cancel
                    </button>
                    <button
                      onClick={() => complete(k.id)}
                      disabled={!canComplete}
                      className={`${btnPrimary} h-11 flex-1 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Mark as completed
                    </button>
                  </div>
                  {!canComplete && (
                    <p className="mt-2 text-center text-xs text-stone-500">
                      You can mark this as completed on or after {formatDate(k.date)}.
                    </p>
                  )}
                </>
              )}

              {k.status === 'completed' && (
                <>
                  <PaymentSection booking={k} />
                  {hasReview(k.id) ? (
                    <p className="mt-4 rounded-xl bg-[#FBF6EF] py-2.5 text-center text-xs font-semibold text-stone-500">
                      You reviewed this booking
                    </p>
                  ) : (
                    <Link
                      to={`/customer/review/${k.id}`}
                      className={`${btnPrimary} mt-4 h-11 w-full`}
                    >
                      Rate this barista
                    </Link>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}