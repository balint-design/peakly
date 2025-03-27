import citiesData from 'cities.json';

type City = {
  name: string;
  lat: number;
  lng: number;
  country: string;
  state: string;
  population: number;
};

// Filter cities from Germany, Switzerland, and Austria and sort by population
const cities = (citiesData as City[])
  .filter(city => ['DE', 'CH', 'AT'].includes(city.country))
  .sort((a, b) => b.population - a.population)
  .map(city => ({
    name: city.name,
    state: city.state,
    country: city.country === 'DE' ? '🇩🇪' : 
            city.country === 'CH' ? '🇨🇭' : 
            '🇦🇹',
    lat: city.lat,
    lng: city.lng
  }));

export function searchCities(query: string) {
  if (!query) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return cities
    .filter(city => 
      city.name.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 8);
}

export function validateCity(cityName: string): boolean {
  return cities.some(city => 
    city.name.toLowerCase() === cityName.toLowerCase()
  );
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDistance(city1: string, city2: string): number {
  const city1Data = cities.find(c => c.name.toLowerCase() === city1.toLowerCase());
  const city2Data = cities.find(c => c.name.toLowerCase() === city2.toLowerCase());

  if (!city1Data || !city2Data) return Infinity;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(city2Data.lat - city1Data.lat);
  const dLon = toRad(city2Data.lng - city1Data.lng);
  const lat1 = toRad(city1Data.lat);
  const lat2 = toRad(city2Data.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}