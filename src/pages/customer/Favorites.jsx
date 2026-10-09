import { Link } from 'react-router-dom'
import { Heart, MapPin } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import BaristaAvatar from '../../components/BaristaAvatar'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import RatingPill from '../../components/RatingPill'
import { customerNav } from '../../lib/nav'
import { card } from '../../lib/ui'

export default function Favorites() {
  const { baristas, favorites, toggleFavorite } = useStore()
  const list = baristas.filter((b) => favorites.includes(b.id))

  return (
    <AppShell items={customerNav}>
      <PageHeader
        title="Favorite baristas"
        subtitle="See where your favorite barista is working today."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.length === 0 && (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            text="Tap the heart on a barista to save them here."
            to="/customer"
            actionLabel="Browse baristas"
          />
        )}
        {list.map((b, i) => {
          const where = [b.cafe, b.schedule].filter(Boolean).join(' · ')
          return (
            <div
              key={b.id}
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              className={`${card} animate-fade-up p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <BaristaAvatar src={b.avatarUrl} color={b.color} className="h-14 w-14 shrink-0" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/customer/barista/${b.id}`}
                    className="font-bold text-[#2B1A12] hover:underline"
                  >
                    {b.name}
                  </Link>
                  {b.drinks[0] && (
                    <p className="truncate text-xs text-stone-500">Signature: {b.drinks[0]}</p>
                  )}
                </div>
                <RatingPill value={b.rating} />
              </div>

              {where && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#E8F1EC] px-3 py-2 text-xs font-semibold text-[#1F6B42]">
                  <MapPin className="h-4 w-4 shrink-0" />
                  Now at {where}
                </p>
              )}

              <button
                onClick={() => toggleFavorite(b.id)}
                className="mt-3 flex h-10 items-center gap-1.5 text-xs font-semibold text-stone-500 transition hover:text-[#8A2A1E]"
              >
                <Heart className="h-4 w-4" /> Remove
              </button>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}