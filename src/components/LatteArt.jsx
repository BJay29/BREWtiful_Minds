export default function LatteArt({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="#E9DCCB" />
      <circle cx="50" cy="50" r="41" fill="#FBF6EF" />
      <circle cx="50" cy="50" r="33" fill="#6B3F24" />
      <path d="M50 74C28 60 33 40 50 47C67 40 72 60 50 74Z" fill="#F6E6D2" />
      <path d="M50 66C40 58 42 50 50 53C58 50 60 58 50 66Z" fill="#6B3F24" />
    </svg>
  )
}