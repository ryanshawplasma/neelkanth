import { MhahPanchang } from "mhah-panchang";
import * as SunCalc from "suncalc";

/**
 * Panchang engine. Wraps `mhah-panchang` (tithi/nakshatra/yoga/karana/masa via
 * astronomical calculation) and `suncalc` (moon times) and returns bilingual names.
 * Default location: New Delhi. Times are formatted in IST (Asia/Kolkata).
 */

export type Bi = { en: string; hi: string };
const b = (en: string, hi: string): Bi => ({ en, hi });

export const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.209, nameEn: "New Delhi", nameHi: "नई दिल्ली" };

export const TITHI_NAMES: Bi[] = [
  b("Pratipada", "प्रतिपदा"), b("Dwitiya", "द्वितीया"), b("Tritiya", "तृतीया"), b("Chaturthi", "चतुर्थी"), b("Panchami", "पंचमी"),
  b("Shashthi", "षष्ठी"), b("Saptami", "सप्तमी"), b("Ashtami", "अष्टमी"), b("Navami", "नवमी"), b("Dashami", "दशमी"),
  b("Ekadashi", "एकादशी"), b("Dwadashi", "द्वादशी"), b("Trayodashi", "त्रयोदशी"), b("Chaturdashi", "चतुर्दशी"), b("Purnima", "पूर्णिमा"),
  // Krishna paksha
  b("Pratipada", "प्रतिपदा"), b("Dwitiya", "द्वितीया"), b("Tritiya", "तृतीया"), b("Chaturthi", "चतुर्थी"), b("Panchami", "पंचमी"),
  b("Shashthi", "षष्ठी"), b("Saptami", "सप्तमी"), b("Ashtami", "अष्टमी"), b("Navami", "नवमी"), b("Dashami", "दशमी"),
  b("Ekadashi", "एकादशी"), b("Dwadashi", "द्वादशी"), b("Trayodashi", "त्रयोदशी"), b("Chaturdashi", "चतुर्दशी"), b("Amavasya", "अमावस्या"),
];

export const NAKSHATRA_NAMES: Bi[] = [
  b("Ashwini", "अश्विनी"), b("Bharani", "भरणी"), b("Krittika", "कृत्तिका"), b("Rohini", "रोहिणी"), b("Mrigashira", "मृगशिरा"),
  b("Ardra", "आर्द्रा"), b("Punarvasu", "पुनर्वसु"), b("Pushya", "पुष्य"), b("Ashlesha", "आश्लेषा"), b("Magha", "मघा"),
  b("Purva Phalguni", "पूर्वा फाल्गुनी"), b("Uttara Phalguni", "उत्तरा फाल्गुनी"), b("Hasta", "हस्त"), b("Chitra", "चित्रा"), b("Swati", "स्वाति"),
  b("Vishakha", "विशाखा"), b("Anuradha", "अनुराधा"), b("Jyeshtha", "ज्येष्ठा"), b("Mula", "मूल"), b("Purva Ashadha", "पूर्वाषाढ़ा"),
  b("Uttara Ashadha", "उत्तराषाढ़ा"), b("Shravana", "श्रवण"), b("Dhanishta", "धनिष्ठा"), b("Shatabhisha", "शतभिषा"), b("Purva Bhadrapada", "पूर्वा भाद्रपद"),
  b("Uttara Bhadrapada", "उत्तरा भाद्रपद"), b("Revati", "रेवती"),
];

export const YOGA_NAMES: Bi[] = [
  b("Vishkumbha", "विष्कुम्भ"), b("Priti", "प्रीति"), b("Ayushman", "आयुष्मान"), b("Saubhagya", "सौभाग्य"), b("Shobhana", "शोभन"),
  b("Atiganda", "अतिगण्ड"), b("Sukarma", "सुकर्मा"), b("Dhriti", "धृति"), b("Shula", "शूल"), b("Ganda", "गण्ड"),
  b("Vriddhi", "वृद्धि"), b("Dhruva", "ध्रुव"), b("Vyaghata", "व्याघात"), b("Harshana", "हर्षण"), b("Vajra", "वज्र"),
  b("Siddhi", "सिद्धि"), b("Vyatipata", "व्यतीपात"), b("Variyan", "वरीयान"), b("Parigha", "परिघ"), b("Shiva", "शिव"),
  b("Siddha", "सिद्ध"), b("Sadhya", "साध्य"), b("Shubha", "शुभ"), b("Shukla", "शुक्ल"), b("Brahma", "ब्रह्म"),
  b("Indra", "इन्द्र"), b("Vaidhriti", "वैधृति"),
];

export const KARANA_NAMES: Bi[] = [
  b("Bava", "बव"), b("Balava", "बालव"), b("Kaulava", "कौलव"), b("Taitila", "तैतिल"), b("Gara", "गर"), b("Vanija", "वणिज"),
  b("Vishti (Bhadra)", "विष्टि (भद्रा)"), b("Shakuni", "शकुनि"), b("Chatushpada", "चतुष्पाद"), b("Naga", "नाग"), b("Kimstughna", "किंस्तुघ्न"),
];

export const RASHI_NAMES: Bi[] = [
  b("Mesh (Aries)", "मेष"), b("Vrishabh (Taurus)", "वृषभ"), b("Mithun (Gemini)", "मिथुन"), b("Kark (Cancer)", "कर्क"),
  b("Singh (Leo)", "सिंह"), b("Kanya (Virgo)", "कन्या"), b("Tula (Libra)", "तुला"), b("Vrishchik (Scorpio)", "वृश्चिक"),
  b("Dhanu (Sagittarius)", "धनु"), b("Makar (Capricorn)", "मकर"), b("Kumbh (Aquarius)", "कुंभ"), b("Meen (Pisces)", "मीन"),
];

/** Amanta lunar months starting at Chaitra */
export const MASA_NAMES: Bi[] = [
  b("Chaitra", "चैत्र"), b("Vaishakha", "वैशाख"), b("Jyeshtha", "ज्येष्ठ"), b("Ashadha", "आषाढ़"), b("Shravana", "श्रावण"), b("Bhadrapada", "भाद्रपद"),
  b("Ashwin", "आश्विन"), b("Kartik", "कार्तिक"), b("Margashirsha", "मार्गशीर्ष"), b("Paush", "पौष"), b("Magha", "माघ"), b("Phalguna", "फाल्गुन"),
];

export const RITU_NAMES: Bi[] = [
  b("Vasant (Spring)", "वसंत"), b("Grishma (Summer)", "ग्रीष्म"), b("Varsha (Monsoon)", "वर्षा"), b("Sharad (Autumn)", "शरद"),
  b("Hemant (Pre-winter)", "हेमंत"), b("Shishir (Winter)", "शिशिर"),
];

export const WEEKDAY_NAMES: Bi[] = [
  b("Sunday", "रविवार"), b("Monday", "सोमवार"), b("Tuesday", "मंगलवार"), b("Wednesday", "बुधवार"), b("Thursday", "गुरुवार"), b("Friday", "शुक्रवार"), b("Saturday", "शनिवार"),
];

export const PAKSHA_NAMES = { shukla: b("Shukla Paksha", "शुक्ल पक्ष"), krishna: b("Krishna Paksha", "कृष्ण पक्ष") };

// Rahu Kaal / Yamaganda / Gulika segment (1-based, of 8 daytime segments) by weekday Sun..Sat
const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3];
const YAMA_SEG = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SEG = [7, 6, 5, 4, 3, 2, 1];

export type Period = { start: Date; end: Date };
export type Panchang = {
  date: string; // YYYY-MM-DD
  location: { lat: number; lng: number };
  weekday: { index: number } & Bi;
  tithi: { index: number; number: number; paksha: "shukla" | "krishna"; endsAt: Date | null; next: Bi | null } & Bi;
  paksha: Bi;
  nakshatra: { index: number; endsAt: Date | null } & Bi;
  yoga: { index: number; endsAt: Date | null } & Bi;
  karana: { index: number; endsAt: Date | null } & Bi;
  rashi: { index: number } & Bi; // Moon sign
  masa: { amanta: Bi; purnimanta: Bi; adhik: boolean };
  ritu: Bi;
  samvat: { vikram: number; shaka: number };
  sunrise: Date | null;
  sunset: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
  rahuKaal: Period | null;
  yamaganda: Period | null;
  gulikaKaal: Period | null;
  abhijit: Period | null;
  brahmaMuhurat: Period | null;
  isAuspiciousDay: boolean;
  special: Bi[]; // e.g. Ekadashi, Purnima, Amavasya, Pradosh
};

const engine = new MhahPanchang();

function seg(sunrise: Date, sunset: Date, n: number): Period {
  const len = (sunset.getTime() - sunrise.getTime()) / 8;
  return { start: new Date(sunrise.getTime() + len * (n - 1)), end: new Date(sunrise.getTime() + len * n) };
}

function safeDate(v: unknown): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

export function getPanchang(date: Date = new Date(), lat = DEFAULT_LOCATION.lat, lng = DEFAULT_LOCATION.lng): Panchang {
  // Normalise to local noon of the requested calendar day so DST/offsets don't shift the day.
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const sun = engine.sunTimer(day, lat, lng) as Record<string, string>;
  const sunrise = safeDate(sun.sunRise);
  const sunset = safeDate(sun.sunSet);

  // Tithi at sunrise defines the civil day; running values (with end times) come from `calculate`.
  const at = sunrise ?? day;
  const cal = engine.calendar(at, lat, lng);
  const run = engine.calculate(new Date(at.getTime() + 60_000));

  const tithiIdx = Number(cal.Tithi.ino) % 30;
  const paksha: "shukla" | "krishna" = tithiIdx < 15 ? "shukla" : "krishna";
  const nakIdx = Number(cal.Nakshatra.ino) % 27;
  const yogaIdx = Number(cal.Yoga.ino) % 27;
  const karIdx = Number(cal.Karna.ino) % 11;
  const rashiIdx = Number(cal.Raasi.ino) % 12;
  const amantaIdx = Number(cal.MoonMasa.ino) % 12;
  const purnimantaIdx = paksha === "krishna" ? (amantaIdx + 1) % 12 : amantaIdx;
  const adhik = Boolean(cal.MoonMasa.isLeapMonth);
  const rituIdx = Math.floor(amantaIdx / 2) % 6; // Chaitra-Vaishakha = Vasant …

  const gYear = day.getFullYear();
  const gMonth = day.getMonth() + 1;
  const beforeNewYear = amantaIdx >= 9 && gMonth <= 3; // Paush/Magha/Phalguna in Jan–Mar
  const vikram = gYear + (beforeNewYear ? 56 : 57);

  const weekdayIdx = day.getDay();
  const moon = SunCalc.getMoonTimes(day, lat, lng);

  const specials: Bi[] = [];
  const tn = tithiIdx % 15;
  if (tn === 10) specials.push(b("Ekadashi", "एकादशी"));
  if (tithiIdx === 14) specials.push(b("Purnima", "पूर्णिमा"));
  if (tithiIdx === 29) specials.push(b("Amavasya", "अमावस्या"));
  if (tn === 12) specials.push(b("Pradosh Vrat", "प्रदोष व्रत"));
  if (tn === 3) specials.push(b("Sankashti / Vinayaka Chaturthi", "संकष्टी / विनायक चतुर्थी"));
  if (tn === 7 && paksha === "shukla") specials.push(b("Durga Ashtami", "दुर्गा अष्टमी"));
  if (tithiIdx === 28) specials.push(b("Masik Shivratri", "मासिक शिवरात्रि"));
  if (karIdx === 6) specials.push(b("Bhadra (Vishti)", "भद्रा (विष्टि)"));

  const tithiEnds = safeDate(run.Tithi?.end);
  const nextTithiIdx = (tithiIdx + 1) % 30;

  return {
    date: `${gYear}-${String(gMonth).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`,
    location: { lat, lng },
    weekday: { index: weekdayIdx, ...WEEKDAY_NAMES[weekdayIdx] },
    tithi: { index: tithiIdx, number: tn + 1, paksha, endsAt: tithiEnds, next: TITHI_NAMES[nextTithiIdx], ...TITHI_NAMES[tithiIdx] },
    paksha: PAKSHA_NAMES[paksha],
    nakshatra: { index: nakIdx, endsAt: safeDate(run.Nakshatra?.end), ...NAKSHATRA_NAMES[nakIdx] },
    yoga: { index: yogaIdx, endsAt: safeDate(run.Yoga?.end), ...YOGA_NAMES[yogaIdx] },
    karana: { index: karIdx, endsAt: safeDate(run.Karna?.end), ...KARANA_NAMES[karIdx] },
    rashi: { index: rashiIdx, ...RASHI_NAMES[rashiIdx] },
    masa: { amanta: MASA_NAMES[amantaIdx], purnimanta: MASA_NAMES[purnimantaIdx], adhik },
    ritu: RITU_NAMES[rituIdx],
    samvat: { vikram, shaka: vikram - 135 },
    sunrise,
    sunset,
    moonrise: moon.rise ?? null,
    moonset: moon.set ?? null,
    rahuKaal: sunrise && sunset ? seg(sunrise, sunset, RAHU_SEG[weekdayIdx]) : null,
    yamaganda: sunrise && sunset ? seg(sunrise, sunset, YAMA_SEG[weekdayIdx]) : null,
    gulikaKaal: sunrise && sunset ? seg(sunrise, sunset, GULIKA_SEG[weekdayIdx]) : null,
    abhijit:
      sunrise && sunset && weekdayIdx !== 3
        ? (() => {
            const noon = (sunrise.getTime() + sunset.getTime()) / 2;
            const half = (sunset.getTime() - sunrise.getTime()) / 30;
            return { start: new Date(noon - half), end: new Date(noon + half) };
          })()
        : null,
    brahmaMuhurat: sunrise ? { start: new Date(sunrise.getTime() - 96 * 60_000), end: new Date(sunrise.getTime() - 48 * 60_000) } : null,
    isAuspiciousDay: karIdx !== 6 && ![5, 9, 12, 16, 26].includes(yogaIdx),
    special: specials,
  };
}

/** "06:12 AM" in IST */
export function fmtTime(d: Date | null | undefined, locale: "en" | "hi" = "en") {
  if (!d) return "—";
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(d);
}

export function fmtPeriod(p: Period | null | undefined, locale: "en" | "hi" = "en") {
  if (!p) return "—";
  return `${fmtTime(p.start, locale)} – ${fmtTime(p.end, locale)}`;
}

/** Plain-JSON version safe to pass to client components. */
export function serializePanchang(p: Panchang) {
  const iso = (d: Date | null) => (d ? d.toISOString() : null);
  const per = (x: Period | null) => (x ? { start: x.start.toISOString(), end: x.end.toISOString() } : null);
  return {
    ...p,
    tithi: { ...p.tithi, endsAt: iso(p.tithi.endsAt) },
    nakshatra: { ...p.nakshatra, endsAt: iso(p.nakshatra.endsAt) },
    yoga: { ...p.yoga, endsAt: iso(p.yoga.endsAt) },
    karana: { ...p.karana, endsAt: iso(p.karana.endsAt) },
    sunrise: iso(p.sunrise),
    sunset: iso(p.sunset),
    moonrise: iso(p.moonrise),
    moonset: iso(p.moonset),
    rahuKaal: per(p.rahuKaal),
    yamaganda: per(p.yamaganda),
    gulikaKaal: per(p.gulikaKaal),
    abhijit: per(p.abhijit),
    brahmaMuhurat: per(p.brahmaMuhurat),
  };
}
export type PanchangJson = ReturnType<typeof serializePanchang>;
