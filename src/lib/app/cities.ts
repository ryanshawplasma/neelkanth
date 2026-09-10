/**
 * Cities used by the panchang location picker (devotee app).
 * Kept here (src/lib/app) so the devotee module owns it.
 */
export type City = { slug: string; nameEn: string; nameHi: string; lat: number; lng: number };

export const CITIES: City[] = [
  { slug: "delhi", nameEn: "Delhi", nameHi: "दिल्ली", lat: 28.6139, lng: 77.209 },
  { slug: "mumbai", nameEn: "Mumbai", nameHi: "मुंबई", lat: 19.076, lng: 72.8777 },
  { slug: "kolkata", nameEn: "Kolkata", nameHi: "कोलकाता", lat: 22.5726, lng: 88.3639 },
  { slug: "chennai", nameEn: "Chennai", nameHi: "चेन्नई", lat: 13.0827, lng: 80.2707 },
  { slug: "bengaluru", nameEn: "Bengaluru", nameHi: "बेंगलुरु", lat: 12.9716, lng: 77.5946 },
  { slug: "hyderabad", nameEn: "Hyderabad", nameHi: "हैदराबाद", lat: 17.385, lng: 78.4867 },
  { slug: "ahmedabad", nameEn: "Ahmedabad", nameHi: "अहमदाबाद", lat: 23.0225, lng: 72.5714 },
  { slug: "jaipur", nameEn: "Jaipur", nameHi: "जयपुर", lat: 26.9124, lng: 75.7873 },
  { slug: "lucknow", nameEn: "Lucknow", nameHi: "लखनऊ", lat: 26.8467, lng: 80.9462 },
  { slug: "varanasi", nameEn: "Varanasi", nameHi: "वाराणसी", lat: 25.3176, lng: 82.9739 },
  { slug: "patna", nameEn: "Patna", nameHi: "पटना", lat: 25.5941, lng: 85.1376 },
  { slug: "pune", nameEn: "Pune", nameHi: "पुणे", lat: 18.5204, lng: 73.8567 },
];

export const DEFAULT_CITY = CITIES[0];
export const CITY_COOKIE = "dd_city";

export function cityBySlug(slug: string | null | undefined): City {
  return CITIES.find((c) => c.slug === slug) ?? DEFAULT_CITY;
}

/** Match a free-text city name (from the user profile) against the picker list. */
export function cityByName(name: string | null | undefined): City | null {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  return CITIES.find((c) => c.nameEn.toLowerCase() === n || c.nameHi === name.trim() || c.slug === n) ?? null;
}
