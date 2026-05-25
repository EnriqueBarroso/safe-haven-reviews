"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import Link from "next/link"
import "leaflet/dist/leaflet.css"

// Leaflet no resuelve bien los assets del marker por defecto con webpack.
// Usamos un DivIcon personalizado alineado con la paleta del sitio.
const pinIcon = new L.DivIcon({
  html: `
    <div style="
      width: 28px; height: 28px;
      background: #00ff87;
      border: 3px solid #09090b;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.45);
    "></div>
  `,
  className: "",
  iconSize:    [28, 28],
  iconAnchor:  [14, 28],
  popupAnchor: [0, -30],
})

export interface MapProfile {
  id:   string
  name: string
  slug: string
  city: string
  lat:  number
  lng:  number
}

interface MapViewProps {
  profiles: MapProfile[]
}

export function MapView({ profiles }: MapViewProps) {
  // Leaflet espera window — el componente siempre se carga con ssr:false
  // pero añadimos el fix de los iconos por defecto igualmente.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
  }, [])

  return (
    <MapContainer
      center={[40.4, -3.7]}
      zoom={6}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#09090b" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {profiles.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon}>
          <Popup>
            <div className="space-y-1 text-sm min-w-[140px]">
              <p className="font-semibold text-base leading-tight">{p.name}</p>
              <p className="text-gray-500 text-xs">{p.city}</p>
              <Link
                href={`/profiles/${p.slug}`}
                className="inline-block mt-2 text-xs font-medium text-[#00cc6a] hover:underline"
              >
                Ver perfil →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
