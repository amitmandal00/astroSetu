/**
 * Local database of Indian cities with coordinates
 * Used as fallback when Nominatim API is unavailable or rate-limited
 */

export interface CityData {
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export const INDIAN_CITIES_DB: CityData[] = [
  // Major cities
  { name: "Mumbai", state: "Maharashtra", country: "India", latitude: 19.0760, longitude: 72.8777, displayName: "Mumbai, Maharashtra, India" },
  { name: "Delhi", state: "Delhi", country: "India", latitude: 28.6139, longitude: 77.2090, displayName: "Delhi, Delhi, India" },
  { name: "Bangalore", state: "Karnataka", country: "India", latitude: 12.9716, longitude: 77.5946, displayName: "Bangalore, Karnataka, India" },
  { name: "Hyderabad", state: "Telangana", country: "India", latitude: 17.3850, longitude: 78.4867, displayName: "Hyderabad, Telangana, India" },
  { name: "Chennai", state: "Tamil Nadu", country: "India", latitude: 13.0827, longitude: 80.2707, displayName: "Chennai, Tamil Nadu, India" },
  { name: "Kolkata", state: "West Bengal", country: "India", latitude: 22.5726, longitude: 88.3639, displayName: "Kolkata, West Bengal, India" },
  { name: "Pune", state: "Maharashtra", country: "India", latitude: 18.5204, longitude: 73.8567, displayName: "Pune, Maharashtra, India" },
  { name: "Ahmedabad", state: "Gujarat", country: "India", latitude: 23.0225, longitude: 72.5714, displayName: "Ahmedabad, Gujarat, India" },
  { name: "Jaipur", state: "Rajasthan", country: "India", latitude: 26.9124, longitude: 75.7873, displayName: "Jaipur, Rajasthan, India" },
  { name: "Surat", state: "Gujarat", country: "India", latitude: 21.1702, longitude: 72.8311, displayName: "Surat, Gujarat, India" },
  { name: "Lucknow", state: "Uttar Pradesh", country: "India", latitude: 26.8467, longitude: 80.9462, displayName: "Lucknow, Uttar Pradesh, India" },
  { name: "Kanpur", state: "Uttar Pradesh", country: "India", latitude: 26.4499, longitude: 80.3319, displayName: "Kanpur, Uttar Pradesh, India" },
  { name: "Nagpur", state: "Maharashtra", country: "India", latitude: 21.1458, longitude: 79.0882, displayName: "Nagpur, Maharashtra, India" },
  { name: "Indore", state: "Madhya Pradesh", country: "India", latitude: 22.7196, longitude: 75.8577, displayName: "Indore, Madhya Pradesh, India" },
  { name: "Thane", state: "Maharashtra", country: "India", latitude: 19.2183, longitude: 72.9781, displayName: "Thane, Maharashtra, India" },
  { name: "Bhopal", state: "Madhya Pradesh", country: "India", latitude: 23.2599, longitude: 77.4126, displayName: "Bhopal, Madhya Pradesh, India" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", country: "India", latitude: 17.6868, longitude: 83.2185, displayName: "Visakhapatnam, Andhra Pradesh, India" },
  { name: "Patna", state: "Bihar", country: "India", latitude: 25.5941, longitude: 85.1376, displayName: "Patna, Bihar, India" },
  { name: "Vadodara", state: "Gujarat", country: "India", latitude: 22.3072, longitude: 73.1812, displayName: "Vadodara, Gujarat, India" },
  { name: "Ghaziabad", state: "Uttar Pradesh", country: "India", latitude: 28.6692, longitude: 77.4538, displayName: "Ghaziabad, Uttar Pradesh, India" },
  
  // More cities
  { name: "Ludhiana", state: "Punjab", country: "India", latitude: 30.9010, longitude: 75.8573, displayName: "Ludhiana, Punjab, India" },
  { name: "Agra", state: "Uttar Pradesh", country: "India", latitude: 27.1767, longitude: 78.0081, displayName: "Agra, Uttar Pradesh, India" },
  { name: "Nashik", state: "Maharashtra", country: "India", latitude: 19.9975, longitude: 73.7898, displayName: "Nashik, Maharashtra, India" },
  { name: "Faridabad", state: "Haryana", country: "India", latitude: 28.4089, longitude: 77.3178, displayName: "Faridabad, Haryana, India" },
  { name: "Meerut", state: "Uttar Pradesh", country: "India", latitude: 28.9845, longitude: 77.7064, displayName: "Meerut, Uttar Pradesh, India" },
  { name: "Rajkot", state: "Gujarat", country: "India", latitude: 22.3039, longitude: 70.8022, displayName: "Rajkot, Gujarat, India" },
  { name: "Varanasi", state: "Uttar Pradesh", country: "India", latitude: 25.3176, longitude: 82.9739, displayName: "Varanasi, Uttar Pradesh, India" },
  { name: "Srinagar", state: "Jammu and Kashmir", country: "India", latitude: 34.0837, longitude: 74.7973, displayName: "Srinagar, Jammu and Kashmir, India" },
  { name: "Amritsar", state: "Punjab", country: "India", latitude: 31.6340, longitude: 74.8723, displayName: "Amritsar, Punjab, India" },
  { name: "Chandigarh", state: "Chandigarh", country: "India", latitude: 30.7333, longitude: 76.7794, displayName: "Chandigarh, Chandigarh, India" },
  { name: "Jodhpur", state: "Rajasthan", country: "India", latitude: 26.2389, longitude: 73.0243, displayName: "Jodhpur, Rajasthan, India" },
  { name: "Coimbatore", state: "Tamil Nadu", country: "India", latitude: 11.0168, longitude: 76.9558, displayName: "Coimbatore, Tamil Nadu, India" },
  { name: "Madurai", state: "Tamil Nadu", country: "India", latitude: 9.9252, longitude: 78.1198, displayName: "Madurai, Tamil Nadu, India" },
  { name: "Raipur", state: "Chhattisgarh", country: "India", latitude: 21.2514, longitude: 81.6296, displayName: "Raipur, Chhattisgarh, India" },
  { name: "Kochi", state: "Kerala", country: "India", latitude: 9.9312, longitude: 76.2673, displayName: "Kochi, Kerala, India" },
  { name: "Guwahati", state: "Assam", country: "India", latitude: 26.1445, longitude: 91.7362, displayName: "Guwahati, Assam, India" },
  { name: "Bhubaneswar", state: "Odisha", country: "India", latitude: 20.2961, longitude: 85.8245, displayName: "Bhubaneswar, Odisha, India" },
  { name: "Mysore", state: "Karnataka", country: "India", latitude: 12.2958, longitude: 76.6394, displayName: "Mysore, Karnataka, India" },
  { name: "Tiruchirappalli", state: "Tamil Nadu", country: "India", latitude: 10.7905, longitude: 78.7047, displayName: "Tiruchirappalli, Tamil Nadu, India" },
  
  // Jharkhand cities (including Noamundi)
  { name: "Noamundi", state: "Jharkhand", country: "India", latitude: 22.1500, longitude: 85.5000, displayName: "Noamundi, Jharkhand, India" },
  { name: "Ranchi", state: "Jharkhand", country: "India", latitude: 23.3441, longitude: 85.3096, displayName: "Ranchi, Jharkhand, India" },
  { name: "Jamshedpur", state: "Jharkhand", country: "India", latitude: 22.8046, longitude: 86.2029, displayName: "Jamshedpur, Jharkhand, India" },
  { name: "Dhanbad", state: "Jharkhand", country: "India", latitude: 23.7957, longitude: 86.4304, displayName: "Dhanbad, Jharkhand, India" },
  { name: "Bokaro", state: "Jharkhand", country: "India", latitude: 23.6693, longitude: 85.9783, displayName: "Bokaro, Jharkhand, India" },
  
  // More states coverage
  { name: "Dehradun", state: "Uttarakhand", country: "India", latitude: 30.3165, longitude: 78.0322, displayName: "Dehradun, Uttarakhand, India" },
  { name: "Shimla", state: "Himachal Pradesh", country: "India", latitude: 31.1048, longitude: 77.1734, displayName: "Shimla, Himachal Pradesh, India" },
  { name: "Panaji", state: "Goa", country: "India", latitude: 15.4909, longitude: 73.8278, displayName: "Panaji, Goa, India" },
  { name: "Imphal", state: "Manipur", country: "India", latitude: 24.8170, longitude: 93.9368, displayName: "Imphal, Manipur, India" },
  { name: "Aizawl", state: "Mizoram", country: "India", latitude: 23.7271, longitude: 92.7176, displayName: "Aizawl, Mizoram, India" },
  { name: "Kohima", state: "Nagaland", country: "India", latitude: 25.6750, longitude: 94.1086, displayName: "Kohima, Nagaland, India" },
  { name: "Agartala", state: "Tripura", country: "India", latitude: 23.8315, longitude: 91.2868, displayName: "Agartala, Tripura, India" },
  { name: "Gangtok", state: "Sikkim", country: "India", latitude: 27.3389, longitude: 88.6065, displayName: "Gangtok, Sikkim, India" },
  { name: "Itanagar", state: "Arunachal Pradesh", country: "India", latitude: 27.0844, longitude: 93.6053, displayName: "Itanagar, Arunachal Pradesh, India" },
  { name: "Shillong", state: "Meghalaya", country: "India", latitude: 25.5788, longitude: 91.8933, displayName: "Shillong, Meghalaya, India" },
];

/**
 * Search for cities in the local database
 */
export function searchLocalCities(query: string, limit: number = 10): CityData[] {
  const lowerQuery = query.toLowerCase().trim();
  if (lowerQuery.length < 2) return [];
  
  const matches: CityData[] = [];
  
  for (const city of INDIAN_CITIES_DB) {
    const nameMatch = city.name.toLowerCase().includes(lowerQuery);
    const stateMatch = city.state.toLowerCase().includes(lowerQuery);
    const displayMatch = city.displayName.toLowerCase().includes(lowerQuery);
    
    if (nameMatch || stateMatch || displayMatch) {
      matches.push(city);
      if (matches.length >= limit) break;
    }
  }
  
  // Prioritize exact name matches
  matches.sort((a, b) => {
    const aExact = a.name.toLowerCase().startsWith(lowerQuery);
    const bExact = b.name.toLowerCase().startsWith(lowerQuery);
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });
  
  return matches;
}

/**
 * Try to resolve coordinates for a place name
 * First checks local database, then falls back to API if needed
 */
export function resolvePlaceCoordinates(placeName: string): CityData | null {
  const lowerPlace = placeName.toLowerCase().trim();
  
  // Try exact match first
  const exactMatch = INDIAN_CITIES_DB.find(
    city => city.displayName.toLowerCase() === lowerPlace || 
            city.name.toLowerCase() === lowerPlace
  );
  if (exactMatch) return exactMatch;
  
  // Try partial match
  const partialMatch = INDIAN_CITIES_DB.find(
    city => city.displayName.toLowerCase().includes(lowerPlace) ||
            city.name.toLowerCase().includes(lowerPlace)
  );
  if (partialMatch) return partialMatch;
  
  return null;
}
