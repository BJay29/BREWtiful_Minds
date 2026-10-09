import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import PaymentPill from './PaymentPill'

// booking: { id }
export default function PaymentReview({ booking }) {
  const [state, setState] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const { data } = await supabase
      .from('bookings')
      .select('payment_status, payment_proof_url')
      .eq('id', booking.id)
      .maybeSingle()
    setState(data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id])

  async function setStatus(p_status) {
    setBusy(true)
    setError('')
    const { error: err } = await supabase.rpc('set_payment_status', {
      p_booking: String(booking.id),
      p_status,
    })
    if (err) setError(err.message)
    else await load()
    setBusy(false)
  }

  if (!state) return null

  return (
    <div className="mt-3 rounded-xl border border-[#EADCCB] bg-[#FBF6EF] p-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-bold text-[#2B1A12]">Payment</p>
        <PaymentPill status={state.payment_status} />
      </div>

      {state.payment_proof_url ? (
        <a href={state.payment_proof_url} target="_blank" rel="noopener noreferrer">
          <img
            src={state.payment_proof_url}
            alt="Payment receipt"
            className="mt-2 max-h-48 rounded-lg border border-[#EADCCB] object-contain"
          />
        </a>
      ) : (
        <p className="mt-2 text-xs text-stone-500">No receipt uploaded yet.</p>
      )}

      {state.payment_status !== 'paid' && state.payment_proof_url && (
        <button
          onClick={() => setStatus('paid')}
          disabled={busy}
          className="mt-2 h-10 w-full rounded-xl bg-[#3B2316] text-xs font-bold text-[#F6E9D8] transition hover:bg-[#2B1A12] disabled:opacity-60"
        >
          {busy ? 'Saving...' : 'Mark as paid'}
        </button>
      )}
      {state.payment_status === 'paid' && (
        <button
          onClick={() => setStatus('unpaid')}
          disabled={busy}
          className="mt-2 text-xs font-semibold text-stone-500 hover:underline"
        >
          Undo (mark as unpaid)
        </button>
      )}

      {error && <p role="alert" className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-800">{error}</p>}
    </div>
  )
}