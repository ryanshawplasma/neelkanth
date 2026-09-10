/* throwaway: derive festival dates with traditional muhurta rules */
import { MhahPanchang } from "mhah-panchang";

const engine = new MhahPanchang();
const LAT = 28.6139;
const LNG = 77.209;

const MASA = ["Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada","Ashwin","Kartik","Margashirsha","Paush","Magha","Phalguna"];

type Rule = "sunrise" | "madhyahna" | "aparahna" | "pradosh" | "evening" | "moonrise" | "nishita" | "predawn";

function suntimes(d: Date) {
  const s = engine.sunTimer(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0), LAT, LNG) as Record<string, string>;
  return { sunrise: new Date(s.sunRise), sunset: new Date(s.sunSet) };
}

function instantFor(d: Date, rule: Rule): Date {
  const { sunrise, sunset } = suntimes(d);
  const day = sunset.getTime() - sunrise.getTime();
  switch (rule) {
    case "sunrise": return new Date(sunrise.getTime() + 2 * 60000);
    case "madhyahna": return new Date(sunrise.getTime() + 0.5 * day);
    case "aparahna": return new Date(sunrise.getTime() + 0.7 * day);
    case "pradosh": return new Date(sunset.getTime() + 20 * 60000);
    case "evening": return new Date(sunset.getTime() + 2 * 3600000);
    case "moonrise": return new Date(sunset.getTime() + 3 * 3600000);
    case "nishita": return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 15, 0);
    case "predawn": return new Date(sunrise.getTime() - 90 * 60000);
  }
}

function tithiAt(instant: Date) {
  const c = engine.calculate(instant) as any;
  const cal = engine.calendar(instant, LAT, LNG) as any;
  const ino = Number(c.Tithi.ino) % 30;
  const paksha: "shukla" | "krishna" = ino < 15 ? "shukla" : "krishna";
  const inoSR = Number(cal.Tithi.ino) % 30;
  const pakshaSR: "shukla" | "krishna" = inoSR < 15 ? "shukla" : "krishna";
  const amantaSR = Number(cal.MoonMasa.ino) % 12;
  const purnIdx = paksha === "krishna" || pakshaSR === "krishna" ? (amantaSR + 1) % 12 : amantaSR;
  const amantaIdx = paksha === "krishna" ? (purnIdx + 11) % 12 : purnIdx;
  return { n: (ino % 15) + 1, paksha, amanta: MASA[amantaIdx], purn: MASA[purnIdx] };
}

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

type Spec = { label: string; month: string; paksha: "shukla" | "krishna"; n: number; rule: Rule };

const SPECS: Spec[] = [
  { label: "HartalikaTeej",       month: "Bhadrapada",   paksha: "shukla",  n: 3,  rule: "sunrise" },
  { label: "GaneshChaturthi",     month: "Bhadrapada",   paksha: "shukla",  n: 4,  rule: "madhyahna" },
  { label: "RadhaAshtami",        month: "Bhadrapada",   paksha: "shukla",  n: 8,  rule: "madhyahna" },
  { label: "AnantChaturdashi",    month: "Bhadrapada",   paksha: "shukla",  n: 14, rule: "sunrise" },
  { label: "PitruPakshaStart",    month: "Bhadrapada",   paksha: "shukla",  n: 15, rule: "aparahna" },
  { label: "SarvaPitruAmavasya",  month: "Ashwin",       paksha: "krishna", n: 15, rule: "aparahna" },
  { label: "Navratri",            month: "Ashwin",       paksha: "shukla",  n: 1,  rule: "sunrise" },
  { label: "DurgaAshtami",        month: "Ashwin",       paksha: "shukla",  n: 8,  rule: "sunrise" },
  { label: "MahaNavami",          month: "Ashwin",       paksha: "shukla",  n: 9,  rule: "sunrise" },
  { label: "Dussehra",            month: "Ashwin",       paksha: "shukla",  n: 10, rule: "aparahna" },
  { label: "SharadPurnima",       month: "Ashwin",       paksha: "shukla",  n: 15, rule: "evening" },
  { label: "KarwaChauth",         month: "Kartik",       paksha: "krishna", n: 4,  rule: "moonrise" },
  { label: "AhoiAshtami",         month: "Kartik",       paksha: "krishna", n: 8,  rule: "evening" },
  { label: "Dhanteras",           month: "Kartik",       paksha: "krishna", n: 13, rule: "pradosh" },
  { label: "NarakaChaturdashi",   month: "Kartik",       paksha: "krishna", n: 14, rule: "predawn" },
  { label: "Diwali",              month: "Kartik",       paksha: "krishna", n: 15, rule: "pradosh" },
  { label: "Govardhan",           month: "Kartik",       paksha: "shukla",  n: 1,  rule: "sunrise" },
  { label: "BhaiDooj",            month: "Kartik",       paksha: "shukla",  n: 2,  rule: "aparahna" },
  { label: "ChhathNahayKhay",     month: "Kartik",       paksha: "shukla",  n: 4,  rule: "sunrise" },
  { label: "ChhathSandhya",       month: "Kartik",       paksha: "shukla",  n: 6,  rule: "pradosh" },
  { label: "DevUthaniEkadashi",   month: "Kartik",       paksha: "shukla",  n: 11, rule: "sunrise" },
  { label: "TulsiVivah",          month: "Kartik",       paksha: "shukla",  n: 12, rule: "pradosh" },
  { label: "KartikPurnima",       month: "Kartik",       paksha: "shukla",  n: 15, rule: "pradosh" },
  { label: "GitaJayanti",         month: "Margashirsha", paksha: "shukla",  n: 11, rule: "sunrise" },
  { label: "VasantPanchami",      month: "Magha",        paksha: "shukla",  n: 5,  rule: "sunrise" },
  { label: "MaghaPurnima",        month: "Magha",        paksha: "shukla",  n: 15, rule: "sunrise" },
  { label: "MahaShivratri",       month: "Phalguna",     paksha: "krishna", n: 14, rule: "nishita" },
  { label: "HolikaDahan",         month: "Phalguna",     paksha: "shukla",  n: 15, rule: "pradosh" },
  { label: "Holi",                month: "Chaitra",      paksha: "krishna", n: 1,  rule: "sunrise" },
  { label: "ChaitraNavratri",     month: "Chaitra",      paksha: "shukla",  n: 1,  rule: "sunrise" },
  { label: "RamNavami",           month: "Chaitra",      paksha: "shukla",  n: 9,  rule: "madhyahna" },
  { label: "HanumanJayanti",      month: "Chaitra",      paksha: "shukla",  n: 15, rule: "sunrise" },
  { label: "AkshayaTritiya",      month: "Vaishakha",    paksha: "shukla",  n: 3,  rule: "madhyahna" },
  { label: "BuddhaPurnima",       month: "Vaishakha",    paksha: "shukla",  n: 15, rule: "sunrise" },
  { label: "GangaDussehra",       month: "Jyeshtha",     paksha: "shukla",  n: 10, rule: "sunrise" },
  { label: "NirjalaEkadashi",     month: "Jyeshtha",     paksha: "shukla",  n: 11, rule: "sunrise" },
  { label: "RathYatra",           month: "Ashadha",      paksha: "shukla",  n: 2,  rule: "sunrise" },
  { label: "DevshayaniEkadashi",  month: "Ashadha",      paksha: "shukla",  n: 11, rule: "sunrise" },
  { label: "GuruPurnima",         month: "Ashadha",      paksha: "shukla",  n: 15, rule: "sunrise" },
  { label: "HariyaliTeej",        month: "Shravana",     paksha: "shukla",  n: 3,  rule: "sunrise" },
  { label: "NagPanchami",         month: "Shravana",     paksha: "shukla",  n: 5,  rule: "sunrise" },
  { label: "RakshaBandhan",       month: "Shravana",     paksha: "shukla",  n: 15, rule: "aparahna" },
  { label: "Janmashtami",         month: "Bhadrapada",   paksha: "krishna", n: 8,  rule: "nishita" },
];

const START = new Date(2026, 8, 1);
const END = new Date(2027, 11, 31);

const days: { d: Date }[] = [];
for (let d = new Date(START); d <= END; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) days.push({ d: new Date(d) });

const out: Record<string, string[]> = {};
for (const s of SPECS) {
  const hits: string[] = [];
  let prevMatch = false;
  for (const { d } of days) {
    const t = tithiAt(instantFor(d, s.rule));
    const match = t.purn === s.month && t.paksha === s.paksha && t.n === s.n;
    if (match && !prevMatch) hits.push(key(d));
    prevMatch = match;
  }
  out[s.label] = hits;
}

for (const s of SPECS) console.log(s.label.padEnd(22), s.rule.padEnd(10), out[s.label].join("  "));

// Sawan (purnimanta Shravana) start dates
console.log("\n--- purnimanta month first days ---");
let prevM = "";
for (const { d } of days) {
  const t = tithiAt(instantFor(d, "sunrise"));
  if (t.purn !== prevM) { console.log(key(d), t.purn, "(amanta", t.amanta + ")"); prevM = t.purn; }
}
