import { Check, MapPin, Navigation, X } from 'lucide-react'
import { formatDate } from '../lib/format'
import { mapsLink } from '../lib/geo'

export default function RequestCard({ booking, onAccept, onDecline, index = 0 }) {
  const initial = (booking.customerName || 'C').charAt(0).toUpperCase()
  const hasPin = booking.latitude != null && booking.longitude != null

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="animate-fade-up rounded-2xl border border-[#EADCCB] bg-white p-4 text-sm shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F6E6D2] font-display text-lg font-bold text-[#6B3F24]">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#2B1A12]">
            {booking.eventType || 'Event'} · {formatDate(booking.date)}
          </p>
          <p className="truncate text-xs text-stone-500">
            {booking.customerName || 'Customer'}
            {booking.time ? ` · ${booking.time}` : ''}
          </p>
          {booking.location && (
            <p className="mt-0.5 flex items-start gap-1 text-xs text-stone-500">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-2">{booking.location}</span>
            </p>
          )}
          {hasPin && (
            <a
              href={mapsLink(booking.latitude, booking.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#8A4F1E] hover:underline"
            >
              <Navigation className="h-3.5 w-3.5" />
              Open in Maps
            </a>
          )}
        </div>
      </div>

      {booking.notes && (
        <p className="mt-3 rounded-xl bg-[#F6E6D2]/70 p-3 text-xs text-[#4A2B18]">{booking.notes}</p>
      )}

      {onAccept && onDecline && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onAccept(booking.id)}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#3B2316] text-sm font-bold text-[#F6E9D8] transition duration-200 hover:bg-[#2B1A12] active:scale-[0.97]"
          >
            <Check className="h-4 w-4" /> Accept
          </button>
          <button
            onClick={() => onDecline(booking.id)}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#3B2316] bg-white text-sm font-bold text-[#3B2316] transition duration-200 hover:bg-[#F6E6D2] active:scale-[0.97]"
          >
            <X className="h-4 w-4" /> Decline
          </button>
        </div>
      )}
    </div>
  )
}