import { useAuth } from '../../context/AuthContext'
import AppShell from '../../components/AppShell'
import BaristaAvatar from '../../components/BaristaAvatar'
import { customerNav } from '../../lib/nav'

export default function Profile() {
  const { session, profile, signOut } = useAuth()

  return (
    <AppShell items={customerNav}>
      <div className="flex flex-col items-center gap-2 px-5 pt-10">
        <BaristaAvatar color="#7A9E7E" className="h-24 w-24" />
        <h1 className="font-display text-2xl font-bold text-[#2B1A12]">{profile?.full_name}</h1>
        <p className="text-sm text-stone-600">{session?.user?.email}</p>
        <p className="rounded-full bg-[#F6E6D2] px-3 py-1 text-xs font-bold text-[#6B3F24]">
          Customer
        </p>
        <button
          onClick={signOut}
          className="mt-6 h-12 w-full rounded-2xl border border-[#3B2316] bg-white font-bold text-[#3B2316]"
        >
          Log out
        </button>
      </div>
    </AppShell>
  )
}