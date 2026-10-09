import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const StoreContext = createContext(null)

const COLORS = ['#C58B4E', '#7A9E7E', '#8A6F9E', '#B8742F', '#5F8FA8', '#A8645F']

function colorFor(id) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997
  return COLORS[h % COLORS.length]
}

const empty = { baristas: [], bookings: [], reviews: [], favorites: [] }

export function StoreProvider({ children }) {
  const { session } = useAuth()
  const userId = session?.user?.id ?? null

  const [data, setData] = useState(empty)
  const [loadedFor, setLoadedFor] = useState(null)
  const [notice, setNotice] = useState('')

  const reload = useCallback(async () => {
    if (!userId) return

    const [bp, bk, rv, fv, st] = await Promise.all([
      supabase.from('barista_profiles').select('*, profiles(full_name)'),
      supabase
        .from('bookings')
        .select('*, customer:profiles!bookings_customer_id_fkey(full_name)')
        .order('event_date', { ascending: true }),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('favorites').select('barista_id').eq('customer_id', userId),
      supabase.from('barista_stats').select('*'),
    ])

    const firstError = [bp, bk, rv, fv, st].find((r) => r.error)?.error
    if (firstError) setNotice(firstError.message)

    const stats = new Map((st.data ?? []).map((s) => [s.barista_id, s]))

    setData({
      baristas: (bp.data ?? []).map((row) => {
        const s = stats.get(row.id)
        return {
          id: row.id,
          name: row.profiles?.full_name ?? 'Barista',
          bio: row.bio ?? '',
          years: row.years_experience ?? 0,
          cafe: row.cafe_name ?? '',
          city: row.city ?? '',
          schedule: row.schedule ?? '',
          skills: row.skills ?? [],
          drinks: row.signature_drinks ?? [],
          openForEvents: row.open_for_events ?? true,
          avatarUrl: row.avatar_url ?? null,
          portfolio: row.portfolio ?? [],
          address: row.address ?? '',
          latitude: row.latitude ?? null,
          longitude: row.longitude ?? null,
          color: colorFor(row.id),
          rating: s?.rating != null ? Number(s.rating) : null,
          reviewCount: Number(s?.review_count ?? 0),
          points: Number(s?.points ?? 0),
        }
      }),
      bookings: (bk.data ?? []).map((row) => ({
        id: row.id,
        baristaId: row.barista_id,
        customerId: row.customer_id,
        customerName: row.customer?.full_name ?? '',
        eventType: row.event_type ?? '',
        date: row.event_date,
        time: row.event_time ?? '',
        location: row.location ?? '',
        latitude: row.latitude ?? null,
        longitude: row.longitude ?? null,
        notes: row.notes ?? '',
        status: row.status,
        cancelledBy: row.cancelled_by ?? null,
      })),
      reviews: (rv.data ?? []).map((row) => ({
        id: row.id,
        bookingId: row.booking_id,
        baristaId: row.barista_id,
        customerId: row.customer_id,
        customerName: row.customer_name ?? '',
        rating: row.rating,
        text: row.text ?? '',
        date: row.created_at.slice(0, 10),
      })),
      favorites: (fv.data ?? []).map((row) => row.barista_id),
    })
    setLoadedFor(userId)
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setData(empty)
      setLoadedFor(null)
      return
    }
    reload()

    const onVisible = () => {
      if (document.visibilityState === 'visible') reload()
    }
    document.addEventListener('visibilitychange', onVisible)

    // Realtime: mag-reload kapag may nagbago sa bookings o reviews
    let timer
    const scheduleReload = () => {
      clearTimeout(timer)
      timer = setTimeout(reload, 400)
    }
    const channel = supabase
      .channel(`store-sync-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, scheduleReload)
      .subscribe()

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      clearTimeout(timer)
      supabase.removeChannel(channel)
    }
  }, [userId, reload])

  async function mutate(query) {
    const { error } = await query
    if (error) {
      setNotice(error.message)
      return false
    }
    await reload()
    return true
  }

  const value = {
    userId,
    loading: Boolean(userId) && loadedFor !== userId,
    notice,
    clearNotice: () => setNotice(''),
    reload,

    baristas: data.baristas,
    myBarista: data.baristas.find((b) => b.id === userId) ?? null,
    bookings: data.bookings,
    reviews: data.reviews,
    favorites: data.favorites,

    getBarista: (id) => data.baristas.find((b) => b.id === id),
    hasReview: (bookingId) => data.reviews.some((r) => r.bookingId === bookingId),

    createBooking: ({ baristaId, eventType, date, time, location, latitude, longitude, notes }) =>
      mutate(
        supabase.from('bookings').insert({
          customer_id: userId,
          barista_id: baristaId,
          event_type: eventType,
          event_date: date,
          event_time: time,
          location,
          latitude,
          longitude,
          notes,
        })
      ),

    setBookingStatus: (id, status) =>
      mutate(supabase.from('bookings').update({ status }).eq('id', id)),

    addReview: ({ bookingId, rating, text }) => {
      const booking = data.bookings.find((k) => k.id === bookingId)
      if (!booking) return Promise.resolve(false)
      return mutate(
        supabase.from('reviews').insert({
          booking_id: bookingId,
          barista_id: booking.baristaId,
          customer_id: userId,
          rating,
          text,
        })
      )
    },

    toggleFavorite: (baristaId) =>
      data.favorites.includes(baristaId)
        ? mutate(
            supabase
              .from('favorites')
              .delete()
              .eq('customer_id', userId)
              .eq('barista_id', baristaId)
          )
        : mutate(
            supabase.from('favorites').insert({ customer_id: userId, barista_id: baristaId })
          ),

    saveMyBarista: (patch) =>
      mutate(
        supabase.from('barista_profiles').upsert({
          id: userId,
          bio: patch.bio,
          years_experience: patch.years,
          cafe_name: patch.cafe,
          city: patch.city,
          schedule: patch.schedule,
          skills: patch.skills,
          signature_drinks: patch.drinks,
          open_for_events: patch.openForEvents,
          address: patch.address,
          latitude: patch.latitude,
          longitude: patch.longitude,
          updated_at: new Date().toISOString(),
        })
      ),

    updateMyMedia: (patch) =>
      mutate(
        supabase.from('barista_profiles').upsert({
          id: userId,
          ...patch,
          updated_at: new Date().toISOString(),
        })
      ),
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}