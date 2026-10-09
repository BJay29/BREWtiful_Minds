import { Link } from 'react-router-dom'
import { btnPrimary } from '../lib/ui'

export default function EmptyState({ icon: Icon, title, text, to, actionLabel }) {
  return (
    <div className="flex animate-fade-in flex-col items-center rounded-2xl border border-dashed border-[#E2D3C2] bg-white/60 px-6 py-10 text-center md:col-span-full">
      {Icon && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F6E6D2] text-[#8A4F1E]">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="font-display text-base font-semibold text-[#2B1A12]">{title}</p>
      {text && <p className="mt-1 max-w-xs text-sm text-stone-500">{text}</p>}
      {to && (
        <Link to={to} className={`${btnPrimary} mt-4 h-11`}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}