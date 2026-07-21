export interface GeekoOutlet {
  id: number;
  name: string;
  lat: number;
  lng: number;
  mapsUrl: string;
  address: string;
}

export interface OutletWithDistance extends GeekoOutlet {
  distance: number;
}
