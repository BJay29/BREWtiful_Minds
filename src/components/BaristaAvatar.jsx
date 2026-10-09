export default function BaristaAvatar({ className = '', color = '#C58B4E', src }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className={`${className} rounded-full bg-stone-200 object-cover`}
      />
    )
  }

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill={color} />
      <circle cx="32" cy="25" r="10" fill="#F6E6D2" />
      <path d="M12 58c2-12 12-18 20-18s18 6 20 18z" fill="#F6E6D2" />
    </svg>
  )
}