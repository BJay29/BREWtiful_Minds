export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`h-10 shrink-0 rounded-full border px-5 text-sm font-semibold transition duration-200 active:scale-95 ${
            value === t
              ? 'border-[#3B2316] bg-[#3B2316] text-[#F6E9D8] shadow-sm'
              : 'border-[#E2D3C2] bg-white text-[#2B1A12] hover:border-[#B8742F]'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}