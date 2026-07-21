import { useState, useEffect } from "react";
import { MapPin, Navigation, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import GeekoMap from "./GeekoMap";
import { GEEKO_OUTLETS, haversineDistance } from "./data";
import { OutletWithDistance } from "./types";

const RADIUS_KM = 10;

export default function App() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [nearbyOutlets, setNearbyOutlets] = useState<OutletWithDistance[]>([]);
  const [allOutletsWithDist, setAllOutletsWithDist] = useState<OutletWithDistance[]>([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Browser tidak mendukung Geolocation.");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        setLoadingLocation(false);

        // Reverse geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
          );
          const data = await res.json();
          setUserAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } catch {
          setUserAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Akses lokasi ditolak. Izinkan akses lokasi di browser kamu."
            : "Gagal mendapatkan lokasi. Pastikan GPS aktif."
        );
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const withDist: OutletWithDistance[] = GEEKO_OUTLETS.map((outlet) => ({
      ...outlet,
      distance: haversineDistance(userLocation.lat, userLocation.lng, outlet.lat, outlet.lng),
    })).sort((a, b) => a.distance - b.distance);

    setAllOutletsWithDist(withDist);
    setNearbyOutlets(withDist.filter((o) => o.distance <= RADIUS_KM));
  }, [userLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">G</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">GEEKO</h1>
          </div>
          <p className="text-sm text-gray-500 font-medium">Temukan outlet GEEKO terdekat dari lokasimu</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Location Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-green-600 px-5 py-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-white" />
            <span className="text-white font-semibold text-sm">Lokasi Kamu :</span>
          </div>

          <div className="px-5 py-4">
            {loadingLocation && (
              <div className="flex items-center gap-3 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                <span className="text-sm">Mendeteksi lokasi kamu...</span>
              </div>
            )}

            {locationError && (
              <div className="flex items-start gap-3 text-red-600">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{locationError}</span>
              </div>
            )}

            {userLocation && !loadingLocation && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    {userAddress || `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {userLocation && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <GeekoMap
              userLat={userLocation.lat}
              userLng={userLocation.lng}
              outlets={GEEKO_OUTLETS}
              nearbyOutlets={nearbyOutlets}
              radiusKm={RADIUS_KM}
            />
          </div>
        )}

        {/* Nearby Table */}
        {userLocation && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-center font-bold text-gray-800 text-base">
                Outlet {RADIUS_KM} KM terdekat dari{" "}
                <span className="italic text-green-700">lokasimu</span>
              </h2>
            </div>

            {nearbyOutlets.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                Tidak ada outlet dalam radius {RADIUS_KM} km dari lokasimu.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 w-12">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Outlet</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Jarak</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Maps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nearbyOutlets.map((outlet, idx) => (
                      <tr
                        key={outlet.id}
                        className={`border-b border-gray-100 transition-colors hover:bg-green-50 ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-4 py-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{outlet.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-xs">
                            {outlet.distance.toFixed(2)} km
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <a
                            href={outlet.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Maps
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All outlets sorted by distance */}
        {userLocation && allOutletsWithDist.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-center font-bold text-gray-800 text-base">
                Semua Outlet <span className="italic text-gray-500">diurutkan terdekat</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-12">No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Outlet</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Alamat</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Jarak</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Maps</th>
                  </tr>
                </thead>
                <tbody>
                  {allOutletsWithDist.map((outlet, idx) => (
                    <tr
                      key={outlet.id}
                      className={`border-b border-gray-100 transition-colors hover:bg-green-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-4 py-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{outlet.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{outlet.address}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block font-bold px-2 py-0.5 rounded text-xs ${
                            outlet.distance <= RADIUS_KM
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {outlet.distance.toFixed(2)} km
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={outlet.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Maps
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-gray-400 pb-4">
          Jarak dihitung berdasarkan garis lurus menggunakan formula Haversine
        </footer>
      </main>
    </div>
  );
}
