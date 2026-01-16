// const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY

const GOOGLE_MAPS_API_KEY = 'AIzaSyCHSVIlzStq44210Ije3TGKvtxhA0achmI';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export interface AddressComponents {
  address_line1: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
}

class GeocodingService {
  async geocodeAddress(address: AddressComponents): Promise<GeocodeResult | null> {
    try {
      const fullAddress = [
        address.address_line1,
        address.city,
        address.state,
        address.postal_code,
        address.country
      ].filter(Boolean).join(', ');

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: data.results[0].formatted_address
        };
      } else {
        console.error('Geocoding failed:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }
}

export const geocodingService = new GeocodingService();