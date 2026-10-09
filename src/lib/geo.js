const NOMINATIM = 'https://nominatim.openstreetmap.org'

// Naga City, Camarines Sur
export const DEFAULT_CENTER = [13.6218, 123.1948]

export function haversineKm(a, b) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export function formatDistance(km) {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`
  return `${km.toFixed(1)} km`
}

export function mapsLink(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

export function directionsLink(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function shortPlace(address = {}) {
  const area = address.suburb || address.village || address.neighbourhood || address.quarter
  const town = address.city || address.town || address.municipality || address.county
  return [area, town].filter(Boolean).join(', ')
}

async function getJson(url, failMessage) {
  let res
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } })
  } catch {
    throw new Error('Network error. Check your connection and try again.')
  }
  if (!res.ok) throw new Error(failMessage)
  return res.json()
}

export async function searchPlaces(query) {
  const url =
    `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=ph` +
    `&accept-language=en&q=${encodeURIComponent(query)}`
  const rows = await getJson(url, 'Could not search for that address. Please try again.')
  return rows.map((r) => ({
    label: r.display_name,
    lat: Number(r.lat),
    lng: Number(r.lon),
    place: shortPlace(r.address),
  }))
}

export async function reverseGeocode(lat, lng) {
  const url =
    `${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=en` +
    `&lat=${lat}&lon=${lng}`
  const r = await getJson(url, 'Could not look up the address for this pin.')
  return { label: r.display_name ?? '', place: shortPlace(r.address) }
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Your browser does not support location.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        reject(
          new Error(
            err.code === 1
              ? 'Location permission was denied. Allow it in your browser settings, or search for an address instead.'
              : 'Could not get your location. Try searching for an address instead.'
          )
        ),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    )
  })
}