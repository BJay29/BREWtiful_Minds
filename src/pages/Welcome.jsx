import { Link } from 'react-router-dom'
import {
  Banknote,
  CalendarCheck,
  Coffee,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react'
import LatteArt from '../components/LatteArt'

const features = [
  { icon: MapPin, title: 'Find nearby baristas', text: 'Search by drink, skill or location and see who is closest to you.' },
  { icon: CalendarCheck, title: 'Book for your event', text: 'Pick an available date and send a request in a minute.' },
  { icon: Banknote, title: 'Pay your way', text: 'Pay by GCash or cash on the event day.' },
  { icon: MessageCircle, title: 'Chat directly', text: 'Talk to your barista about drinks, setup and timing.' },
  { icon: Star, title: 'Honest reviews', text: 'Ratings come only from real, completed bookings.' },
  { icon: ShieldCheck, title: 'Clear booking rules', text: 'Track every request from pending to completed.' },
]

const steps = [
  { icon: Search, title: 'Browse', text: 'Look through barista profiles, drinks and portfolios.' },
  { icon: CalendarCheck, title: 'Book', text: 'Choose a date, pin your event location and send a request.' },
  { icon: Coffee, title: 'Enjoy', text: 'Your barista accepts, you pay, and the coffee is served.' },
]

// Full width na may padding sa gilid. Walang max-width kaya sakop ang buong screen.
const wrap = 'w-full px-5 md:px-8 lg:px-14 2xl:px-24'

export default function Welcome() {
  return (
    <div className="min-h-dvh bg-[#FBF6EF] text-[#2B1A12]">
      {/* Top bar */}
      <header className="bg-[#2B1A12]">
        <div className={`${wrap} flex h-14 items-center justify-between md:h-16 2xl:h-20`}>
          <div className="flex items-center gap-2.5 font-display text-lg font-bold text-[#F6E9D8] 2xl:text-2xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6E6D2] 2xl:h-11 2xl:w-11">
              <Coffee className="h-5 w-5 text-[#3B2316] 2xl:h-6 2xl:w-6" />
            </span>
            BREWtiful Minds
          </div>
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-[#F6E9D8] transition hover:bg-white/10 2xl:h-12 2xl:text-base"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="hidden h-10 items-center rounded-xl bg-[#F6E6D2] px-4 text-sm font-bold text-[#2B1A12] transition hover:bg-white sm:flex 2xl:h-12 2xl:px-6 2xl:text-base"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[radial-gradient(circle_at_75%_30%,#5A3622,#2B1A12_70%)] text-[#F6E9D8]">
        <div
          className={`${wrap} grid items-center gap-6 pb-12 pt-8 md:grid-cols-2 md:gap-10 md:pb-20 md:pt-14 lg:min-h-[640px] lg:py-20 2xl:min-h-[760px]`}
        >
          <div className="text-center md:text-left">
            <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#E9B77E] 2xl:text-sm">
              Baristas for your events
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl lg:text-7xl 2xl:text-8xl">
              Find the barista behind your favorite cup.
            </h1>
            <p className="mt-4 text-base text-[#D9BFA3] md:max-w-md md:text-lg lg:max-w-xl lg:text-xl 2xl:max-w-2xl 2xl:text-2xl">
              Discover talented baristas, check their availability and book them for your birthday,
              wedding or office event.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start lg:mt-8">
              <Link
                to="/register"
                className="flex h-12 items-center justify-center rounded-xl bg-[#F6E6D2] px-7 text-base font-bold text-[#2B1A12] shadow-lg transition hover:bg-white active:scale-[0.97] 2xl:h-14 2xl:px-10 2xl:text-lg"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="flex h-12 items-center justify-center rounded-xl border border-white/30 px-7 text-base font-semibold text-[#F6E9D8] transition hover:bg-white/10 active:scale-[0.97] 2xl:h-14 2xl:px-10 2xl:text-lg"
              >
                I have an account
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end lg:pr-8 2xl:pr-20">
            <LatteArt className="h-40 w-40 animate-float drop-shadow-[0_14px_20px_rgba(0,0,0,0.45)] md:h-72 md:w-72 lg:h-96 lg:w-96 2xl:h-[30rem] 2xl:w-[30rem]" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={`${wrap} py-12 md:py-16 lg:py-20 2xl:py-28`}>
        <h2 className="text-center font-display text-2xl font-bold md:text-4xl lg:text-5xl 2xl:text-6xl">
          Everything you need to book with confidence
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6 2xl:gap-8">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#EADCCB] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md lg:p-7 2xl:p-9"
            >
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F6E6D2] lg:h-14 lg:w-14 2xl:h-16 2xl:w-16">
                <Icon className="h-5 w-5 text-[#8A4F1E] lg:h-6 lg:w-6 2xl:h-7 2xl:w-7" />
              </span>
              <h3 className="font-bold lg:text-lg 2xl:text-2xl">{title}</h3>
              <p className="mt-1 text-sm text-stone-600 lg:text-base 2xl:text-lg">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className={`${wrap} py-12 md:py-16 lg:py-20 2xl:py-28`}>
          <h2 className="text-center font-display text-2xl font-bold md:text-4xl lg:text-5xl 2xl:text-6xl">
            How it works
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3 lg:mt-12 lg:gap-10 2xl:gap-14">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#3B2316] lg:h-16 lg:w-16 2xl:h-20 2xl:w-20">
                  <Icon className="h-6 w-6 text-[#F6E9D8] lg:h-7 lg:w-7 2xl:h-9 2xl:w-9" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#B8742F] text-xs font-bold text-white lg:h-7 lg:w-7 lg:text-sm">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <h3 className="font-bold lg:text-lg 2xl:text-2xl">{title}</h3>
                  <p className="mt-1 text-sm text-stone-600 lg:text-base 2xl:text-lg">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For baristas */}
      <section className={`${wrap} py-12 md:py-16 lg:py-20 2xl:py-28`}>
        <div className="rounded-3xl bg-[radial-gradient(circle_at_85%_30%,#5A3622,#2B1A12_75%)] px-6 py-10 text-center text-[#F6E9D8] md:px-12 md:py-14 lg:py-20 2xl:py-28">
          <h2 className="font-display text-2xl font-bold md:text-4xl lg:text-5xl 2xl:text-6xl">
            Are you a barista?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#D9BFA3] md:text-base lg:max-w-2xl lg:text-lg 2xl:max-w-3xl 2xl:text-2xl">
            Build your profile, show off your latte art, set your rate and availability, and get
            booked for events.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#F6E6D2] px-7 text-base font-bold text-[#2B1A12] shadow-lg transition hover:bg-white active:scale-[0.97] lg:mt-8 2xl:h-14 2xl:px-10 2xl:text-lg"
          >
            Join as a barista
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EADCCB] py-6 text-center text-xs text-stone-500 2xl:text-sm">
        &copy; {new Date().getFullYear()} BREWtiful Minds. All rights reserved.
      </footer>
    </div>
  )
}