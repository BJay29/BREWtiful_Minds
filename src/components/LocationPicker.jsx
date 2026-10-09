import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, MapPin, Search } from 'lucide-react'
import { DEFAULT_CENTER, getCurrentPosition, reverseGeocode, searchPlaces } from '../lib/geo'
import { TILE_ATTRIBUTION, TILE_URL, pinIcon } from '../lib/mapSetup'
import { btnOutline } from '../lib/ui'
import IconInput from './IconInput'
import Spinner from './Spinner'

// value: { address: string, lat: number | null, lng: number | null }
// onChange receives: { address, lat, lng, place }
export default function LocationPicker({ value, onChange, placeholder = 'Search an address or landmark' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  const applyRef = useRef(null)

  const [query, setQuery] = useState(value.address ?? '')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    valueRef.current = value
    onChangeRef.current = onChange
  })

  function placeMarker(lat, lng, fly) {
    const map = mapRef.current
    if (!map) return

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map)
      markerRef.current.on('dragend', () => {
        const p = markerRef.current.getLatLng()
        applyRef.current(p.lat, p.lng, null, false)
      })
    } else {
      markerRef.current.setLatLng([lat, lng])
    }

    if (fly) map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.6 })
  }

  async function apply(lat, lng, known, fly = true) {
    setError('')
    placeMarker(lat, lng, fly)

    if (known) {
      setQuery(known.label)
      onChangeRef.current({ address: known.label, lat, lng, place: known.place })
      return
    }

    onChangeRef.current({ ...valueRef.current, lat, lng })
    setBusy('resolve')
    try {
      const r = await reverseGeocode(lat, lng)
      setQuery(r.label)
      onChangeRef.current({ address: r.label, lat, lng, place: r.place })
    } catch {
      // Keep the pin even if the address lookup fails.
    } finally {
      setBusy('')
    }
  }

  useEffect(() => {
    applyRef.current = apply
  })

  useEffect(() => {
    const start = valueRef.current
    const hasPin = start.lat != null && start.lng != null

    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
      hasPin ? [start.lat, start.lng] : DEFAULT_CENTER,
      hasPin ? 16 : 13
    )
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map)
    mapRef.current = map

    if (hasPin) placeMarker(start.lat, start.lng, false)
    map.on('click', (e) => applyRef.current(e.latlng.lat, e.latlng.lng, null, false))

    // Make sure tiles fill the container if the layout settles after mount.
    const t = setTimeout(() => map.invalidateSize(), 200)

    return () => {
      clearTimeout(t)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch() {
    const q = query.trim()
    if (q.length < 3) {
      setError('Type at least 3 characters to search.')
      return
    }
    setError('')
    setResults([])
    setBusy('search')
    try {
      const found = await searchPlaces(q)
      if (found.length === 0) setError('No results. Try adding the barangay or city.')
      setResults(found)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  async function handleLocate() {
    setError('')
    setResults([])
    setBusy('locate')
    try {
      const p = await getCurrentPosition()
      setBusy('')
      await apply(p.lat, p.lng, null, true)
    } catch (err) {
      setError(err.message)
      setBusy('')
    }
  }

  function pick(result) {
    setResults([])
    apply(result.lat, result.lng, result, true)
  }

  const hasPin = value.lat != null && value.lng != null

  return (
    <div className="flex flex-col gap-2.5">
      <IconInput
        icon={MapPin}
        aria-label="Address"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange({ ...value, address: e.target.value })
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
          }
        }}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSearch}
          disabled={Boolean(busy)}
          className={`${btnOutline} h-11 flex-1 px-3 text-sm`}
        >
          {busy === 'search' ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          Search
        </button>
        <button
          type="button"
          onClick={handleLocate}
          disabled={Boolean(busy)}
          className={`${btnOutline} h-11 flex-1 px-3 text-sm`}
        >
          {busy === 'locate' ? <Spinner className="h-4 w-4" /> : <LocateFixed className="h-4 w-4" />}
          Use my location
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <ul className="overflow-hidden rounded-xl border border-[#EADCCB] bg-white text-sm shadow-sm">
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lng}-${i}`} className="border-b border-[#EADCCB] last:border-b-0">
              <button
                type="button"
                onClick={() => pick(r)}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition hover:bg-[#F6E6D2]"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B8742F]" />
                <span>{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={containerRef}
        className="isolate h-56 w-full overflow-hidden rounded-2xl border border-[#EADCCB] md:h-72"
      />

      <p className="text-xs text-stone-500">
        {busy === 'resolve'
          ? 'Finding the address...'
          : hasPin
            ? 'Pin set. Drag the pin or tap the map to adjust it.'
            : 'Search an address, use your location, or tap the map to drop a pin.'}
      </p>
    </div>
  )
}