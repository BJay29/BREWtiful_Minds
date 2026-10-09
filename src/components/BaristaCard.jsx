import { Link } from 'react-router-dom'
import { ChevronRight, Heart, MapPin } from 'lucide-react'
import { formatDistance } from '../lib/geo'
import LatteArt from './LatteArt'
import BaristaAvatar from './BaristaAvatar'
import RatingPill from './RatingPill'

export default function BaristaCard({
  barista,
  isFavorite,
  onToggleFavorite,
  distanceKm = null,
  index = 0,
}) {
  const where = [barista.cafe, barista.city].filter(Boolean).join(' · ')

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="group relative animate-fade-up overflow-hidden rounded-2xl border border-[#EADCCB] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <Link to={`/customer/barista/${barista.id}`} className="block">
        <div className="relative flex h-28 items-center justify-end overflow-hidden bg-gradient-to-br from-[#5A3622] to-[#2B1A12] pr-5">
          <LatteArt className="h-20 w-20 transition duration-500 group-hover:rotate-12 group-hover:scale-110" />
          <BaristaAvatar
            src={barista.avatarUrl}
            color={barista.color}
            className="absolute -bottom-6 left-4 h-14 w-14 rounded-full border-[3px] border-white bg-white shadow-md"
          />
        </div>
        <div className="px-4 pb-4 pt-8">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-[#2B1A12]">{barista.name}</p>
              {where && <p className="mt-0.5 truncate text-xs text-stone-500">{where}</p>}
              {distanceKm !== null && (
                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#8A4F1E]">
                  <MapPin className="h-3.5 w-3.5" />
                  {formatDistance(distanceKm)} away
                </p>
              )}
            </div>
            <RatingPill value={barista.rating} />
          </div>

          {barista.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {barista.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-[#F6E6D2] px-2.5 py-0.5 text-[11px] font-semibold text-[#6B3F24]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="truncate text-stone-500">
              {barista.drinks[0] ? `Signature: ${barista.drinks[0]}` : 'New barista'}
            </span>
            <span className="flex items-center font-semibold text-[#8A4F1E] transition group-hover:translate-x-0.5">
              View <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>

      {onToggleFavorite && (
        <button
          onClick={() => onToggleFavorite(barista.id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition duration-200 hover:scale-110 active:scale-75"
        >
          <Heart className="h-5 w-5 text-[#B8742F]" fill={isFavorite ? '#B8742F' : 'none'} />
        </button>
      )}
    </div>
  )
}