import { useEffect, useRef, useState } from "react";
import { GeekoOutlet, OutletWithDistance } from "./types";

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

interface MapProps {
  userLat: number;
  userLng: number;
  outlets: GeekoOutlet[];
  nearbyOutlets: OutletWithDistance[];
  radiusKm: number;
}

export default function GeekoMap({
  userLat,
  userLng,
  outlets,
  nearbyOutlets,
  radiusKm,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<Window["L"]["map"]> | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    let waitTimer: ReturnType<typeof setTimeout>;

    const renderMap = (L: Window["L"]) => {
      if (cancelled || !mapRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([userLat, userLng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.circle([userLat, userLng], {
        radius: radiusKm * 1000,
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(map);

      const userIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:28px;height:28px;">
            <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);z-index:2;"></div>
            <div style="position:absolute;inset:-4px;background:#3b82f6;opacity:0.3;border-radius:50%;animation:pulse-ring 1.5s ease-out infinite;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Lokasi Kamu</b>")
        .openPopup();

      const nearbyIds = new Set(nearbyOutlets.map((o) => o.id));

      outlets.forEach((outlet) => {
        const isNearby = nearbyIds.has(outlet.id);
        const nearbyData = nearbyOutlets.find((o) => o.id === outlet.id);

        const outletIcon = L.divIcon({
          className: "",
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="
                background:${isNearby ? "#111827" : "#6b7280"};
                color:white;
                font-weight:700;
                font-size:11px;
                padding:4px 8px;
                border-radius:6px;
                white-space:nowrap;
                box-shadow:0 2px 6px rgba(0,0,0,0.4);
                border:2px solid white;
              ">G</div>
              <div style="width:2px;height:6px;background:${isNearby ? "#111827" : "#6b7280"};"></div>
              <div style="width:6px;height:6px;background:${isNearby ? "#111827" : "#6b7280"};border-radius:50%;"></div>
            </div>
          `,
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -40],
        });

        const distanceText = nearbyData
          ? `<br/><span style="color:#16a34a;font-weight:600">${nearbyData.distance.toFixed(2)} km dari lokasimu</span>`
          : "";

        L.marker([outlet.lat, outlet.lng], { icon: outletIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px;">
              <b style="font-size:13px;">${outlet.name}</b><br/>
              <span style="font-size:11px;color:#6b7280;">${outlet.address}</span>
              ${distanceText}
              <br/><a href="${outlet.mapsUrl}" target="_blank" style="color:#2563eb;font-size:11px;">Buka di Google Maps &rarr;</a>
            </div>
          `);
      });

      mapInstanceRef.current = map;
    };

    // Poll for window.L (CDN script may still be loading)
    const start = Date.now();
    const tryRender = () => {
      if (cancelled) return;
      if (window.L) {
        try {
          renderMap(window.L);
        } catch {
          setMapError(true);
        }
      } else if (Date.now() - start < 8000) {
        waitTimer = setTimeout(tryRender, 100);
      } else {
        setMapError(true);
      }
    };
    tryRender();

    return () => {
      cancelled = true;
      clearTimeout(waitTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLat, userLng, outlets, nearbyOutlets, radiusKm]);

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 text-gray-400 text-sm">
        Peta tidak dapat dimuat. Lihat daftar outlet di bawah.
      </div>
    );
  }

  return (
    <div ref={mapRef} style={{ width: "100%", height: "400px" }} className="rounded-none" />
  );
}
