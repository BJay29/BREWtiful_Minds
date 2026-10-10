import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, Coffee, ShieldCheck } from 'lucide-react'
import LatteArt from './LatteArt'

const points = [
  { icon: Coffee, text: 'Find the barista behind your favorite cup' },
  { icon: CalendarCheck, text: 'Book trusted baristas for your events' },
  { icon: ShieldCheck, text: 'Verified reviews from real bookings' },
]

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#2B1A12] md:flex-row">
      <div className="relative flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_30%,#5A3622,#2B1A12_70%)] px-6 py-8 text-center md:w-1/2 md:gap-4 md:px-12 md:py-0">
        <Link
          to="/"
          className="absolute left-3 top-3 flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[#D9BFA3] transition hover:bg-white/10 hover:text-white active:scale-95 md:left-6 md:top-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="md:hidden">Back</span>
          <span className="hidden md:inline">Back to home</span>
        </Link>

        <LatteArt className="h-24 w-24 animate-float drop-shadow-[0_14px_20px_rgba(0,0,0,0.45)] md:h-52 md:w-52" />
        <h1 className="font-display text-3xl font-bold text-[#F6E9D8] md:text-5xl">{title}</h1>
        <p className="text-sm text-[#D9BFA3] md:text-base">{subtitle}</p>
        <ul className="mt-6 hidden space-y-3 text-left md:block">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-[#F6E9D8]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon className="h-5 w-5 text-[#E9B77E]" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-1 animate-fade-up flex-col rounded-t-3xl bg-[#FBF6EF] px-6 py-8 md:w-1/2 md:flex-none md:items-center md:justify-center md:rounded-none">
        <div className="mx-auto flex w-full flex-col gap-4 md:max-w-sm">{children}</div>
      </div>
    </div>
  )
}