import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../context/StoreContext'
import { btnPrimary, card, labelClass } from '../lib/ui'
import IconInput from './IconInput'
import Spinner from './Spinner'

const EMPTY = { gcash_number: '', gcash_name: '', qr_url: '', rate: '', deposit_percent: 0 }

export default function BaristaPaymentForm() {
  const { userId } = useStore()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!userId) return
    supabase
      .from('barista_payment')
      .select('*')
      .eq('barista_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            gcash_number: data.gcash_number ?? '',
            gcash_name: data.gcash_name ?? '',
            qr_url: data.qr_url ?? '',
            rate: data.rate ?? '',
            deposit_percent: data.deposit_percent ?? 0,
          })
        }
        setLoading(false)
      })
  }, [userId])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function uploadQr(e) {
    const file = e.target.files?.[0]
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
    setSaving(true)
    setMsg({ type: '', text: '' })
    const { error } = await supabase.from('barista_payment').upsert({
      barista_id: userId,
      gcash_number: form.gcash_number.trim() || null,
      gcash_name: form.gcash_name.trim() || null,
      qr_url: form.qr_url || null,
      rate: form.rate === '' ? null : Number(form.rate),
      deposit_percent: Math.min(100, Math.max(0, Number(form.deposit_percent) || 0)),
      updated_at: new Date().toISOString(),
    })
    setMsg(
      error
        ? { type: 'error', text: error.message }
        : { type: 'ok', text: 'Payment details saved.' }
    )
    setSaving(false)
  }

  if (loading) return <Spinner className="h-5 w-5" />

  return (
    <section className={`${card} flex flex-col gap-4 p-5`}>
      <div>
        <h2 className="font-display text-lg font-bold text-[#2B1A12]">Payment details</h2>
        <p className="text-xs text-stone-500">Customers will see this when they pay for a booking.</p>
      </div>

      <label className={labelClass}>
        GCash number
        <IconInput value={form.gcash_number} onChange={set('gcash_number')} placeholder="09XX XXX XXXX" inputMode="tel" />
      </label>
      <label className={labelClass}>
        Account name
        <IconInput value={form.gcash_name} onChange={set('gcash_name')} placeholder="Name on your GCash" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Rate per event (₱)
          <IconInput type="number" min="0" value={form.rate} onChange={set('rate')} placeholder="2500" />
        </label>
        <label className={labelClass}>
          Deposit (%)
          <IconInput type="number" min="0" max="100" value={form.deposit_percent} onChange={set('deposit_percent')} placeholder="30" />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[#2B1A12]">GCash QR code (optional)</span>
        {form.qr_url && (
          <img src={form.qr_url} alt="GCash QR" className="h-40 w-40 rounded-xl border border-[#EADCCB] object-contain" />
        )}
        <input type="file" accept="image/*" onChange={uploadQr} disabled={uploading} className="text-sm" />
        {uploading && <p className="text-xs text-stone-500">Uploading...</p>}
      </div>

      {msg.text && (
        <p
          role="alert"
          className={`rounded-xl p-3 text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}
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