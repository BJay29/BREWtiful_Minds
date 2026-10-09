import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { TILE_ATTRIBUTION, TILE_URL, pinIcon } from '../lib/mapSetup'

export default function MapView({ lat, lng, className = 'h-56' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  // Create the map once.
  useEffect(() => {
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([lat, lng], 16)
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map)
    markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map)
    mapRef.current = map

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

  // Move the view and pin when the coordinates change.
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    markerRef.current.setLatLng([lat, lng])
    mapRef.current.setView([lat, lng], mapRef.current.getZoom())
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      className={`isolate w-full overflow-hidden rounded-2xl border border-[#EADCCB] ${className}`}
    />
  )
}