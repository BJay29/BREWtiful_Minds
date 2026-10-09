const time = (iso) =>
  new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })

export default function MessageBubble({ mine, body, createdAt }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
          mine
            ? 'rounded-br-md bg-[#3B2316] text-[#F6E9D8]'
            : 'rounded-bl-md border border-[#EADCCB] bg-white text-[#2B1A12]'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{body}</p>
        <p className={`mt-1 text-[10px] ${mine ? 'text-[#D9BFA3]' : 'text-stone-400'}`}>
          {time(createdAt)}
        </p>
      </div>
    </div>
  )
}