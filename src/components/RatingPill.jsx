import { Star } from 'lucide-react'

export default function RatingPill({ value }) {
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#F6E6D2] px-2.5 py-1 text-xs font-bold text-[#6B3F24]">
      <Star className="h-3 w-3 fill-[#B8742F] text-[#B8742F]" />
      {value ? value.toFixed(1) : 'New'}
    </span>
  )
}