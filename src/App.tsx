import { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import GeekoMap from "./GeekoMap";
import { GEEKO_OUTLETS, haversineDistance } from "./data";
import { OutletWithDistance } from "./types";

// Import gambar logo
// Sesuaikan path ini jika folder img Anda berada di tempat lain (contoh: '../img/bggeeko.jpg')
import geekoLogo from "./img/bggeeko.png";

const RADIUS_KM = 10;

export default function App() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [nearbyOutlets, setNearbyOutlets] = useState<OutletWithDistance[]>([]);
  const [allOutletsWithDist, setAllOutletsWithDist] = useState<
    OutletWithDistance[]
  >([]);

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
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
          );
          const data = await res.json();
          setUserAddress(
            data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          );
        } catch {
          setUserAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Akses lokasi ditolak. Izinkan akses lokasi di browser kamu."
            : "Gagal mendapatkan lokasi. Pastikan GPS aktif.",
        );
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    // Menghitung jarak dan mengurutkan (sort) dari yang terdekat
    const withDist: OutletWithDistance[] = GEEKO_OUTLETS.map((outlet) => ({
      ...outlet,
      distance: haversineDistance(
        userLocation.lat,
        userLocation.lng,
        outlet.lat,
        outlet.lng,
      ),
    })).sort((a, b) => a.distance - b.distance);

    setAllOutletsWithDist(withDist);
    setNearbyOutlets(withDist.filter((o) => o.distance <= RADIUS_KM));
  }, [userLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-3 text-center sm:text-left">
            {/* LOGO DIKURANGI SEDIKIT UKURANNYA */}
            {/* Menggunakan w-48 (192px) untuk HP */}
            <div className="w-48 sm:w-40 flex-shrink-0 flex items-center justify-center overflow-hidden mb-2 sm:mb-0">
              <img
                src={geekoLogo}
                alt="Logo Geeko"
                className="w-full h-auto object-contain"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-montserrat text-yellow-300 tracking-tight leading-tight">
              GEEKO KOMPUTER INDONESIA
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-white font-normal font-montserrat tracking-tight text-center">
            Temukan outlet GEEKO terdekat dari lokasimu
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Location Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-yellow-300 px-5 py-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-black" />
            <span className="text-black font-semibold text-sm">
              Lokasi Kamu saat ini :
            </span>
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
                    {userAddress ||
                      `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`}
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

        {/* Tabel Semua Outlet Diurutkan Terdekat */}
        {userLocation && allOutletsWithDist.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-center font-bold text-black text-base leading-none">
                Hasil pencarian outlet GEEKO diurutkan berdasarkan jarak
                terdekat dari lokasimu
                <span className="text-gray-800 font-normal text-xs block mt-2">
                  Klik tombol Maps untuk melihat lokasi outlet di Google Maps
                </span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-12">
                      No
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Outlet
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">
                      Alamat
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Jarak
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Maps
                    </th>
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
                      <td className="px-4 py-3 text-center text-gray-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {outlet.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                        {outlet.address || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {/* UPDATE LOGIKA JARAK DI SINI */}
                        <span
                          className={`inline-block font-bold px-2 py-0.5 rounded text-xs ${
                            outlet.distance <= 0.05
                              ? "bg-blue-100 text-blue-700" // Warna khusus untuk Di Lokasi
                              : outlet.distance <= RADIUS_KM
                                ? "bg-green-100 text-green-700" // Warna untuk dalam radius
                                : "bg-gray-100 text-gray-500" // Warna untuk di luar radius
                          }`}
                        >
                          {outlet.distance <= 0.05
                            ? "Di Lokasi"
                            : `${outlet.distance.toFixed(2)} km`}
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
