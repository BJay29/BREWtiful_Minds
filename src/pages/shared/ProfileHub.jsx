import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  CalendarDays,
  ChevronRight,
  Heart,
  KeyRound,
  LogOut,
  Pencil,
  Star,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import BaristaAvatar from '../../components/BaristaAvatar'
import LogoutModal from '../../components/LogoutModal'
import { baristaNav, customerNav } from '../../lib/nav'
import { btnDanger, btnPrimary, card } from '../../lib/ui'

const MENUS = {
  customer: [
    { to: '/customer/profile/edit', icon: UserRound, label: 'Edit account', hint: 'Update your name' },
    { to: '/customer/profile/password', icon: KeyRound, label: 'Change password', hint: 'Keep your account secure' },
    { to: '/customer/bookings', icon: CalendarDays, label: 'My bookings', hint: 'Track your requests' },
    { to: '/customer/favorites', icon: Heart, label: 'Favorite baristas', hint: 'Baristas you saved' },
  ],
  barista: [
    { to: '/barista/profile/edit', icon: Pencil, label: 'Edit barista profile', hint: 'Photo, portfolio, skills and schedule' },
    { to: '/barista/profile/account', icon: UserRound, label: 'Account details', hint: 'Update your name' },
    { to: '/barista/profile/password', icon: KeyRound, label: 'Change password', hint: 'Keep your account secure' },
    { to: '/barista/reviews', icon: Star, label: 'Reviews & points', hint: 'See what customers say' },
  ],
}

export default function ProfileHub() {
  const { session, profile, signOut } = useAuth()
  const { myBarista } = useStore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const role = profile.role
  const isBarista = role === 'barista'

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await signOut()
    } finally {
      setLoggingOut(false)
      setConfirmOpen(false)
    }
  }

  const stats = [
    { value: myBarista?.rating ? myBarista.rating.toFixed(1) : '—', label: 'Rating', icon: Star },
    { value: String(myBarista?.points ?? 0), label: 'Points', icon: Award },
    { value: String(myBarista?.reviewCount ?? 0), label: 'Reviews', icon: Heart },
  ]

  return (
    <AppShell items={isBarista ? baristaNav : customerNav}>
      <section className="overflow-hidden rounded-3xl border border-[#EADCCB] bg-white shadow-sm">
        <div className="h-28 bg-[radial-gradient(circle_at_80%_30%,#5A3622,#2B1A12_75%)]" />
        <div className="px-5 pb-6">
          <BaristaAvatar
            src={isBarista ? myBarista?.avatarUrl : undefined}
            color={isBarista ? myBarista?.color : '#7A9E7E'}
            className="-mt-12 h-24 w-24 rounded-full border-4 border-white bg-white shadow-md"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-[#2B1A12]">{profile.full_name}</h1>
            <span className="rounded-full bg-[#F6E6D2] px-2.5 py-0.5 text-xs font-bold capitalize text-[#6B3F24]">
              {role}
            </span>
          </div>
          <p className="text-sm text-stone-500">{session?.user?.email}</p>

          {isBarista && myBarista && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="rounded-2xl bg-[#FBF6EF] py-3 text-center">
                  <Icon className="mx-auto mb-1 h-4 w-4 text-[#B8742F]" />
                  <p className="font-display text-xl font-bold text-[#2B1A12]">{value}</p>
                  <p className="text-[11px] text-stone-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          {isBarista && !myBarista && (
            <div className="mt-5 rounded-2xl bg-[#F6E6D2]/70 p-4 text-sm text-[#4A2B18]">
              <p className="font-semibold">Your profile is not visible to customers yet.</p>
              <Link to="/barista/profile/edit" className={`${btnPrimary} mt-3 h-11 w-full sm:w-auto`}>
                Complete my profile
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {MENUS[role].map(({ to, icon: Icon, label, hint }, i) => (
          <Link
            key={to}
            to={to}
            style={{ animationDelay: `${i * 60}ms` }}
            className={`${card} group flex animate-fade-up items-center gap-3 p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F6E6D2] text-[#8A4F1E] transition duration-300 group-hover:bg-[#3B2316] group-hover:text-[#F6E9D8]">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#2B1A12]">{label}</p>
              <p className="truncate text-xs text-stone-500">{hint}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-stone-400 transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <button onClick={() => setConfirmOpen(true)} className={`${btnDanger} mt-5 w-full`}>
        <LogOut className="h-5 w-5" />
        Log out
      </button>

      <LogoutModal
        open={confirmOpen}
        busy={loggingOut}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </AppShell>
  )
}