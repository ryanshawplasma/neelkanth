/**
 * Data → scene mapping.
 *
 * Nothing here reads the catalogue directly. `generate-art.ts` hands over the
 * slug, type, deity, temple and tags of whatever it found in `src/data/**`, and
 * these rules pick a palette, an emblem and a horizon band. Every rule set ends
 * in a sensible default, so a brand-new service slug still gets real artwork.
 */
import type { BandKind } from "./decor";

export type Rule = [RegExp, string];

/** First match wins. */
export function firstMatch(rules: Rule[], hay: string, fallback: string): string {
  for (const [re, value] of rules) if (re.test(hay)) return value;
  return fallback;
}

/* ───────────────────────── palettes ───────────────────────── */

const PALETTE_RULES: Rule[] = [
  [/hanuman|bajrang|balaji|salasar|mehandipur|sankat.?mochan|sundarkand|chalisa/, "hanuman"],
  [/ganesh|ganapati|vinayak|siddhivinayak|modak|sankashti/, "ganesh"],
  [/shani|bhairav|sade.?sati|dhaiya|rahu|ketu|saturn/, "shani"],
  [/lakshmi|laxmi|kuber|dhanteras|dhan.?prapti|wealth|shri.?yantra|akshaya/, "lakshmi"],
  [/durga|devi|kali|kamakhya|baglamukhi|vaishno|navratri|chandi|shakti|ambe|jagdamba|katyayani|mahagauri|dandiya|garba|teej/, "devi"],
  [/khatu|shyam|barbarik/, "shyam"],
  [/krishna|banke|bihari|vrindavan|radha|janmashtami|govardhan|gopal|makhan|dwarka|gita/, "krishna"],
  [/\bram\b|raam|sita|ayodhya|dussehra|dashami|raghu/, "ram"],
  [/vishnu|badrinath|narayan|satyanarayan|ekadashi|tulsi|jagannath|venkat|padmanabh|sudarshan|shaligram/, "vishnu"],
  [/surya|\bsun\b|chhath|saptami|arghya/, "surya"],
  [/\bsai\b|shirdi|dwarkamai/, "sai"],
  [/pitru|tarpan|shraddh|\bgaya\b|vishnupad|pind|narayan.?bali|moksha/, "pitru"],
  [/astro|kundli|kundali|horoscope|jyotish|match.?mak|gemstone|ratna|numerolog|tarot|vastu|muhurat|birth.?chart/, "astro"],
  [/prasad|laddoo|ladoo|peda|bhog|chappan|panchamrit|charnamrit/, "prasad"],
  [/vivah|marriage|shaadi|naamkaran|mundan|annaprashan|griha.?pravesh|sanskar|upanayan|janeu|engagement|godbharai|seemantham|rakhi|raksha/, "sanskar"],
  [/shiva|shiv|mahakal|mahadev|rudra|jyotirlinga|somnath|trimbakeshwar|kashi|vishwanath|shravan|shivratri|mahamrityunjay|\bnag\b|kaal.?sarp|omkareshwar|kedarnath|linga/, "shiva"],
  [/diwali|deepawali|deepavali|naraka|dhanvantari/, "diwali"],
  [/holi|holika|rang/, "holi"],
  [/sankranti|kite|pongal|lohri/, "sankranti"],
];

/**
 * `primary` is the slug plus the deity — the strongest signal. `secondary`
 * adds tags and the temple, which are useful but noisy (almost every vidhi is
 * tagged "ganesh" because Ganesh is invoked first). Primary wins outright.
 */
export function paletteKeyFor(primary: string, secondary = ""): string {
  const hit = firstMatch(PALETTE_RULES, primary, "");
  if (hit) return hit;
  return firstMatch(PALETTE_RULES, `${primary} ${secondary}`, "temple");
}

/* ───────────────────────── emblems ───────────────────────── */

const EMBLEM_RULES: Rule[] = [
  // Deity-specific emblems come first: many Hanuman and Ganesh sevas carry
  // "shani" or "saturday" tags, and the deity should still win the picture.
  [/chappan|laddoo|ladoo|peda|\bbhog\b|mishri|panjiri|prasad|thali.?box/, "sweetPlate"],
  [/hanuman|bajrang|sund[ae]rkand|balaji|salasar|mehandipur|\bgada\b/, "gada"],
  [/ganesh|ganapati|vinayak|modak|sankashti/, "ganeshMukh"],
  [/kaal.?sarp|\bnag\b|sarp|serpent|panchami/, "serpent"],
  [/navgrah|nine.?planet|grah.?shanti|graha/, "navgrah"],
  [/shani|saturn|sade.?sati|dhaiya/, "saturnPlanet"],
  [/rudrabhishek|abhishek|shivling|jalabhishek|lingam|somvar|shravan|shivratri|bhasma|pradosh|laghu.?rudra|maha.?rudra/, "shivling"],
  [/mahamrityunjay|jaap|japa|anushthan|mantra|rudraksha|\bmala\b/, "mala"],
  [/bhairav|tantra|kaal.?bhairav/, "trishul"],
  [/kundli|kundali|horoscope|janam|match.?mak|jyotish|report|consult|numerolog|tarot|gemstone|ratna|muhurat|birth.?chart|career|marriage.?predict/, "kundli"],
  [/vastu|yantra|shri.?yantra|sadhana/, "shriYantra"],
  [/lakshmi|laxmi|kuber|dhan.?prapti|wealth|lotus|kamal|padma/, "lotus"],
  [/chunri|shringar|saree|chola|poshak/, "chunri"],
  [/durga|chandi|devi|kali|kamakhya|baglamukhi|vaishno|shakti|ambe|trishul|navratri/, "trishul"],
  [/dandiya|garba/, "dandiya"],
  [/krishna|banke|bihari|radha|janmashtami|gopal|makhan|flute|bansuri|peacock/, "peacockFlute"],
  [/matki|dahi.?handi/, "matki"],
  [/\bram\b|raam|sita|dhanush|\bbow\b|dussehra/, "bowArrow"],
  [/sudarshan|chakra/, "chakra"],
  [/shankh|conch/, "shankh"],
  [/vishnu|narayan|satyanarayan|ekadashi|badrinath|jagannath|venkat|shaligram/, "shankhChakra"],
  [/tulsi/, "tulsiPot"],
  [/surya|\bsun\b|arghya|saptami/, "sun"],
  [/chhath|soop/, "soopSun"],
  [/rath.?yatra|chariot/, "chariot"],
  [/\bsai\b|shirdi|paduka|charan|guru.?purnima/, "paduka"],
  [/pitru|tarpan|shraddh|pind|\bgaya\b|narayan.?bali|antyeshti/, "pindDaan"],
  [/govardhan|annakut/, "govardhanHill"],
  [/kite|sankranti|patang/, "kites"],
  [/rakhi|raksha.?bandhan/, "rakhi"],
  [/holi|holika.*rang|rang.?panchami/, "colorSplash"],
  [/diwali|deepawali|deepavali|firework|naraka/, "fireworks"],
  [/karwa|chalni|sieve/, "chalniMoon"],
  [/purnima|full.?moon|sharad/, "fullMoon"],
  [/amavasya|crescent|masik.?shivratri/, "crescentMoon"],
  [/thali|aarti.?thali|tilak|bhai.?dooj|ahoi/, "poojaThali"],
  [/garland|phool|flower|mala.?arpan|shringar.?phool|petal/, "garlandHeap"],
  [/chadhava|offer|arpan|bhent|nariyal|coconut/, "chunri"],
  [/prasad|laddoo|ladoo|peda|bhog|chappan|mishri|panjiri|delivery/, "sweetPlate"],
  [/katha|paath|\bpath\b|akhand|bhagwat|ramayan|granth|adhyay|stotra|chaupai/, "bookDiya"],
  [/darshan|live|stream|virtual/, "screenArch"],
  [/havan|yagya|yajna|homa|hawan|purnahuti|chandi.?path/, "havanKund"],
  [/vivah|marriage|shaadi|engagement|\bring\b|mangal.?pheras|kanyadaan/, "mandapRing"],
  [/griha.?pravesh|house.?warm|bhoomi|vastu.?shanti|\bhome\b/, "houseKalash"],
  [/vahan|\bcar\b|vehicle|bike|scooter/, "carTilak"],
  [/naamkaran|namkaran|annaprashan|baby|cradle|jatakarma|godbharai|seemant|santan/, "cradle"],
  [/mundan|chudakaran|tonsure/, "scissors"],
  [/upanayan|janeu|yagyopavit|kalash|kumbh/, "kalash"],
  [/ganga|river|snan|tirth/, "kumbhRiver"],
  [/nazar|drishti|buri/, "eyeNazar"],
  [/dhwaj|nishan|flag|jhanda/, "flag"],
  [/ghanta|bell/, "bell"],
  [/deep.?daan|deepdaan|\bdiya\b|lamp|aarti/, "diya"],
  [/swastik|mangal.?kalash/, "swastik"],
  [/temple|mandir|gopuram|shikhara/, "templeGopuram"],
  [/\bom\b|shanti|mahamantra/, "om"],
];

const TYPE_EMBLEM: Record<string, string> = {
  ONLINE_POOJA: "diya",
  CHADHAVA: "chunri",
  PANDIT_AT_HOME: "havanKund",
  ASTROLOGY: "kundli",
  PRASAD: "sweetPlate",
  KATHA: "bookDiya",
  LIVE_DARSHAN: "screenArch",
};

/**
 * Three tiers, most specific first. The slug alone is the truest description of
 * a seva; the deity is next (but almost every sanskar lists Ganesh, who is
 * invoked before any vidhi); tags are the loosest. Falling through all three
 * lands on a per-type default, so an unknown slug still gets real artwork.
 */
export function emblemFor(slug: string, deity = "", tags = "", type?: string): string {
  const hit =
    firstMatch(EMBLEM_RULES, slug, "") ||
    firstMatch(EMBLEM_RULES, `${slug} ${deity}`, "") ||
    firstMatch(EMBLEM_RULES, `${slug} ${deity} ${tags}`, "");
  if (hit) return hit;
  return (type && TYPE_EMBLEM[type]) || "om";
}

/** The emblem used on the `-alt` second image of a listing. */
const COMPANION: Record<string, string> = {
  om: "kalash",
  shivling: "trishul",
  trishul: "shivling",
  chakra: "shankh",
  shankh: "chakra",
  shankhChakra: "lotus",
  lotus: "kalash",
  kalash: "om",
  diya: "lotus",
  swastik: "kalash",
  peacockFlute: "matki",
  gada: "flag",
  bowArrow: "flag",
  sun: "chakra",
  crescentMoon: "om",
  mala: "om",
  bell: "templeGopuram",
  serpent: "shivling",
  navgrah: "kundli",
  chunri: "garlandHeap",
  garlandHeap: "chunri",
  sweetPlate: "poojaThali",
  bookDiya: "om",
  kundli: "navgrah",
  mandapRing: "kalash",
  houseKalash: "swastik",
  carTilak: "swastik",
  havanKund: "kalash",
  cradle: "lotus",
  scissors: "poojaThali",
  shriYantra: "lotus",
  paduka: "diya",
  tulsiPot: "shankh",
  kites: "sun",
  rakhi: "poojaThali",
  matki: "peacockFlute",
  colorSplash: "poojaThali",
  fireworks: "diya",
  dandiya: "trishul",
  poojaThali: "bell",
  chalniMoon: "fullMoon",
  pindDaan: "kumbhRiver",
  saturnPlanet: "navgrah",
  ganeshMukh: "swastik",
  flag: "gada",
  chariot: "chakra",
  soopSun: "sun",
  govardhanHill: "peacockFlute",
  screenArch: "templeGopuram",
  templeGopuram: "bell",
  eyeNazar: "swastik",
  fullMoon: "kumbhRiver",
  kumbhRiver: "diya",
};

export function companionEmblem(primary: string): string {
  return COMPANION[primary] ?? "om";
}

/* ───────────────────────── horizon bands ───────────────────────── */

const CITY_BANDS: Rule[] = [
  [/varanasi|kashi|banaras|prayag|haridwar|rishikesh|ghat/, "ghat"],
  [/\bgaya\b|patna|bihar|ganga|yamuna|vrindavan|mathura|nashik|godavari/, "river"],
  [/prabhas|somnath|dwarka|rameshwaram|puri|gujarat|goa|kanyakumari|\bsea\b/, "sea"],
  [/katra|vaishno|kashmir|shimla|himachal|hills|sikar|dausa/, "hills"],
  [/badrinath|kedarnath|chamoli|uttarakhand|gangotri|yamunotri|amarnath/, "snow"],
  [/rajasthan|khatu|salasar|churu|jaisalmer|bikaner|jodhpur|thar/, "desert"],
  [/assam|guwahati|kamakhya|meghalaya|kerala|forest|van\b/, "forest"],
  [/mumbai|delhi|pune|chennai|bengaluru|hyderabad|kolkata|ahmedabad|jaipur|lucknow/, "city"],
];

export function bandFor(hay: string, fallback: BandKind = "temple"): BandKind {
  return firstMatch(CITY_BANDS, hay, fallback) as BandKind;
}

/* ───────────────────────── festivals ───────────────────────── */

export type FestivalArt = { palette: string; emblem: string; band: BandKind; moon?: "full" | "crescent"; lamps?: boolean; particles?: "sparks" | "petals" | "stars" };

export const FESTIVAL_ART: Record<string, FestivalArt> = {
  "krishna-janmashtami": { palette: "krishna", emblem: "matki", band: "river", moon: "crescent", particles: "petals" },
  "hartalika-teej": { palette: "shiva", emblem: "shivling", band: "forest", particles: "petals" },
  "ganesh-chaturthi": { palette: "ganesh", emblem: "ganeshMukh", band: "city" },
  "radha-ashtami": { palette: "krishna", emblem: "lotus", band: "forest", particles: "petals" },
  "anant-chaturdashi": { palette: "vishnu", emblem: "chakra", band: "sea" },
  "pitru-paksha": { palette: "pitru", emblem: "pindDaan", band: "river" },
  "sarva-pitru-amavasya": { palette: "pitru", emblem: "pindDaan", band: "river" },
  "sharad-navratri": { palette: "devi", emblem: "dandiya", band: "temple" },
  "durga-ashtami": { palette: "devi", emblem: "trishul", band: "temple" },
  "maha-navami": { palette: "devi", emblem: "trishul", band: "temple" },
  dussehra: { palette: "ram", emblem: "bowArrow", band: "city" },
  "sharad-purnima": { palette: "krishna", emblem: "fullMoon", band: "river", moon: undefined },
  "karwa-chauth": { palette: "sanskar", emblem: "chalniMoon", band: "city" },
  "ahoi-ashtami": { palette: "devi", emblem: "poojaThali", band: "city", moon: "crescent" },
  dhanteras: { palette: "lakshmi", emblem: "kalash", band: "city", lamps: true },
  "naraka-chaturdashi": { palette: "diwali", emblem: "diya", band: "city", lamps: true },
  diwali: { palette: "diwali", emblem: "fireworks", band: "city", lamps: true },
  "govardhan-puja": { palette: "krishna", emblem: "govardhanHill", band: "hills" },
  "bhai-dooj": { palette: "sanskar", emblem: "poojaThali", band: "city" },
  "chhath-puja": { palette: "surya", emblem: "soopSun", band: "river" },
  "dev-uthani-ekadashi": { palette: "vishnu", emblem: "shankhChakra", band: "temple" },
  "tulsi-vivah": { palette: "vishnu", emblem: "tulsiPot", band: "temple" },
  "kartik-purnima": { palette: "shiva", emblem: "fullMoon", band: "ghat", lamps: true },
  "kalabhairav-jayanti": { palette: "shani", emblem: "trishul", band: "temple" },
  "gita-jayanti": { palette: "krishna", emblem: "bookDiya", band: "temple" },
  "makar-sankranti": { palette: "sankranti", emblem: "kites", band: "city" },
  "mauni-amavasya": { palette: "pitru", emblem: "kumbhRiver", band: "river" },
  "vasant-panchami": { palette: "prasad", emblem: "bookDiya", band: "forest", particles: "petals" },
  "magha-purnima": { palette: "pitru", emblem: "fullMoon", band: "river" },
  "maha-shivratri": { palette: "shiva", emblem: "shivling", band: "temple", moon: "crescent" },
  "holika-dahan": { palette: "diwali", emblem: "havanKund", band: "city" },
  holi: { palette: "holi", emblem: "colorSplash", band: "city", particles: "petals" },
  "chaitra-navratri": { palette: "devi", emblem: "trishul", band: "temple" },
  "ram-navami": { palette: "ram", emblem: "bowArrow", band: "city" },
  "hanuman-jayanti": { palette: "hanuman", emblem: "gada", band: "hills" },
  "akshaya-tritiya": { palette: "lakshmi", emblem: "kalash", band: "temple" },
  "buddha-purnima": { palette: "vishnu", emblem: "lotus", band: "forest", moon: "full" },
  "shani-jayanti": { palette: "shani", emblem: "saturnPlanet", band: "city" },
  "ganga-dussehra": { palette: "vishnu", emblem: "kumbhRiver", band: "river" },
  "nirjala-ekadashi": { palette: "vishnu", emblem: "kalash", band: "river" },
  "jagannath-rath-yatra": { palette: "temple", emblem: "chariot", band: "sea" },
  "devshayani-ekadashi": { palette: "vishnu", emblem: "shankh", band: "sea" },
  "guru-purnima": { palette: "sai", emblem: "paduka", band: "temple", moon: "full" },
  "shravan-start": { palette: "shiva", emblem: "shivling", band: "ghat" },
  "hariyali-teej": { palette: "shiva", emblem: "shivling", band: "forest", particles: "petals" },
  "nag-panchami": { palette: "shiva", emblem: "serpent", band: "forest" },
  "raksha-bandhan": { palette: "sanskar", emblem: "rakhi", band: "city" },

  // recurring observances (lowercased art keys)
  ekadashi: { palette: "vishnu", emblem: "shankhChakra", band: "river" },
  purnima: { palette: "krishna", emblem: "fullMoon", band: "river" },
  amavasya: { palette: "shani", emblem: "diya", band: "river", particles: "stars" },
  pradosh: { palette: "shiva", emblem: "shivling", band: "temple", moon: "crescent" },
  sankashti: { palette: "ganesh", emblem: "ganeshMukh", band: "city", moon: "full" },
  vinayaka: { palette: "ganesh", emblem: "ganeshMukh", band: "city", moon: "crescent" },
  shivratri: { palette: "shiva", emblem: "shivling", band: "temple", moon: "crescent" },
};

/** Falls back to the keyword rules for any festival key not listed above. */
export function festivalArtFor(key: string): FestivalArt {
  const hit = FESTIVAL_ART[key];
  if (hit) return hit;
  const hay = key.replace(/-/g, " ");
  return { palette: paletteKeyFor(hay), emblem: emblemFor(hay), band: bandFor(hay) };
}

/* ───────────────────────── categories ───────────────────────── */

export const CATEGORY_ART: Record<string, { palette: string; emblem: string }> = {
  "online-pooja": { palette: "temple", emblem: "diya" },
  chadhava: { palette: "devi", emblem: "chunri" },
  "pandit-at-home": { palette: "sanskar", emblem: "havanKund" },
  astrology: { palette: "astro", emblem: "kundli" },
  prasad: { palette: "prasad", emblem: "sweetPlate" },
  "katha-path": { palette: "krishna", emblem: "bookDiya" },
  "live-darshan": { palette: "vishnu", emblem: "screenArch" },
  "dosh-nivaran": { palette: "shani", emblem: "navgrah" },
  "festival-specials": { palette: "diwali", emblem: "fireworks" },
  sanskar: { palette: "lakshmi", emblem: "mandapRing" },
};
