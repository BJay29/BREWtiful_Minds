const STYLES = {
  unpaid: { label: 'Unpaid', cls: 'bg-stone-100 text-stone-600' },
  proof_submitted: { label: 'Proof sent', cls: 'bg-amber-100 text-amber-800' },
  paid: { label: 'Paid', cls: 'bg-green-100 text-green-800' },
}

export default function PaymentPill({ status = 'unpaid', method = null }) {
  let s = STYLES[status] ?? STYLES.unpaid
  if (status === 'unpaid' && method === 'cash') {
    s = { label: 'Cash on event day', cls: 'bg-[#F6E6D2] text-[#6B3F24]' }
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
  )
}