import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { card, sectionTitle } from '../lib/ui'
import AvailabilityCalendar from './AvailabilityCalendar'

const peso = (n) => `₱${Number(n).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`

export default function RateAvailability({ baristaId }) {
  const [pay, setPay] = useState(null)
  const [blocked, setBlocked] = useState(new Set())
  const [booked, setBooked] = useState(new Set())

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase
        .from('barista_payment')
        .select('rate, deposit_percent')
        .eq('barista_id', baristaId)
        .maybeSingle(),
      supabase.rpc('get_unavailable_dates', { p_barista: baristaId }),
    ]).then(([p, d]) => {
      if (cancelled) return
      setPay(p.data)
      const rows = d.data ?? []
      setBlocked(new Set(rows.filter((r) => r.kind === 'blocked').map((r) => r.unavailable_date)))
      setBooked(new Set(rows.filter((r) => r.kind === 'booked').map((r) => r.unavailable_date)))
    })
    return () => {
      cancelled = true
    }
  }, [baristaId])

  const deposit =
    pay?.rate != null && pay.deposit_percent ? (pay.rate * pay.deposit_percent) / 100 : null

  return (
    <section className={`${card} animate-fade-up p-5`}>
      <h2 className={`${sectionTitle} mb-3`}>Rate and availability</h2>

      {pay?.rate != null ? (
        <p className="mb-4 rounded-xl bg-[#F6E6D2]/70 p-3 text-sm text-[#4A2B18]">
          <b>{peso(pay.rate)}</b> per event
          {deposit != null && (
            <>
              {' '}· Deposit ({pay.deposit_percent}%): <b>{peso(deposit)}</b>
            </>
          )}
        </p>
      ) : (
        <p className="mb-4 text-sm text-stone-500">This barista has not set a rate yet.</p>
      )}

      <AvailabilityCalendar blocked={blocked} booked={booked} />
    </section>
  )
}