import { useState } from 'react'
import { Coffee, Navigation, Search, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import BaristaCard from '../../components/BaristaCard'
import EmptyState from '../../components/EmptyState'
import LatteArt from '../../components/LatteArt'
import Spinner from '../../components/Spinner'
import Tabs from '../../components/Tabs'
import { customerNav } from '../../lib/nav'
import { greeting } from '../../lib/format'
import { getCurrentPosition, haversineKm } from '../../lib/geo'
import { sectionTitle } from '../../lib/ui'

const FILTERS = ['All', 'Latte art', 'Espresso', 'Cold brew', 'Manual brew', 'Pour over']

function byRating(a, b) {
  return (b.rating ?? 0) - (a.rating ?? 0)
}

function byDistance(a, b) {
  if (a.distanceKm === null && b.distanceKm === null) return 0
  if (a.distanceKm === null) return 1
  if (b.distanceKm === null) return -1
  return a.distanceKm - b.distanceKm
}

export default function Home() {
  const { profile } = useAuth()
  const { baristas, favorites, toggleFavorite } = useStore()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('top')
  const [pos, setPos] = useState(null)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState('')

  async function chooseNearest() {
    setGeoError('')
    if (!pos) {
      setLocating(true)
      try {
        setPos(await getCurrentPosition())
      } catch (err) {
        setGeoError(err.message)
        setLocating(false)
        return
      }
      setLocating(false)
    }
    setSort('nearest')
  }

  const q = query.trim().toLowerCase()
  const results = baristas
    .map((b) => ({
      ...b,
      distanceKm:
        pos && b.latitude != null
          ? haversineKm(pos, { lat: b.latitude, lng: b.longitude })
          : null,
    }))
    .filter((b) => {
      const text = [b.name, b.cafe, b.city, ...b.drinks, ...b.skills].join(' ').toLowerCase()
      return (!q || text.includes(q)) && (filter === 'All' || b.skills.includes(filter))
    })
    .sort(sort === 'nearest' ? byDistance : byRating)

  const noneLocated = sort === 'nearest' && results.length > 0 && results.every((b) => b.distanceKm === null)

  const sortBtn = (active) =>
    `flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition duration-200 active:scale-95 ${
      active
        ? 'border-[#3B2316] bg-[#3B2316] text-[#F6E9D8] shadow-sm'
        : 'border-[#E2D3C2] bg-white text-[#2B1A12] hover:border-[#B8742F]'
    }`

  return (
    <AppShell items={customerNav}>
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_85%_20%,#5A3622,#2B1A12_70%)] px-5 py-7 text-[#F6E9D8] md:px-10 md:py-10">
        <LatteArt className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 opacity-25 md:right-12 md:top-6 md:h-64 md:w-64 md:opacity-90" />
        <div className="relative">
          <p className="text-sm text-[#D9BFA3]">
            {greeting()}
            {profile?.full_name ? `, ${profile.full_name}` : ''}
          </p>
          <h1 className="mt-1 max-w-md font-display text-3xl font-bold leading-tight md:text-4xl">
            Who's your barista today?
          </h1>
          <div className="mt-5 flex h-12 items-center gap-2 rounded-2xl bg-white px-3.5 text-[#2B1A12] shadow-lg transition focus-within:ring-4 focus-within:ring-[#B8742F]/30 md:max-w-lg">
            <Search className="h-5 w-5 shrink-0 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search barista, drink or cafe"
              className="h-full flex-1 bg-transparent text-base outline-none placeholder:text-stone-400"
            />
          </div>
        </div>
      </section>

      <Tabs tabs={FILTERS} value={filter} onChange={setFilter} />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className={sectionTitle}>{sort === 'nearest' ? 'Nearest baristas' : 'Top baristas'}</h2>
        <div className="flex gap-2">
          <button onClick={() => setSort('top')} aria-pressed={sort === 'top'} className={sortBtn(sort === 'top')}>
            <Star className="h-4 w-4" />
            Top rated
          </button>
          <button
            onClick={chooseNearest}
            disabled={locating}
            aria-pressed={sort === 'nearest'}
            className={sortBtn(sort === 'nearest')}
          >
            {locating ? <Spinner className="h-4 w-4" /> : <Navigation className="h-4 w-4" />}
            Nearest
          </button>
        </div>
      </div>

      {geoError && (
        <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {geoError}
        </p>
      )}
      {noneLocated && (
        <p className="mb-3 rounded-xl bg-[#F6E6D2]/70 p-3 text-sm text-[#4A2B18]">
          No baristas have set their location yet, so distances are not available.
        </p>
      )}

      {baristas.length === 0 ? (
        <EmptyState
          icon={Coffee}
          title="No baristas yet"
          text="Baristas will appear here once they complete their profile."
        />
      ) : results.length === 0 ? (
        <EmptyState icon={Search} title="No matches" text="Try a different search or filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((b, i) => (
            <BaristaCard
              key={b.id}
              index={i}
              barista={b}
              distanceKm={b.distanceKm}
              isFavorite={favorites.includes(b.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </AppShell>
  )
}