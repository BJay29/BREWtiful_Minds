import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import RequestCard from '../../components/RequestCard'
import Tabs from '../../components/Tabs'
import { baristaNav } from '../../lib/nav'

const TABS = ['New', 'Accepted', 'Declined']
const STATUS = { New: 'pending', Accepted: 'accepted', Declined: 'declined' }

export default function Requests() {
  const { userId, bookings, setBookingStatus } = useStore()
  const [tab, setTab] = useState('New')

  const list = bookings.filter((k) => k.baristaId === userId && k.status === STATUS[tab])

  return (
    <AppShell items={baristaNav}>
      <PageHeader title="Booking requests" subtitle="Review and respond to customer requests." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <div key={tab} className="grid gap-4 md:grid-cols-2">
        {list.length === 0 && (
          <EmptyState icon={Inbox} title="Nothing here yet" text="Requests in this tab will appear here." />
        )}
        {list.map((k, i) => (
          <RequestCard
            key={k.id}
            index={i}
            booking={k}
            onAccept={tab === 'New' ? (id) => setBookingStatus(id, 'accepted') : undefined}
            onDecline={tab === 'New' ? (id) => setBookingStatus(id, 'declined') : undefined}
          />
        ))}
      </div>
    </AppShell>
  )
}