import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import PaymentPill from './PaymentPill'
import Spinner from './Spinner'

const peso = (n) => `₱${Number(n).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`

// booking: { id, baristaId }
export default function PaymentSection({ booking }) {
  const [pay, setPay] = useState(null)
  const [state, setState] = useState({
    payment_status: 'unpaid',
    payment_proof_url: null,
    payment_method: null,
  })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const [p, b] = await Promise.all([
      supabase.from('barista_payment').select('*').eq('barista_id', booking.baristaId).maybeSingle(),
      supabase
        .from('bookings')
        .select('payment_status, payment_proof_url, payment_method')
        .eq('id', booking.id)
        .maybeSingle(),
    ])
    setPay(p.data)
    if (b.data) setState(b.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id])

  const methods = []
  if (pay) {
    if (pay.accepts_gcash !== false && (pay.gcash_number || pay.qr_url)) methods.push('gcash')
    if (pay.accepts_cash !== false) methods.push('cash')
  }

  const paid = state.payment_status === 'paid'
  const locked = paid || state.payment_status === 'proof_submitted'
  const method = state.payment_method ?? (methods.length === 1 ? methods[0] : null)

  // Kapag isa lang ang tinatanggap, i-save agad bilang napiling paraan
  useEffect(() => {
    if (loading || state.payment_method || methods.length !== 1 || locked) return
    supabase
      .rpc('set_payment_method', { p_booking: String(booking.id), p_method: methods[0] })
      .then(({ error: err }) => {
        if (!err) setState((s) => ({ ...s, payment_method: methods[0] }))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, methods.length, state.payment_method, locked])

  async function choose(next) {
    if (locked || next === state.payment_method) return
    setError('')
    setSwitching(true)
    const { error: err } = await supabase.rpc('set_payment_method', {
      p_booking: String(booking.id),
      p_method: next,
    })
    if (err) setError(err.message)
    else setState((s) => ({ ...s, payment_method: next }))
    setSwitching(false)
  }

  async function upload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('Choose a screenshot (image) under 5 MB.')
      return
    }
    setUploading(true)
    const { data: auth } = await supabase.auth.getUser()
    const ext = file.name.split('.').pop()
    const path = `${auth.user.id}/${crypto.randomUUID()}.${ext}`
    const up = await supabase.storage.from('payment-proofs').upload(path, file)
    if (up.error) {
      setError(up.error.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('payment-proofs').getPublicUrl(path)
    const { error: rpcError } = await supabase.rpc('submit_payment_proof', {
      p_booking: String(booking.id),
      p_url: data.publicUrl,
    })
    if (rpcError) setError(rpcError.message)
    else await load()
    setUploading(false)
  }

  if (loading) return <Spinner className="h-4 w-4" />

  if (!pay || methods.length === 0) {
    return (
      <p className="mt-3 rounded-xl bg-[#F6E6D2]/70 p-3 text-xs text-[#4A2B18]">
        This barista has not added payment details yet. Please message them to arrange payment.
      </p>
    )
  }

  const deposit = pay.rate && pay.deposit_percent ? (pay.rate * pay.deposit_percent) / 100 : null

  const methodBtn = (key, label) => (
    <button
      type="button"
      key={key}
      onClick={() => choose(key)}
      disabled={locked || switching}
      aria-pressed={method === key}
      className={`h-10 flex-1 rounded-xl border text-xs font-bold transition active:scale-95 disabled:cursor-not-allowed ${
        method === key
          ? 'border-[#3B2316] bg-[#3B2316] text-[#F6E9D8]'
          : 'border-[#E2D3C2] bg-white text-[#2B1A12] hover:border-[#B8742F]'
      } ${locked && method !== key ? 'opacity-40' : ''}`}
    >
      {label}
    </button>
  )

  return (
    <div className="mt-3 rounded-xl border border-[#EADCCB] bg-[#FBF6EF] p-3 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-bold text-[#2B1A12]">Payment</p>
        <PaymentPill status={state.payment_status} method={method} />
      </div>

      {pay.rate != null && (
        <p className="text-xs text-stone-600">
          Rate: <b>{peso(pay.rate)}</b>
          {method === 'gcash' && deposit != null && (
            <>
              {' '}· Deposit ({pay.deposit_percent}%): <b>{peso(deposit)}</b>
            </>
          )}
        </p>
      )}

      {methods.length > 1 && (
        <div className="mt-2">
          <p className="mb-1.5 text-xs font-semibold text-[#2B1A12]">How will you pay?</p>
          <div className="flex gap-2">
            {methods.includes('gcash') && methodBtn('gcash', 'GCash')}
            {methods.includes('cash') && methodBtn('cash', 'Cash on event day')}
          </div>
        </div>
      )}

      {method === null && methods.length > 1 && (
        <p className="mt-2 text-xs text-stone-500">Choose a payment method to continue.</p>
      )}

      {method === 'cash' && !paid && (
        <p className="mt-2 rounded-lg bg-white p-2.5 text-xs text-stone-700">
          Pay{pay.rate != null ? <b> {peso(pay.rate)} </b> : ' '}in cash directly to the barista on
          the event day. The barista will mark this booking as paid once received.
        </p>
      )}

      {method === 'gcash' && !paid && (
        <div className="mt-2 text-xs text-stone-700">
          <p>
            Send via GCash to <b>{pay.gcash_number}</b>
            {pay.gcash_name ? ` (${pay.gcash_name})` : ''}.
          </p>
          {pay.qr_url && (
            <img
              src={pay.qr_url}
              alt="GCash QR"
              className="mt-2 h-36 w-36 rounded-lg border border-[#EADCCB] bg-white object-contain"
            />
          )}
        </div>
      )}

      {state.payment_proof_url && (
        <a
          href={state.payment_proof_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-[#8A4F1E] hover:underline"
        >
          View uploaded receipt
        </a>
      )}

      {method === 'gcash' && !paid && (
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#3B2316]">
          <span className="rounded-lg border border-[#3B2316] px-3 py-2 transition hover:bg-[#F6E6D2]">
            {uploading
              ? 'Uploading...'
              : state.payment_proof_url
                ? 'Replace receipt'
                : 'Upload receipt screenshot'}
          </span>
          <input type="file" accept="image/*" onChange={upload} disabled={uploading} className="hidden" />
        </label>
      )}

      {error && (
        <p role="alert" className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-800">
          {error}
        </p>
      )}
    </div>
  )
}