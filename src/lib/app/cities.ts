/**
 * Cities used by the panchang location picker and the admin "launch city" setting.
 * Kept here (src/lib/app) so the devotee module owns it.
 */
export type City = { slug: string; nameEn: string; nameHi: string; stateEn: string; lat: number; lng: number };

export const CITIES: City[] = [
  { slug: "delhi", nameEn: "Delhi", nameHi: "दिल्ली", stateEn: "Delhi", lat: 28.6139, lng: 77.209 },
  { slug: "bahadurgarh", nameEn: "Bahadurgarh", nameHi: "बहादुरगढ़", stateEn: "Haryana", lat: 28.6833, lng: 76.9167 },
  { slug: "jhajjar", nameEn: "Jhajjar", nameHi: "झज्जर", stateEn: "Haryana", lat: 28.6063, lng: 76.6565 },
  { slug: "rohtak", nameEn: "Rohtak", nameHi: "रोहतक", stateEn: "Haryana", lat: 28.8955, lng: 76.6066 },
  { slug: "sonipat", nameEn: "Sonipat", nameHi: "सोनीपत", stateEn: "Haryana", lat: 28.9931, lng: 77.0151 },
  { slug: "panipat", nameEn: "Panipat", nameHi: "पानीपत", stateEn: "Haryana", lat: 29.3909, lng: 76.9635 },
  { slug: "karnal", nameEn: "Karnal", nameHi: "करनाल", stateEn: "Haryana", lat: 29.6857, lng: 76.9905 },
  { slug: "hisar", nameEn: "Hisar", nameHi: "हिसार", stateEn: "Haryana", lat: 29.1492, lng: 75.7217 },
  { slug: "gurugram", nameEn: "Gurugram", nameHi: "गुरुग्राम", stateEn: "Haryana", lat: 28.4595, lng: 77.0266 },
  { slug: "faridabad", nameEn: "Faridabad", nameHi: "फरीदाबाद", stateEn: "Haryana", lat: 28.4089, lng: 77.3178 },
  { slug: "noida", nameEn: "Noida", nameHi: "नोएडा", stateEn: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
  { slug: "ghaziabad", nameEn: "Ghaziabad", nameHi: "गाज़ियाबाद", stateEn: "Uttar Pradesh", lat: 28.6692, lng: 77.4538 },
  { slug: "chandigarh", nameEn: "Chandigarh", nameHi: "चंडीगढ़", stateEn: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { slug: "mumbai", nameEn: "Mumbai", nameHi: "मुंबई", stateEn: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { slug: "kolkata", nameEn: "Kolkata", nameHi: "कोलकाता", stateEn: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { slug: "chennai", nameEn: "Chennai", nameHi: "चेन्नई", stateEn: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { slug: "bengaluru", nameEn: "Bengaluru", nameHi: "बेंगलुरु", stateEn: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { slug: "hyderabad", nameEn: "Hyderabad", nameHi: "हैदराबाद", stateEn: "Telangana", lat: 17.385, lng: 78.4867 },
  { slug: "ahmedabad", nameEn: "Ahmedabad", nameHi: "अहमदाबाद", stateEn: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { slug: "jaipur", nameEn: "Jaipur", nameHi: "जयपुर", stateEn: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { slug: "lucknow", nameEn: "Lucknow", nameHi: "लखनऊ", stateEn: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { slug: "varanasi", nameEn: "Varanasi", nameHi: "वाराणसी", stateEn: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { slug: "vrindavan", nameEn: "Vrindavan", nameHi: "वृंदावन", stateEn: "Uttar Pradesh", lat: 27.565, lng: 77.6593 },
  { slug: "haridwar", nameEn: "Haridwar", nameHi: "हरिद्वार", stateEn: "Uttarakhand", lat: 29.9457, lng: 78.1642 },
  { slug: "rishikesh", nameEn: "Rishikesh", nameHi: "ऋषिकेश", stateEn: "Uttarakhand", lat: 30.0869, lng: 78.2676 },
  { slug: "ujjain", nameEn: "Ujjain", nameHi: "उज्जैन", stateEn: "Madhya Pradesh", lat: 23.1765, lng: 75.7885 },
  { slug: "patna", nameEn: "Patna", nameHi: "पटना", stateEn: "Bihar", lat: 25.5941, lng: 85.1376 },
  { slug: "pune", nameEn: "Pune", nameHi: "पुणे", stateEn: "Maharashtra", lat: 18.5204, lng: 73.8567 },
];

export const DEFAULT_CITY = CITIES[0];
export const CITY_COOKIE = "dd_city";

export function findCity(slug: string | null | undefined): City | null {
  return CITIES.find((c) => c.slug === slug) ?? null;
}

export function cityBySlug(slug: string | null | undefined, fallback: City = DEFAULT_CITY): City {
  return findCity(slug) ?? fallback;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** Match a free-text city name (profile, temple or address) against the picker list. */
export function cityByName(name: string | null | undefined): City | null {
  if (!name?.trim()) return null;
  const n = norm(name);
  return CITIES.find((c) => norm(c.nameEn) === n || c.nameHi === name.trim() || c.slug === n) ?? null;
}

/** Whether free text such as "bahadurgarh", " Bahadurgarh " or "बहादुरगढ़" names this city. */
export function isCity(name: string | null | undefined, city: City) {
  return cityByName(name)?.slug === city.slug;
}
