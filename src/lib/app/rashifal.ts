/**
 * Deterministic daily rashifal.
 * Not a claim of prediction — a stable, bilingual reading derived from the date, the rashi and the
 * day's nakshatra/tithi so that the same day always shows the same text for everyone.
 */
import { RASHIS } from "@/lib/constants";
import { hash } from "./helpers";

const LINES: { en: string; hi: string }[] = [
  { en: "A calm, steady day. Work you started earlier finally moves forward.", hi: "दिन शांत और स्थिर रहेगा। पहले शुरू किया गया कार्य आज गति पकड़ेगा।" },
  { en: "Family matters take the front seat today; a small gesture heals an old distance.", hi: "आज पारिवारिक विषय प्रमुख रहेंगे; एक छोटा-सा प्रयास पुरानी दूरी मिटा देगा।" },
  { en: "Money flows in slowly but surely. Avoid lending to someone new.", hi: "धन की आवक धीरे-धीरे परंतु निश्चित रहेगी। नए व्यक्ति को उधार देने से बचें।" },
  { en: "Your words carry weight today — use them to encourage, not to argue.", hi: "आज आपकी वाणी प्रभावशाली रहेगी — उसका उपयोग प्रोत्साहन के लिए करें, विवाद के लिए नहीं।" },
  { en: "Travel or a change of place brings a welcome idea. Keep the evening free.", hi: "यात्रा अथवा स्थान परिवर्तन से शुभ विचार मिलेगा। संध्या का समय खाली रखें।" },
  { en: "Health improves with routine. Light food and early rest suit you.", hi: "नियमित दिनचर्या से स्वास्थ्य सुधरेगा। हल्का भोजन और शीघ्र विश्राम उत्तम रहेगा।" },
  { en: "A senior or elder supports your plan. Ask before the day ends.", hi: "किसी वरिष्ठ या बड़े का सहयोग मिलेगा। दिन ढलने से पहले निवेदन कर लें।" },
  { en: "Patience wins today. What looks delayed is only being arranged well.", hi: "आज धैर्य ही विजय दिलाएगा। जो विलंबित लग रहा है, वह भली भाँति सज रहा है।" },
  { en: "Creative and devotional work both prosper. Offer a lamp at dusk.", hi: "रचनात्मक एवं भक्ति-कार्य दोनों फलदायी हैं। संध्या को दीप अवश्य जलाएँ।" },
  { en: "An old friend returns with a useful opportunity. Listen carefully.", hi: "कोई पुराना मित्र उपयोगी अवसर लेकर लौटेगा। ध्यान से सुनें।" },
  { en: "Do not sign anything in haste. Read the second page twice.", hi: "जल्दबाज़ी में कोई अनुबंध न करें। दूसरा पृष्ठ दो बार पढ़ें।" },
  { en: "Children and studies bring good news in the second half of the day.", hi: "दिन के उत्तरार्ध में संतान एवं शिक्षा से शुभ समाचार मिलेगा।" },
];

const ADVICE: { en: string; hi: string }[] = [
  { en: "Offer water to the Sun at sunrise.", hi: "सूर्योदय पर सूर्य को जल अर्पित करें।" },
  { en: "Feed a cow or a bird before noon.", hi: "दोपहर से पूर्व गाय या पक्षियों को भोजन कराएँ।" },
  { en: "Chant the Hanuman Chalisa once.", hi: "एक बार हनुमान चालीसा का पाठ करें।" },
  { en: "Light a diya with sesame oil at dusk.", hi: "संध्या को तिल के तेल का दीपक जलाएँ।" },
  { en: "Donate something white to a needy person.", hi: "किसी ज़रूरतमंद को श्वेत वस्तु दान करें।" },
  { en: "Take the blessings of your parents today.", hi: "आज माता-पिता का आशीर्वाद अवश्य लें।" },
];

const COLORS: { en: string; hi: string }[] = [
  { en: "Saffron", hi: "केसरिया" },
  { en: "Red", hi: "लाल" },
  { en: "Yellow", hi: "पीला" },
  { en: "White", hi: "श्वेत" },
  { en: "Green", hi: "हरा" },
  { en: "Blue", hi: "नीला" },
  { en: "Golden", hi: "स्वर्णिम" },
];

export type Rashifal = {
  rashi: string;
  labelEn: string;
  labelHi: string;
  textEn: string;
  textHi: string;
  adviceEn: string;
  adviceHi: string;
  colorEn: string;
  colorHi: string;
  luckyNumber: number;
  score: number; // 1..5 stars
};

/** @param seedExtra e.g. `${nakshatra.index}-${tithi.index}` so the reading shifts with the panchang. */
export function rashifalFor(rashiValue: string, dateKey: string, seedExtra = ""): Rashifal {
  const r = RASHIS.find((x) => x.value === rashiValue) ?? RASHIS[0];
  const idx = RASHIS.indexOf(r);
  const h = hash(`${dateKey}|${r.value}|${seedExtra}`);
  const line = LINES[(h + idx) % LINES.length];
  const advice = ADVICE[(h >> 3) % ADVICE.length];
  const color = COLORS[(h >> 5) % COLORS.length];
  return {
    rashi: r.value,
    labelEn: r.label.en,
    labelHi: r.label.hi,
    textEn: line.en,
    textHi: line.hi,
    adviceEn: advice.en,
    adviceHi: advice.hi,
    colorEn: color.en,
    colorHi: color.hi,
    luckyNumber: ((h >> 7) % 9) + 1,
    score: ((h >> 11) % 3) + 3,
  };
}

export function allRashifal(dateKey: string, seedExtra = ""): Rashifal[] {
  return RASHIS.map((r) => rashifalFor(r.value, dateKey, seedExtra));
}
