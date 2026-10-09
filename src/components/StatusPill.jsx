const styles = {
  pending: 'bg-[#FFF1D6] text-[#7A4B00]',
  accepted: 'bg-[#E6EFE4] text-[#2F5F3A]',
  completed: 'bg-[#E3ECF5] text-[#244B73]',
  declined: 'bg-[#F6DEDA] text-[#8A2A1E]',
  cancelled: 'bg-stone-200 text-stone-700',
}

export default function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}