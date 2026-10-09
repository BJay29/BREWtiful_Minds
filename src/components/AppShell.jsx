import { Link, NavLink, useLocation } from 'react-router-dom'
import { Coffee, LogOut, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import NotificationBell from './NotificationBell'
import Spinner from './Spinner'

const NARROW_ROUTES = ['/customer/book/', '/customer/review/', '/customer/profile', '/barista/profile']
const isRoot = (to) => to === '/customer' || to === '/barista'

function Brand({ dark }) {
  return (
    <div
      className={`flex items-center gap-2.5 font-display text-lg font-bold ${
        dark ? 'text-[#F6E9D8]' : 'text-[#2B1A12]'
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          dark ? 'bg-[#F6E6D2]' : 'bg-[#3B2316]'
        }`}
      >
        <Coffee className={`h-5 w-5 ${dark ? 'text-[#3B2316]' : 'text-[#F6E9D8]'}`} />
      </span>
      BREWtiful Minds
    </div>
  )
}

function Initial({ name, className = '' }) {
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-[#F6E6D2] font-display font-bold text-[#6B3F24] ${className}`}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  )
}

export default function AppShell({ items, children }) {
  const { loading, notice, clearNotice } = useStore()
  const { profile, signOut } = useAuth()
  const { pathname } = useLocation()

  const isBarista = pathname.startsWith('/barista')
  const profilePath = isBarista ? '/barista/profile' : '/customer/profile'
  const narrow = NARROW_ROUTES.some((p) => pathname.startsWith(p))

  return (
    <div className="min-h-dvh bg-[#FBF6EF] md:flex">
      {isBarista && (
        <aside className="sticky top-0 z-30 hidden h-dvh w-64 shrink-0 flex-col bg-[#2B1A12] p-4 md:flex">
          <div className="mb-8 flex items-center justify-between px-2 pt-2">
            <Brand dark />
            <NotificationBell dark placement="sidebar" />
          </div>
          <nav className="flex flex-col gap-1">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={isRoot(to)}
                className={({ isActive }) =>
                  `flex h-11 items-center gap-3 rounded-xl px-3 text-sm transition duration-200 ${
                    isActive
                      ? 'bg-[#F6E6D2] font-bold text-[#2B1A12]'
                      : 'font-medium text-[#D9BFA3] hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/10 pt-4">
            <Link
              to={profilePath}
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/10"
            >
              <Initial name={profile?.full_name} className="h-9 w-9 text-sm" />
              <span className="truncate text-sm font-semibold text-[#F6E9D8]">
                {profile?.full_name}
              </span>
            </Link>
            <button
              onClick={signOut}
              className="mt-1 flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#D9BFA3] transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </div>
        </aside>
      )}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {!isBarista && (
          <header className="sticky top-0 z-20 hidden h-16 items-center gap-8 border-b border-[#EADCCB] bg-white/85 px-8 backdrop-blur md:flex">
            <Brand />
            <nav className="flex gap-1">
              {items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={isRoot(to)}
                  className={({ isActive }) =>
                    `flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm transition duration-200 ${
                      isActive
                        ? 'bg-[#F6E6D2] font-bold text-[#3B2316]'
                        : 'font-medium text-stone-600 hover:bg-stone-100'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <NotificationBell />
              <Link
                to={profilePath}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-stone-100"
              >
                <Initial name={profile?.full_name} className="h-8 w-8 text-sm" />
                <span className="text-sm font-semibold text-[#2B1A12]">{profile?.full_name}</span>
              </Link>
              <button
                onClick={signOut}
                aria-label="Log out"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EADCCB] text-stone-600 transition hover:bg-stone-100 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>
        )}

        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#EADCCB] bg-white/90 px-5 backdrop-blur md:hidden">
          <Brand />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link to={profilePath} aria-label="Profile">
              <Initial name={profile?.full_name} className="h-9 w-9 text-sm" />
            </Link>
          </div>
        </header>

        <main className="flex-1">
          <div
            key={pathname}
            className={`mx-auto w-full animate-fade-up px-5 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8 ${
              narrow ? 'max-w-2xl' : 'max-w-6xl'
            }`}
          >
            {notice && (
              <div
                role="alert"
                className="mb-4 flex items-start justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                <span>{notice}</span>
                <button onClick={clearNotice} aria-label="Dismiss" className="shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-20 text-[#8A4F1E]">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              children
            )}
          </div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-[#EADCCB] bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={isRoot(to)}
              className="relative flex flex-1 flex-col items-center gap-0.5 pb-2 pt-2.5 text-[11px]"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute top-0 h-0.5 rounded-full bg-[#B8742F] transition-all duration-300 ${
                      isActive ? 'w-8' : 'w-0'
                    }`}
                  />
                  <Icon
                    className={`h-5 w-5 transition duration-200 ${
                      isActive ? '-translate-y-0.5 text-[#3B2316]' : 'text-stone-400'
                    }`}
                  />
                  <span className={isActive ? 'font-bold text-[#3B2316]' : 'text-stone-500'}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}