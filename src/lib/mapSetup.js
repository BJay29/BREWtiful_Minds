import L from 'leaflet'

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors'

export const pinIcon = L.divIcon({
  className: '',
  html: `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 3px rgba(0,0,0,.35))"><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#3B2316"/><circle cx="18" cy="18" r="8" fill="#F6E6D2"/></svg>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
})