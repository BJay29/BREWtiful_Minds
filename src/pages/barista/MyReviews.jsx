import { Award, MessageSquareText, Star } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { baristaNav } from '../../lib/nav'
import { formatDate } from '../../lib/format'
import { card } from '../../lib/ui'

export default function MyReviews() {
  const { userId, myBarista, reviews } = useStore()
  const list = reviews.filter((r) => r.baristaId === userId)

  const summary = [
    { icon: Star, value: myBarista?.rating ? myBarista.rating.toFixed(1) : '—', label: 'Average rating' },
    { icon: Award, value: String(myBarista?.points ?? 0), label: 'Points' },
    { icon: MessageSquareText, value: String(myBarista?.reviewCount ?? 0), label: 'Reviews' },
  ]

  return (
    <AppShell items={baristaNav}>
      <PageHeader title="Reviews & points" subtitle="See what customers say about you." />

      <div className="grid grid-cols-3 gap-3 rounded-3xl bg-[#1F6B42] p-4 text-center text-white md:p-6">
        {summary.map(({ icon: Icon, value, label }) => (
          <div key={label}>
            <Icon className="mx-auto mb-1 h-5 w-5 text-white/80" />
            <p className="font-display text-2xl font-bold md:text-4xl">{value}</p>
            <p className="text-xs text-white/80">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone-500">
        Higher ratings and points move you higher in customer search results.
      </p>

      <h2 className="mb-3 mt-6 font-display text-lg font-semibold text-[#2B1A12]">Latest reviews</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {list.length === 0 && (
          <EmptyState icon={MessageSquareText} title="No reviews yet" text="Reviews appear after completed bookings." />
        )}
        {list.map((r, i) => (
          <div
            key={r.id}
            style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            className={`${card} animate-fade-up p-4 text-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#2B1A12]">{r.customerName || 'Customer'}</p>
              <span className="text-xs font-bold text-[#B8742F]">★ {r.rating}</span>
            </div>
            <p className="text-xs text-stone-500">{formatDate(r.date)}</p>
            {r.text && <p className="mt-2 text-stone-700">"{r.text}"</p>}
          </div>
        ))}
      </div>
    </AppShell>
  )
}