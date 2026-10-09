import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { MessageCircle, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import BaristaAvatar from '../../components/BaristaAvatar'
import EmptyState from '../../components/EmptyState'
import MessageBubble from '../../components/MessageBubble'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'
import { baristaNav, customerNav } from '../../lib/nav'
import { formatDate } from '../../lib/format'
import { btnPrimary, card } from '../../lib/ui'

const ACTIVE = ['pending', 'accepted', 'completed']

function usePeer(booking, isBarista) {
  const { getBarista } = useStore()
  if (isBarista) {
    return { name: booking.customerName || 'Customer', barista: null }
  }
  const b = getBarista(booking.baristaId)
  return { name: b?.name ?? 'Barista', barista: b }
}

function Row({ booking, isBarista, base, last, unread }) {
  const { name, barista } = usePeer(booking, isBarista)
  return (
    <Link
      to={`${base}/messages/${booking.id}`}
      className={`${card} flex items-center gap-3 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md`}
    >
      {isBarista ? (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F6E6D2] font-display text-lg font-bold text-[#6B3F24]">
          {name.charAt(0).toUpperCase()}
        </span>
      ) : (
        <BaristaAvatar src={barista?.avatarUrl} color={barista?.color} className="h-12 w-12 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-[#2B1A12]">{name}</p>
        <p className="truncate text-xs text-stone-500">
          {booking.eventType} · {formatDate(booking.date)}
        </p>
        <p className={`mt-0.5 truncate text-sm ${unread ? 'font-semibold text-[#2B1A12]' : 'text-stone-500'}`}>
          {last ? last.body : 'No messages yet. Say hi!'}
        </p>
      </div>
      {unread > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#B8742F] px-1.5 text-xs font-bold text-white">
          {unread}
        </span>
      )}
    </Link>
  )
}

function ConversationList({ bookings, isBarista, base, userId }) {
  const [msgs, setMsgs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('booking_id, sender_id, body, created_at, read_at')
      .order('created_at', { ascending: false })
      .limit(500)
    setMsgs(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('chat-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  const rows = bookings
    .map((k) => {
      const mine = msgs.filter((m) => String(m.booking_id) === String(k.id))
      return {
        booking: k,
        last: mine[0] ?? null,
        unread: mine.filter((m) => m.sender_id !== userId && !m.read_at).length,
      }
    })
    .sort((a, b) => {
      const ta = a.last?.created_at ?? ''
      const tb = b.last?.created_at ?? ''
      return tb.localeCompare(ta)
    })

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-[#8A4F1E]">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No conversations yet"
        text="You can chat once a booking is requested."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {rows.map((r) => (
        <Row key={r.booking.id} {...r} isBarista={isBarista} base={base} />
      ))}
    </div>
  )
}

function Thread({ booking, isBarista, base, userId }) {
  const { name } = usePeer(booking, isBarista)
  const bookingId = booking.id
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const closed = !ACTIVE.includes(booking.status)

  const markRead = useCallback(() => {
    supabase.rpc('mark_messages_read', { p_booking: String(bookingId) })
  }, [bookingId])

  useEffect(() => {
    let cancelled = false

    supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) setError(err.message)
        else {
          setMessages(data)
          markRead()
        }
        setLoading(false)
      })

    const channel = supabase
      .channel(`chat-${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
          if (payload.new.sender_id !== userId) markRead()
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [bookingId, userId, markRead])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, loading])

  async function send(e) {
    e.preventDefault()
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setError('')
    const { data, error: err } = await supabase
      .from('messages')
      .insert({ booking_id: bookingId, sender_id: userId, body })
      .select()
      .single()
    if (err) {
      setError(err.message)
    } else {
      setText('')
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]))
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={name}
        subtitle={`${booking.eventType} · ${formatDate(booking.date)}`}
        back={`${base}/messages`}
      />

      <div className={`${card} flex h-[60vh] flex-col overflow-hidden`}>
        <div className="flex-1 space-y-2 overflow-y-auto bg-[#FBF6EF] p-4">
          {loading ? (
            <div className="flex justify-center py-10 text-[#8A4F1E]">
              <Spinner className="h-5 w-5" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-500">
              No messages yet. Send the first one.
            </p>
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} mine={m.sender_id === userId} body={m.body} createdAt={m.created_at} />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {closed ? (
          <p className="border-t border-[#EADCCB] bg-white p-3 text-center text-xs text-stone-500">
            This booking is {booking.status}, so new messages are turned off.
          </p>
        ) : (
          <form onSubmit={send} className="flex items-end gap-2 border-t border-[#EADCCB] bg-white p-3">
            <textarea
              rows={1}
              value={text}
              maxLength={1000}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) send(e)
              }}
              placeholder="Type a message"
              className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-[#E2D3C2] px-3 py-2.5 text-sm outline-none focus:border-[#B8742F] focus:ring-4 focus:ring-[#B8742F]/20"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              aria-label="Send"
              className={`${btnPrimary} h-11 w-11 shrink-0 px-0 disabled:opacity-50`}
            >
              {sending ? <Spinner /> : <Send className="h-5 w-5" />}
            </button>
          </form>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  )
}

export default function Chat() {
  const { pathname } = useLocation()
  const { bookingId } = useParams()
  const { userId, bookings } = useStore()

  const isBarista = pathname.startsWith('/barista')
  const base = isBarista ? '/barista' : '/customer'

  const mine = bookings.filter((k) => k.customerId === userId || k.baristaId === userId)
  const booking = bookingId ? mine.find((k) => String(k.id) === bookingId) : null

  return (
    <AppShell items={isBarista ? baristaNav : customerNav}>
      {bookingId ? (
        booking ? (
          <Thread booking={booking} isBarista={isBarista} base={base} userId={userId} />
        ) : (
          <EmptyState
            title="Conversation not found"
            to={`${base}/messages`}
            actionLabel="Back to messages"
          />
        )
      ) : (
        <>
          <PageHeader title="Messages" subtitle="Chat with your barista or customer." />
          <ConversationList
            bookings={mine.filter((k) => ACTIVE.includes(k.status))}
            isBarista={isBarista}
            base={base}
            userId={userId}
          />
        </>
      )}
    </AppShell>
  )
}