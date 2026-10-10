import { useEffect, useState } from 'react'
import { Banknote, Percent, Smartphone, UserRound } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useStore } from '../context/StoreContext'
import { btnPrimary, card, labelClass } from '../lib/ui'
import IconInput from './IconInput'
import Spinner from './Spinner'

const EMPTY = {
  gcash_number: '',
  gcash_name: '',
  qr_url: '',
  rate: '',
  deposit_percent: 0,
  accepts_gcash: true,
  accepts_cash: true,
}

export default function BaristaPaymentForm() {
  const { userId } = useStore()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    supabase
      .from('barista_payment')
      .select('*')
      .eq('barista_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setMsg({ type: 'error', text: error.message })
        } else if (data) {
          setForm({
            gcash_number: data.gcash_number ?? '',
            gcash_name: data.gcash_name ?? '',
            qr_url: data.qr_url ?? '',
            rate: data.rate ?? '',
            deposit_percent: data.deposit_percent ?? 0,
            accepts_gcash: data.accepts_gcash ?? true,
            accepts_cash: data.accepts_cash ?? true,
          })
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (k) => setForm((f) => ({ ...f, [k]: !f[k] }))

  async function uploadQr(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setMsg({ type: '', text: '' })
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Choose an image under 5 MB.' })
      return
    }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('payment-qr').upload(path, file)
    if (error) {
      setMsg({ type: 'error', text: error.message })
    } else {
      const { data } = supabase.storage.from('payment-qr').getPublicUrl(path)
      setForm((f) => ({ ...f, qr_url: data.publicUrl }))
    }
    setUploading(false)
  }

  async function save() {
    setMsg({ type: '', text: '' })

    if (!form.accepts_gcash && !form.accepts_cash) {
      setMsg({ type: 'error', text: 'Choose at least one payment method.' })
      return
    }
    if (form.accepts_gcash && !form.gcash_number.trim() && !form.qr_url) {
      setMsg({ type: 'error', text: 'Add your GCash number or QR code, or turn GCash off.' })
      return
    }

    setSaving(true)
    const { error } = await supabase.from('barista_payment').upsert({
      barista_id: userId,
      gcash_number: form.gcash_number.trim() || null,
      gcash_name: form.gcash_name.trim() || null,
      qr_url: form.qr_url || null,
      rate: form.rate === '' ? null : Number(form.rate),
      deposit_percent: Math.min(100, Math.max(0, Number(form.deposit_percent) || 0)),
      accepts_gcash: form.accepts_gcash,
      accepts_cash: form.accepts_cash,
      updated_at: new Date().toISOString(),
    })
    setMsg(
      error
        ? { type: 'error', text: error.message }
        : { type: 'ok', text: 'Payment details saved.' }
    )
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6 text-[#8A4F1E]">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  const methodBtn = (key, label, hint) => (
    <button
      type="button"
      onClick={() => toggle(key)}
      aria-pressed={form[key]}
      className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl border-2 p-3 text-sm font-bold transition duration-200 active:scale-[0.97] ${
        form[key]
          ? 'border-[#3B2316] bg-[#F6E6D2] text-[#2B1A12]'
          : 'border-[#E2D3C2] bg-white text-stone-500 hover:border-[#B8742F]'
      }`}
    >
      {label}
      <span className="text-[11px] font-normal">{form[key] ? 'Accepted' : 'Not accepted'}</span>
      <span className="text-[10px] font-normal text-stone-400">{hint}</span>
    </button>
  )

  return (
    <section className={`${card} flex flex-col gap-4 p-5`}>
      <div>
        <h2 className="font-display text-lg font-bold text-[#2B1A12]">Payment details</h2>
        <p className="text-xs text-stone-500">Customers will see this when they pay for a booking.</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[#2B1A12]">Payment methods you accept</p>
        <div className="flex gap-3">
          {methodBtn('accepts_gcash', 'GCash', 'Receipt upload')}
          {methodBtn('accepts_cash', 'Cash', 'Paid on event day')}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Rate per event (₱)
          <IconInput
            icon={Banknote}
            type="number"
            min="0"
            value={form.rate}
            onChange={set('rate')}
            placeholder="2500"
          />
        </label>
        <label className={labelClass}>
          GCash deposit (%)
          <IconInput
            icon={Percent}
            type="number"
            min="0"
            max="100"
            value={form.deposit_percent}
            onChange={set('deposit_percent')}
            placeholder="30"
          />
        </label>
      </div>

      {form.accepts_gcash && (
        <>
          <label className={labelClass}>
            GCash number
            <IconInput
              icon={Smartphone}
              value={form.gcash_number}
              onChange={set('gcash_number')}
              placeholder="09XX XXX XXXX"
              inputMode="tel"
            />
          </label>
          <label className={labelClass}>
            Account name
            <IconInput
              icon={UserRound}
              value={form.gcash_name}
              onChange={set('gcash_name')}
              placeholder="Name on your GCash"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#2B1A12]">GCash QR code (optional)</span>
            {form.qr_url && (
              <img
                src={form.qr_url}
                alt="GCash QR"
                className="h-40 w-40 rounded-xl border border-[#EADCCB] object-contain"
              />
            )}
            <input type="file" accept="image/*" onChange={uploadQr} disabled={uploading} className="text-sm" />
            {uploading && <p className="text-xs text-stone-500">Uploading...</p>}
          </div>
        </>
      )}

      {form.accepts_cash && (
        <p className="rounded-xl bg-[#F6E6D2]/70 p-3 text-xs text-[#4A2B18]">
          Cash is paid directly to you on the event day. You will mark the booking as paid once you
          receive it.
        </p>
      )}

      {msg.text && (
        <p
          role="alert"
          className={`rounded-xl p-3 text-sm ${
            msg.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
          }`}
        >
          {msg.text}
        </p>
      )}

      <button type="button" onClick={save} disabled={saving || uploading} className={btnPrimary}>
        {saving && <Spinner />}
        {saving ? 'Saving...' : 'Save payment details'}
      </button>
    </section>
  )
}