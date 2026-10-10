import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useStore } from '../context/StoreContext'

// placement: 'right' (default) | 'sidebar'
export default function NotificationBell({ dark = false, placement = 'right' }) {
  const { userId } = useStore()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    let channel = null

    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (!cancelled && data) setItems(data)
    }
    load().catch(() => {})

    try {
      // Unique name per mount, so two bells (or StrictMode) never share one channel.
      const name = `notif-${userId}-${Math.random().toString(36).slice(2, 8)}`
      channel = supabase
        .channel(name)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => setItems((prev) => [payload.new, ...prev].slice(0, 20))
        )
        .subscribe()
    } catch (err) {
      console.error('Live notifications are unavailable:', err)
    }

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [userId])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  const unread = items.filter((n) => !n.read_at).length

  async function markAllRead() {
    const now = new Date().toISOString()
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })))
    await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', userId)
      .is('read_at', null)
  }

  async function openItem(n) {
    setOpen(false)
    if (!n.read_at) {
      const now = new Date().toISOString()
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: now } : x)))
      await supabase.from('notifications').update({ read_at: now }).eq('id', n.id)
    }
    if (n.link) navigate(n.link)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95 ${
          dark
            ? 'text-[#D9BFA3] hover:bg-white/10 hover:text-white'
            : 'border border-[#EADCCB] text-stone-600 hover:bg-stone-100'
        }`}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B8742F] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#EADCCB] bg-white text-[#2B1A12] shadow-xl ${
            placement === 'sidebar' ? 'left-0' : 'right-0'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#EADCCB] px-4 py-3">
            <p className="text-sm font-bold">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-[#8A4F1E] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-stone-500">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={`flex w-full gap-3 border-b border-[#F3E8DA] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#FBF6EF] ${
                    n.read_at ? '' : 'bg-[#F6E6D2]/40'
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.read_at ? 'bg-transparent' : 'bg-[#B8742F]'
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{n.title}</span>
                    {n.body && <span className="block text-xs text-stone-600">{n.body}</span>}
                    <span className="mt-0.5 block text-[10px] text-stone-400">
                      {new Date(n.created_at).toLocaleString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}