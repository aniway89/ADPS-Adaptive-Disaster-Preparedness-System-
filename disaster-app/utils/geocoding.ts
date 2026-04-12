// utils/geocoding.ts
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const response = await fetch(url);
    const data = await response.json();
    const countryCode = data.address?.country_code?.toUpperCase();
    return countryCode || null;
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return null;
  }
}