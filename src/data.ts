import { GeekoOutlet } from "./types";

export const GEEKO_OUTLETS: GeekoOutlet[] = [
  {
    id: 1,
    name: "GEEKO Keputih",
    lat: -7.2903676,
    lng: 112.7961416,
    mapsUrl: "https://maps.app.goo.gl/61wuv1cHV14grJe37",
    address: "Keputih, Sukolilo, Surabaya",
  },
  {
    id: 2,
    name: "GEEKO UBAYA",
    lat: -7.3178586,
    lng: 112.7674504,
    mapsUrl: "https://maps.app.goo.gl/fNrY216e2HwmFHXC7",
    address: "Kalirungkut, Rungkut, Surabaya",
  },
  {
    id: 3,
    name: "GEEKO UNESA Ketintang",
    lat: -7.3096123,
    lng: 112.7308368,
    mapsUrl: "https://maps.app.goo.gl/vM29XvSvC6c3hYMr8",
    address: "Ketintang, Gayungan, Surabaya",
  },
  {
    id: 4,
    name: "GEEKO ITS",
    lat: -7.280556,
    lng: 112.7884876,
    mapsUrl: "https://maps.app.goo.gl/ucwHzpP2fY1N2PYN9",
    address: "Keputih, Sukolilo, Surabaya",
  },
  {
    id: 5,
    name: "GEEKO Wiyung",
    lat: -7.3088904,
    lng: 112.6743967,
    mapsUrl: "https://maps.app.goo.gl/dxVF5i6vPJWV8Ain7",
    address: "Wiyung, Surabaya",
  },
  {
    id: 6,
    name: "GEEKO UNAIR",
    lat: -7.2679536,
    lng: 112.7749022,
    mapsUrl: "https://maps.app.goo.gl/v2zYE7mFZnKGAcdTA",
    address: "Mulyorejo, Surabaya",
  },
  {
    id: 7,
    name: "GEEKO UPN",
    lat: -7.3322426,
    lng: 112.7894012,
    mapsUrl: "https://maps.app.goo.gl/bRcGk6fXyXkdCiMt5",
    address: "Gunung Anyar, Surabaya",
  },
];

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
