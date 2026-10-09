import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import PaymentReview from '../../components/PaymentReview'
import RequestCard from '../../components/RequestCard'
import StatusPill from '../../components/StatusPill'
import Tabs from '../../components/Tabs'
import { baristaNav } from '../../lib/nav'
import { formatDate, todayISO } from '../../lib/format'
import { btnOutline, btnPrimary } from '../../lib/ui'

const TABS = ['New', 'Accepted', 'Completed', 'Closed']
const STATUS_BY_TAB = {
  New: ['pending'],
  Accepted: ['accepted'],
  Completed: ['completed'],
  Closed: ['declined', 'cancelled'],
}

export default function Requests() {
  const { userId, bookings, setBookingStatus } = useStore()
  const [tab, setTab] = useState('New')
  const today = todayISO()

  let list = bookings.filter(
    (k) => k.baristaId === userId && STATUS_BY_TAB[tab].includes(k.status)
  )
  if (tab === 'Completed' || tab === 'Closed') list = [...list].reverse()

  function cancel(id) {
    if (window.confirm('Cancel this booking? The customer will see that you cancelled it.')) {
      setBookingStatus(id, 'cancelled')
    }
  }

  function complete(id) {
    if (window.confirm('Mark this booking as completed?')) {
      setBookingStatus(id, 'completed')
    }
  }

  return (
    <AppShell items={baristaNav}>
      <PageHeader title="Booking requests" subtitle="Review and respond to customer requests." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <div key={tab} className="grid gap-4 md:grid-cols-2">
        {list.length === 0 && (
          <EmptyState icon={Inbox} title="Nothing here yet" text="Requests in this tab will appear here." />
        )}
        {list.map((k, i) => {
          const canComplete = k.date <= today
          return (
            <RequestCard
              key={k.id}
              index={i}
              booking={k}
              onAccept={tab === 'New' ? (id) => setBookingStatus(id, 'accepted') : undefined}
              onDecline={tab === 'New' ? (id) => setBookingStatus(id, 'declined') : undefined}
            >
              {tab === 'Accepted' && (
                <>
                  <PaymentReview booking={k} />
                  <div className="mt-3 flex gap-2">
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

              {tab === 'Completed' && <PaymentReview booking={k} />}

              {tab === 'Closed' && (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#FBF6EF] p-3 text-xs text-stone-600">
                  <span>
                    {k.status === 'declined'
                      ? 'You declined this request'
                      : k.cancelledBy === userId
                        ? 'You cancelled this booking'
                        : 'The customer cancelled this booking'}
                  </span>
                  <StatusPill status={k.status} />
                </div>
              )}
            </RequestCard>
          )
        })}
      </div>
    </AppShell>
  )
}