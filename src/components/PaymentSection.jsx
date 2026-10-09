import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import PaymentPill from './PaymentPill'
import Spinner from './Spinner'

const peso = (n) => `₱${Number(n).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`

// booking: { id, baristaId }
export default function PaymentSection({ booking }) {
  const [pay, setPay] = useState(null)
  const [state, setState] = useState({ payment_status: 'unpaid', payment_proof_url: null })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const [p, b] = await Promise.all([
      supabase.from('barista_payment').select('*').eq('barista_id', booking.baristaId).maybeSingle(),
      supabase.from('bookings').select('payment_status, payment_proof_url').eq('id', booking.id).maybeSingle(),
    ])
    setPay(p.data)
    if (b.data) setState(b.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id])

  async function upload(e) {
    const file = e.target.files?.[0]
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

  if (!pay || (!pay.gcash_number && !pay.qr_url)) {
    return (
      <p className="mt-3 rounded-xl bg-[#F6E6D2]/70 p-3 text-xs text-[#4A2B18]">
        This barista has not added payment details yet. Please message them to arrange payment.
      </p>
    )
  }

  const deposit = pay.rate && pay.deposit_percent ? (pay.rate * pay.deposit_percent) / 100 : null
  const paid = state.payment_status === 'paid'

  return (
    <div className="mt-3 rounded-xl border border-[#EADCCB] bg-[#FBF6EF] p-3 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-bold text-[#2B1A12]">Payment</p>
        <PaymentPill status={state.payment_status} />
      </div>

      {pay.rate != null && (
        <p className="text-xs text-stone-600">
          Rate: <b>{peso(pay.rate)}</b>
          {deposit != null && (
            <>
              {' '}· Deposit ({pay.deposit_percent}%): <b>{peso(deposit)}</b>
            </>
          )}
        </p>
      )}

      {!paid && (
        <div className="mt-2 text-xs text-stone-700">
          <p>
            Send via GCash to <b>{pay.gcash_number}</b>
            {pay.gcash_name ? ` (${pay.gcash_name})` : ''}.
          </p>
          {pay.qr_url && (
            <img src={pay.qr_url} alt="GCash QR" className="mt-2 h-36 w-36 rounded-lg border border-[#EADCCB] bg-white object-contain" />
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

      {!paid && (
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

      {error && <p role="alert" className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-800">{error}</p>}
    </div>
  )
}