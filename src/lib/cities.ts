import { supabase } from './supabase';

export type City = {
  city_id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
};

export async function searchCities(query: string): Promise<City[]> {
  if (!query || query.length < 2) return [];

  try {
    const { data, error } = await supabase
      .rpc('search_cities', { 
        search_term: query,
        limit_count: 8
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

export async function validateCity(cityName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('city')
      .select('name')
      .ilike('name', cityName)
      .single();

    if (error) return false;
    return !!data;
  } catch (error) {
    console.error('Error validating city:', error);
    return false;
  }
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export async function calculateDistance(city1: string, city2: string): Promise<number> {
  try {
    // Get both cities in a single query for efficiency
    const { data: cities, error } = await supabase
      .from('city')
      .select('name, lat, lng')
      .in('name', [city1, city2]);

    if (error || !cities || cities.length !== 2) {
      console.error('Error fetching cities:', error);
      return Infinity;
    }

    const city1Data = cities.find(c => c.name.toLowerCase() === city1.toLowerCase());
    const city2Data = cities.find(c => c.name.toLowerCase() === city2.toLowerCase());

    if (!city1Data || !city2Data) {
      console.error('Cities not found:', { city1, city2 });
      return Infinity;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(city2Data.lat - city1Data.lat);
    const dLon = toRad(city2Data.lng - city1Data.lng);
    const lat1 = toRad(city1Data.lat);
    const lat2 = toRad(city2Data.lat);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return Infinity;
  }
}