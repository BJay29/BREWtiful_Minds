import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, subtitle, back, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {back && (
          <Link
            to={back}
            aria-label="Back"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EADCCB] bg-white text-[#2B1A12] transition duration-200 hover:bg-[#F6E6D2] active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight text-[#2B1A12] md:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}