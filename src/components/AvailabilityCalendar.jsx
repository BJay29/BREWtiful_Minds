import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const pad = (n) => String(n).padStart(2, '0')
const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`

function todayLocal() {
  const n = new Date()
  return toISO(n.getFullYear(), n.getMonth(), n.getDate())
}

// selected: 'YYYY-MM-DD' | null
// blocked / booked: Set of 'YYYY-MM-DD'
// onSelect(iso): kapag wala, view-only ang calendar
// unlockBlocked: pwedeng i-click ang blocked na petsa (para sa barista na nag-a-unblock)
export default function AvailabilityCalendar({
  selected = null,
  blocked = new Set(),
  booked = new Set(),
  onSelect,
  unlockBlocked = false,
  minDate,
}) {
  const min = minDate ?? todayLocal()
  const base = selected ? new Date(`${selected}T00:00:00`) : new Date()
  const [cursor, setCursor] = useState({ y: base.getFullYear(), m: base.getMonth() })

  const firstDay = new Date(cursor.y, cursor.m, 1).getDay()
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function shift(delta) {
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#F6E6D2] active:scale-95"
        >
          <ChevronLeft className="h-5 w-5 text-[#3B2316]" />
        </button>
        <p className="text-sm font-bold text-[#2B1A12]">
          {MONTHS[cursor.m]} {cursor.y}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#F6E6D2] active:scale-95"
        >
          <ChevronRight className="h-5 w-5 text-[#3B2316]" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-400">
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />

          const iso = toISO(cursor.y, cursor.m, day)
          const past = iso < min
          const isBlocked = blocked.has(iso)
          const isBooked = booked.has(iso)
          const isSelected = selected === iso

          const clickable =
            Boolean(onSelect) && !past && !isBooked && (!isBlocked || unlockBlocked)

          let style = 'bg-white text-[#2B1A12] border-[#EADCCB]'
          if (past) style = 'bg-transparent text-stone-300 border-transparent'
          else if (isBooked) style = 'bg-amber-100 text-amber-800 border-amber-200'
          else if (isBlocked) style = 'bg-stone-200 text-stone-500 line-through border-stone-200'
          if (isSelected) style = 'bg-[#3B2316] text-[#F6E9D8] border-[#3B2316]'

          return (
            <button
              key={iso}
              type="button"
              disabled={!clickable}
              onClick={() => onSelect(iso)}
              aria-label={iso}
              aria-pressed={isSelected}
              className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition ${style} ${
                clickable ? 'hover:border-[#B8742F] active:scale-95' : 'cursor-default'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#EADCCB] bg-white" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-100" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-stone-200" /> Not available
        </span>
      </div>
    </div>
  )
}