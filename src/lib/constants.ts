/**
 * Shared domain constants with bilingual labels.
 * Use `label(x, locale)` helpers or index by locale directly: CLASSIFICATIONS[0].label.hi
 */
import type { Locale } from "@/i18n/config";

export type Bi = { en: string; hi: string };
export const bi = (en: string, hi: string): Bi => ({ en, hi });
export const pickBi = (b: Bi | undefined, locale: Locale) => (b ? b[locale] || b.en : "");

export const PANDIT_CLASSIFICATIONS = [
  { value: "VEDIC", label: bi("Vedic Acharya", "वैदिक आचार्य"), desc: bi("Yajna, homam, vedic chanting", "यज्ञ, हवन, वैदिक मंत्रोच्चार") },
  { value: "PUROHIT", label: bi("Purohit", "पुरोहित"), desc: bi("Family rituals & sanskars", "पारिवारिक पूजा एवं संस्कार") },
  { value: "JYOTISHI", label: bi("Jyotishi", "ज्योतिषी"), desc: bi("Kundli, muhurat, predictions", "कुंडली, मुहूर्त, भविष्यफल") },
  { value: "KARMAKANDI", label: bi("Karmakandi", "कर्मकांडी"), desc: bi("Shanti paths, dosh nivaran", "शांति पाठ, दोष निवारण") },
  { value: "TANTRIK", label: bi("Shakta / Tantra", "शाक्त / तंत्र"), desc: bi("Devi sadhana, tantric rituals", "देवी साधना, तांत्रिक अनुष्ठान") },
  { value: "VASTU", label: bi("Vastu Acharya", "वास्तु आचार्य"), desc: bi("Vastu consultation & shanti", "वास्तु परामर्श एवं शांति") },
  { value: "KATHAVACHAK", label: bi("Kathavachak", "कथावाचक"), desc: bi("Bhagwat, Ramayan, Shiv katha", "भागवत, रामायण, शिव कथा") },
] as const;

export const SPECIALITIES = [
  { value: "griha-pravesh", label: bi("Griha Pravesh", "गृह प्रवेश") },
  { value: "satyanarayan", label: bi("Satyanarayan Katha", "सत्यनारायण कथा") },
  { value: "vivah", label: bi("Vivah (Wedding)", "विवाह") },
  { value: "naamkaran", label: bi("Naamkaran", "नामकरण") },
  { value: "mundan", label: bi("Mundan", "मुंडन") },
  { value: "annaprashan", label: bi("Annaprashan", "अन्नप्राशन") },
  { value: "shraddh", label: bi("Shraddh / Pind Daan", "श्राद्ध / पिंड दान") },
  { value: "rudrabhishek", label: bi("Rudrabhishek", "रुद्राभिषेक") },
  { value: "mahamrityunjay", label: bi("Mahamrityunjay Jaap", "महामृत्युंजय जाप") },
  { value: "navgrah-shanti", label: bi("Navgrah Shanti", "नवग्रह शांति") },
  { value: "kaal-sarp", label: bi("Kaal Sarp Dosh", "काल सर्प दोष") },
  { value: "mangal-dosh", label: bi("Mangal Dosh", "मंगल दोष") },
  { value: "pitru-dosh", label: bi("Pitru Dosh", "पितृ दोष") },
  { value: "havan", label: bi("Havan / Yajna", "हवन / यज्ञ") },
  { value: "durga-path", label: bi("Durga Saptashati Path", "दुर्गा सप्तशती पाठ") },
  { value: "sunderkand", label: bi("Sunderkand Path", "सुंदरकांड पाठ") },
  { value: "bhagwat-katha", label: bi("Bhagwat Katha", "भागवत कथा") },
  { value: "kundli", label: bi("Kundli Analysis", "कुंडली विश्लेषण") },
  { value: "muhurat", label: bi("Muhurat", "मुहूर्त") },
  { value: "vastu-shanti", label: bi("Vastu Shanti", "वास्तु शांति") },
  { value: "lakshmi-pooja", label: bi("Lakshmi Pooja", "लक्ष्मी पूजा") },
  { value: "ganesh-pooja", label: bi("Ganesh Pooja", "गणेश पूजा") },
  { value: "office-opening", label: bi("Office / Shop Opening", "दुकान / कार्यालय उद्घाटन") },
  { value: "vahan-pooja", label: bi("Vahan Pooja", "वाहन पूजा") },
] as const;

export const LANGUAGES = [
  { value: "hi", label: bi("Hindi", "हिन्दी") },
  { value: "en", label: bi("English", "अंग्रेज़ी") },
  { value: "sa", label: bi("Sanskrit", "संस्कृत") },
  { value: "mr", label: bi("Marathi", "मराठी") },
  { value: "gu", label: bi("Gujarati", "गुजराती") },
  { value: "bn", label: bi("Bengali", "बंगाली") },
  { value: "ta", label: bi("Tamil", "तमिल") },
  { value: "te", label: bi("Telugu", "तेलुगु") },
  { value: "kn", label: bi("Kannada", "कन्नड़") },
  { value: "ml", label: bi("Malayalam", "मलयालम") },
  { value: "pa", label: bi("Punjabi", "पंजाबी") },
  { value: "or", label: bi("Odia", "ओड़िया") },
  { value: "bho", label: bi("Bhojpuri", "भोजपुरी") },
] as const;

export const SAMPRADAYAS = [
  { value: "smarta", label: bi("Smarta", "स्मार्त") },
  { value: "vaishnava", label: bi("Vaishnava", "वैष्णव") },
  { value: "shaiva", label: bi("Shaiva", "शैव") },
  { value: "shakta", label: bi("Shakta", "शाक्त") },
  { value: "arya-samaj", label: bi("Arya Samaj", "आर्य समाज") },
] as const;

export const GOTRAS = [
  "Kashyap", "Bharadwaj", "Vashishtha", "Vishwamitra", "Gautam", "Jamadagni", "Atri", "Agastya",
  "Angirasa", "Bhrigu", "Kaushik", "Shandilya", "Garg", "Parashar", "Vatsa", "Mudgal", "Sankrit",
  "Kaundinya", "Harita", "Upmanyu", "Katyayan", "Kanva", "Maudgalya", "Dhananjay", "Pulastya",
];

export const RASHIS = [
  { value: "mesh", label: bi("Mesh (Aries)", "मेष") },
  { value: "vrishabh", label: bi("Vrishabh (Taurus)", "वृषभ") },
  { value: "mithun", label: bi("Mithun (Gemini)", "मिथुन") },
  { value: "kark", label: bi("Kark (Cancer)", "कर्क") },
  { value: "singh", label: bi("Singh (Leo)", "सिंह") },
  { value: "kanya", label: bi("Kanya (Virgo)", "कन्या") },
  { value: "tula", label: bi("Tula (Libra)", "तुला") },
  { value: "vrishchik", label: bi("Vrishchik (Scorpio)", "वृश्चिक") },
  { value: "dhanu", label: bi("Dhanu (Sagittarius)", "धनु") },
  { value: "makar", label: bi("Makar (Capricorn)", "मकर") },
  { value: "kumbh", label: bi("Kumbh (Aquarius)", "कुंभ") },
  { value: "meen", label: bi("Meen (Pisces)", "मीन") },
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
  "Chandigarh", "Puducherry", "Andaman & Nicobar", "Dadra & Nagar Haveli and Daman & Diu", "Lakshadweep",
];

export const SERVICE_TYPES = [
  { value: "ONLINE_POOJA", label: bi("Online Pooja", "ऑनलाइन पूजा"), short: bi("Online", "ऑनलाइन") },
  { value: "PANDIT_AT_HOME", label: bi("Pandit at Home", "घर पर पंडित"), short: bi("At home", "घर पर") },
  { value: "CHADHAVA", label: bi("Chadhava", "चढ़ावा"), short: bi("Chadhava", "चढ़ावा") },
  { value: "ASTROLOGY", label: bi("Astrology", "ज्योतिष"), short: bi("Astrology", "ज्योतिष") },
  { value: "PRASAD", label: bi("Prasad Delivery", "प्रसाद वितरण"), short: bi("Prasad", "प्रसाद") },
  { value: "KATHA", label: bi("Katha / Path", "कथा / पाठ"), short: bi("Katha", "कथा") },
  { value: "LIVE_DARSHAN", label: bi("Live Darshan", "लाइव दर्शन"), short: bi("Darshan", "दर्शन") },
] as const;

export const BOOKING_STATUSES = [
  { value: "PENDING_PAYMENT", label: bi("Payment pending", "भुगतान लंबित"), tone: "warning" },
  { value: "CONFIRMED", label: bi("Confirmed", "पुष्ट"), tone: "info" },
  { value: "ASSIGNED", label: bi("Pandit assigned", "पंडित नियुक्त"), tone: "info" },
  { value: "IN_PROGRESS", label: bi("In progress", "प्रगति में"), tone: "info" },
  { value: "COMPLETED", label: bi("Completed", "पूर्ण"), tone: "success" },
  { value: "CANCELLED", label: bi("Cancelled", "रद्द"), tone: "danger" },
  { value: "REFUNDED", label: bi("Refunded", "धनवापसी"), tone: "muted" },
  { value: "FAILED", label: bi("Failed", "असफल"), tone: "danger" },
] as const;

export const KYC_STATUSES = [
  { value: "NOT_STARTED", label: bi("Not started", "शुरू नहीं"), tone: "muted" },
  { value: "IN_PROGRESS", label: bi("In progress", "प्रगति में"), tone: "warning" },
  { value: "SUBMITTED", label: bi("Under review", "समीक्षा में"), tone: "info" },
  { value: "APPROVED", label: bi("Approved", "स्वीकृत"), tone: "success" },
  { value: "REJECTED", label: bi("Rejected", "अस्वीकृत"), tone: "danger" },
] as const;

export const KYC_DOC_TYPES = [
  { value: "PHOTO", label: bi("Profile photo", "प्रोफ़ाइल फ़ोटो"), required: true },
  { value: "AADHAAR_FRONT", label: bi("Aadhaar (front)", "आधार (सामने)"), required: true },
  { value: "AADHAAR_BACK", label: bi("Aadhaar (back)", "आधार (पीछे)"), required: true },
  { value: "PAN", label: bi("PAN card", "पैन कार्ड"), required: true },
  { value: "CERTIFICATE", label: bi("Education / Diksha certificate", "शिक्षा / दीक्षा प्रमाणपत्र"), required: false },
  { value: "BANK_PROOF", label: bi("Bank passbook / cheque", "बैंक पासबुक / चेक"), required: false },
  { value: "ADDRESS_PROOF", label: bi("Address proof", "पता प्रमाण"), required: false },
] as const;

export const FESTIVAL_TYPES = [
  { value: "FESTIVAL", label: bi("Festival", "त्योहार") },
  { value: "VRAT", label: bi("Vrat", "व्रत") },
  { value: "EKADASHI", label: bi("Ekadashi", "एकादशी") },
  { value: "PURNIMA", label: bi("Purnima", "पूर्णिमा") },
  { value: "AMAVASYA", label: bi("Amavasya", "अमावस्या") },
  { value: "JAYANTI", label: bi("Jayanti", "जयंती") },
  { value: "SANKRANTI", label: bi("Sankranti", "संक्रांति") },
  { value: "PRADOSH", label: bi("Pradosh", "प्रदोष") },
  { value: "SPECIAL", label: bi("Special", "विशेष") },
] as const;

export const CONSULT_TOPICS = [
  { value: "kundli", label: bi("Kundli reading", "कुंडली विश्लेषण") },
  { value: "marriage", label: bi("Marriage & matching", "विवाह एवं मिलान") },
  { value: "career", label: bi("Career & finance", "करियर एवं धन") },
  { value: "health", label: bi("Health", "स्वास्थ्य") },
  { value: "muhurat", label: bi("Muhurat", "मुहूर्त") },
  { value: "vastu", label: bi("Vastu", "वास्तु") },
] as const;

export const WEEKDAYS = [
  bi("Sun", "रवि"), bi("Mon", "सोम"), bi("Tue", "मंगल"), bi("Wed", "बुध"), bi("Thu", "गुरु"), bi("Fri", "शुक्र"), bi("Sat", "शनि"),
];

export function labelOf<T extends readonly { value: string; label: Bi }[]>(list: T, value: string | null | undefined, locale: Locale) {
  const found = list.find((x) => x.value === value);
  return found ? pickBi(found.label, locale) : value ?? "";
}
