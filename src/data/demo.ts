/**
 * Demo / showcase data.
 *
 * This file describes the people, bookings and platform copy that make a fresh
 * install feel like a running product: six pandits at different stages of KYC,
 * three devotees, a spread of bookings across every booking status, reviews,
 * notifications, banners, coupons, a sent campaign, two consultations and the
 * `Setting` rows the app reads at runtime.
 *
 * Everything references other seed data by **slug** (services, temples) or by
 * **phone** (users); `prisma/seed.ts` resolves those to ids. Dates that must stay
 * "near today" are expressed as day offsets from the seed run, so the demo never
 * goes stale.
 *
 * Amounts are intentionally NOT hard-coded: the seed computes
 * `amountBase` from the chosen package, `amountAddons` from the chosen add-on
 * slugs and `amountDiscount` from the coupon, so the numbers always agree with
 * the catalogue.
 *
 * KYC document images are placeholder SVGs under `public/uploads/demo/kyc/`,
 * each clearly stamped "DEMO DOCUMENT". Document numbers here are fictitious and
 * are masked with `maskDoc()` before they are written to the database.
 */
import type {
  BookingStatusName,
  KycDocTypeName,
  KycStatusName,
  NotificationTypeName,
  PanditClassificationName,
  PaymentStatusName,
} from "./types";

// ───────────────────────────── pandits ─────────────────────────────

export type DemoKycDoc = {
  type: KycDocTypeName;
  fileUrl: string;
  /** Fictitious number; the seed stores it masked via `maskDoc()`. */
  docNumber: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
};

export type DemoAvailability = {
  weekday: number; // 0 = Sunday
  startTime: string;
  endTime: string;
  enabled: boolean;
};

export type DemoPandit = {
  phone: string;
  name: string;
  displayName: string;
  displayNameHi: string;
  bio: string;
  bioHi: string;
  photoUrl: string;
  classification: PanditClassificationName;
  specialities: string[];
  languages: string[];
  experienceYears: number;
  sampradaya: string;
  gotra: string;
  education: string;
  educationHi: string;
  city: string;
  state: string;
  pincode: string;
  serviceRadiusKm: number;
  servesOnline: boolean;
  servesAtHome: boolean;
  servesAtTemple: boolean;
  templeSlug: string | null;
  kycStatus: KycStatusName;
  kycReviewNote: string | null;
  verified: boolean;
  featured: boolean;
  isActive: boolean;
  ratingAvg: number;
  ratingCount: number;
  completedCount: number;
  commissionPct: number;
  bankAccountName: string | null;
  bankAccountNo: string | null;
  bankIfsc: string | null;
  upiId: string | null;
  documents: DemoKycDoc[];
  availability: DemoAvailability[];
  /** Services this pandit offers; ignored for pandits who are not approved. */
  serviceSlugs: string[];
};

const DOC = (type: KycDocTypeName, file: string, docNumber: string | null, status: DemoKycDoc["status"], note: string | null = null): DemoKycDoc => ({
  type,
  fileUrl: `/uploads/demo/kyc/${file}.svg`,
  docNumber,
  status,
  note,
});

/** Mon–Sat mornings and evenings — the shape most pandits actually work. */
const STANDARD_WEEK: DemoAvailability[] = [
  { weekday: 1, startTime: "06:00", endTime: "12:00", enabled: true },
  { weekday: 2, startTime: "06:00", endTime: "12:00", enabled: true },
  { weekday: 3, startTime: "06:00", endTime: "12:00", enabled: true },
  { weekday: 4, startTime: "06:00", endTime: "12:00", enabled: true },
  { weekday: 5, startTime: "06:00", endTime: "12:00", enabled: true },
  { weekday: 6, startTime: "06:00", endTime: "12:00", enabled: true },
  { weekday: 0, startTime: "07:00", endTime: "11:00", enabled: true },
];

export const DEMO_PANDITS: DemoPandit[] = [
  {
    phone: "+919000000001",
    name: "Rajesh Shastri",
    displayName: "Pt. Rajesh Shastri",
    displayNameHi: "पं. राजेश शास्त्री",
    bio: "A Kashi-born vedic acharya of the twenty-second year of practice, Pt. Rajesh Shastri performs Rudrabhishek, Mahamrityunjay jaap and navgrah havan at the Vishwanath dham and at devotees' homes across Varanasi. He learned karmakanda from his father and grandfather before taking his Acharya at Sampoornanand, and he still insists on chanting the Rudri from memory rather than from a book. Devotees mention two things about him most often — that he explains the meaning of every ahuti as it is offered, and that he never rushes a sankalp.",
    bioHi: "काशी में जन्मे बाईसवें वर्ष के अभ्यासरत वैदिक आचार्य पं. राजेश शास्त्री विश्वनाथ धाम तथा वाराणसी भर के भक्तों के घरों में रुद्राभिषेक, महामृत्युंजय जाप एवं नवग्रह हवन संपन्न कराते हैं। संपूर्णानंद से आचार्य करने से पूर्व उन्होंने कर्मकांड अपने पिता एवं पितामह से सीखा, और आज भी रुद्री का पाठ पुस्तक से नहीं, कंठ से करने पर आग्रह रखते हैं। भक्त उनके विषय में दो बातें सर्वाधिक कहते हैं — कि वे प्रत्येक आहुति का अर्थ उसी क्षण समझाते हैं, और संकल्प में कभी जल्दबाज़ी नहीं करते।",
    photoUrl: "/uploads/demo/pandits/rajesh-shastri.svg",
    classification: "VEDIC",
    specialities: ["rudrabhishek", "mahamrityunjay", "havan", "navgrah-shanti", "satyanarayan", "griha-pravesh"],
    languages: ["hi", "sa", "en", "bho"],
    experienceYears: 22,
    sampradaya: "smarta",
    gotra: "Kashyap",
    education: "Acharya (Karmakand), Sampoornanand Sanskrit Vishwavidyalaya, Varanasi",
    educationHi: "आचार्य (कर्मकांड), संपूर्णानंद संस्कृत विश्वविद्यालय, वाराणसी",
    city: "Varanasi",
    state: "Uttar Pradesh",
    pincode: "221001",
    serviceRadiusKm: 30,
    servesOnline: true,
    servesAtHome: true,
    servesAtTemple: true,
    templeSlug: "kashi-vishwanath",
    kycStatus: "APPROVED",
    kycReviewNote: "All documents verified against the originals. Diksha certificate confirmed with the university.",
    verified: true,
    featured: true,
    isActive: true,
    ratingAvg: 4.9,
    ratingCount: 214,
    completedCount: 1180,
    commissionPct: 18,
    bankAccountName: "Rajesh Shastri",
    bankAccountNo: "XXXXXXXX4471",
    bankIfsc: "SBIN0001234",
    upiId: "rajeshshastri@upi",
    documents: [
      DOC("PHOTO", "photo", null, "APPROVED"),
      DOC("AADHAAR_FRONT", "aadhaar-front", "4821 7734 9052", "APPROVED"),
      DOC("AADHAAR_BACK", "aadhaar-back", "4821 7734 9052", "APPROVED"),
      DOC("PAN", "pan", "ABCPS1234F", "APPROVED"),
      DOC("CERTIFICATE", "certificate", "SSV-ACH-2004-1187", "APPROVED", "Acharya (Karmakand), verified with the university registrar."),
      DOC("BANK_PROOF", "bank-proof", "SBIN0001234", "APPROVED"),
    ],
    availability: STANDARD_WEEK,
    serviceSlugs: [
      "rudrabhishek-kashi-vishwanath",
      "mahamrityunjay-jaap-mahakaleshwar",
      "navgrah-shanti-trimbakeshwar",
      "satyanarayan-katha-online",
      "satyanarayan-katha-at-home",
      "havan-yagya-at-home",
      "griha-pravesh-pooja-at-home",
      "vastu-shanti-pooja-at-home",
      "shravan-somvar-rudrabhishek",
      "kashi-ganga-aarti-vip-darshan",
    ],
  },

  {
    phone: "+919000000002",
    name: "Devendra Mishra",
    displayName: "Acharya Devendra Mishra",
    displayNameHi: "आचार्य देवेंद्र मिश्र",
    bio: "Acharya Devendra Mishra is a household purohit in the old sense — the pandit families in Ujjain call for a griha pravesh, a naamkaran, a mundan and, twenty years later, for the wedding of the same child. He has conducted over nine hundred sanskars, speaks Marathi as easily as Hindi, and is known for settling differences between two families' customs before the mandap rather than during it. He carries his own samagri and has never once asked a devotee for dakshina at the door.",
    bioHi: "आचार्य देवेंद्र मिश्र पुराने अर्थों में पारिवारिक पुरोहित हैं — उज्जैन के परिवार उन्हें गृह प्रवेश, नामकरण, मुंडन के लिए बुलाते हैं और बीस वर्ष बाद उसी बालक के विवाह के लिए भी। उन्होंने नौ सौ से अधिक संस्कार संपन्न कराए हैं, मराठी उतनी ही सहजता से बोलते हैं जितनी हिंदी, और इस बात के लिए जाने जाते हैं कि दो परिवारों की परंपराओं का अंतर वे मंडप पर नहीं, उससे पहले ही सुलझा लेते हैं। वे अपनी सामग्री स्वयं लाते हैं और आज तक किसी भक्त से द्वार पर दक्षिणा नहीं माँगी।",
    photoUrl: "/uploads/demo/pandits/devendra-mishra.svg",
    classification: "PUROHIT",
    specialities: ["griha-pravesh", "vivah", "naamkaran", "mundan", "annaprashan", "satyanarayan", "vastu-shanti", "office-opening"],
    languages: ["hi", "sa", "mr", "en"],
    experienceYears: 18,
    sampradaya: "shaiva",
    gotra: "Bharadwaj",
    education: "Shastri (Dharmashastra), Maharshi Panini Sanskrit Vishwavidyalaya, Ujjain",
    educationHi: "शास्त्री (धर्मशास्त्र), महर्षि पाणिनि संस्कृत विश्वविद्यालय, उज्जैन",
    city: "Ujjain",
    state: "Madhya Pradesh",
    pincode: "456001",
    serviceRadiusKm: 40,
    servesOnline: true,
    servesAtHome: true,
    servesAtTemple: true,
    templeSlug: "mahakaleshwar",
    kycStatus: "APPROVED",
    kycReviewNote: "Documents verified. Shastri certificate confirmed.",
    verified: true,
    featured: false,
    isActive: true,
    ratingAvg: 4.8,
    ratingCount: 168,
    completedCount: 940,
    commissionPct: 20,
    bankAccountName: "Devendra Mishra",
    bankAccountNo: "XXXXXXXX2298",
    bankIfsc: "BKID0006612",
    upiId: "devendramishra@upi",
    documents: [
      DOC("PHOTO", "photo", null, "APPROVED"),
      DOC("AADHAAR_FRONT", "aadhaar-front", "6612 4409 3318", "APPROVED"),
      DOC("AADHAAR_BACK", "aadhaar-back", "6612 4409 3318", "APPROVED"),
      DOC("PAN", "pan", "AFTPM9087K", "APPROVED"),
      DOC("CERTIFICATE", "certificate", "MPSV-SHA-2008-0442", "APPROVED"),
      DOC("ADDRESS_PROOF", "address-proof", "MPPKVV-9052117", "APPROVED"),
    ],
    availability: [
      { weekday: 1, startTime: "06:30", endTime: "13:00", enabled: true },
      { weekday: 2, startTime: "06:30", endTime: "13:00", enabled: true },
      { weekday: 3, startTime: "06:30", endTime: "13:00", enabled: true },
      { weekday: 4, startTime: "06:30", endTime: "13:00", enabled: true },
      { weekday: 5, startTime: "06:30", endTime: "13:00", enabled: true },
      { weekday: 6, startTime: "06:30", endTime: "18:30", enabled: true },
      { weekday: 0, startTime: "08:00", endTime: "12:00", enabled: false },
    ],
    serviceSlugs: [
      "griha-pravesh-pooja-at-home",
      "satyanarayan-katha-at-home",
      "vivah-sanskar-pandit",
      "naamkaran-sanskar-at-home",
      "mundan-sanskar-at-home",
      "annaprashan-sanskar-at-home",
      "vastu-shanti-pooja-at-home",
      "shop-office-opening-pooja",
      "vahan-pooja-at-home",
    ],
  },

  {
    phone: "+919000000003",
    name: "Hariom Tiwari",
    displayName: "Pt. Hariom Tiwari",
    displayNameHi: "पं. हरिओम तिवारी",
    bio: "Pt. Hariom Tiwari has spent twenty-six years at the Vishnupad ghats of Gaya doing the one karma most pandits avoid: shraddh, tarpan and pind daan for families who arrive carrying grief. He conducts tripindi shraddh, Narayan bali and pitru dosh nivaran, and he is unusually careful about gotra and about naming ancestors whose tithi is unknown. Families who come to him once tend to return every Pitru Paksha for the rest of their lives.",
    bioHi: "पं. हरिओम तिवारी ने गया के विष्णुपद घाटों पर छब्बीस वर्ष वही कर्म करते बिताए हैं जिससे अधिकांश पंडित बचते हैं: श्राद्ध, तर्पण एवं पिंड दान उन परिवारों के लिए जो शोक लेकर आते हैं। वे त्रिपिंडी श्राद्ध, नारायण बलि एवं पितृ दोष निवारण कराते हैं, और गोत्र तथा उन पितरों के नामोच्चारण को लेकर असाधारण रूप से सजग रहते हैं जिनकी तिथि ज्ञात नहीं। जो परिवार एक बार उनके पास आते हैं, वे प्रायः जीवनभर हर पितृ पक्ष में लौटते हैं।",
    photoUrl: "/uploads/demo/pandits/hariom-tiwari.svg",
    classification: "KARMAKANDI",
    specialities: ["shraddh", "pitru-dosh", "kaal-sarp", "navgrah-shanti", "havan", "mahamrityunjay", "sunderkand"],
    languages: ["hi", "sa", "bho"],
    experienceYears: 26,
    sampradaya: "vaishnava",
    gotra: "Vashishtha",
    education: "Acharya (Jyotish & Karmakand), Kameshwar Singh Darbhanga Sanskrit University",
    educationHi: "आचार्य (ज्योतिष एवं कर्मकांड), कामेश्वर सिंह दरभंगा संस्कृत विश्वविद्यालय",
    city: "Gaya",
    state: "Bihar",
    pincode: "823001",
    serviceRadiusKm: 25,
    servesOnline: true,
    servesAtHome: true,
    servesAtTemple: true,
    templeSlug: "vishnupad-gaya",
    kycStatus: "APPROVED",
    kycReviewNote: "Verified. Temple panda registration also checked with the Vishnupad committee.",
    verified: true,
    featured: false,
    isActive: true,
    ratingAvg: 4.9,
    ratingCount: 141,
    completedCount: 1420,
    commissionPct: 20,
    bankAccountName: "Hariom Tiwari",
    bankAccountNo: "XXXXXXXX8830",
    bankIfsc: "PUNB0234500",
    upiId: "hariomtiwari@upi",
    documents: [
      DOC("PHOTO", "photo", null, "APPROVED"),
      DOC("AADHAAR_FRONT", "aadhaar-front", "3318 9021 7745", "APPROVED"),
      DOC("AADHAAR_BACK", "aadhaar-back", "3318 9021 7745", "APPROVED"),
      DOC("PAN", "pan", "AKQPT4471L", "APPROVED"),
      DOC("CERTIFICATE", "certificate", "KSDSU-ACH-1999-0217", "APPROVED"),
      DOC("BANK_PROOF", "bank-proof", "PUNB0234500", "APPROVED"),
    ],
    availability: [
      { weekday: 1, startTime: "05:30", endTime: "11:30", enabled: true },
      { weekday: 2, startTime: "05:30", endTime: "11:30", enabled: true },
      { weekday: 3, startTime: "05:30", endTime: "11:30", enabled: true },
      { weekday: 4, startTime: "05:30", endTime: "11:30", enabled: true },
      { weekday: 5, startTime: "05:30", endTime: "11:30", enabled: true },
      { weekday: 6, startTime: "05:30", endTime: "16:00", enabled: true },
      { weekday: 0, startTime: "05:30", endTime: "11:30", enabled: true },
    ],
    serviceSlugs: [
      "pitru-dosh-tripindi-shraddh-gaya",
      "shraddh-pind-daan-at-home",
      "kaal-sarp-dosh-trimbakeshwar",
      "navgrah-shanti-trimbakeshwar",
      "shani-sade-sati-shanti-shingnapur",
      "havan-yagya-at-home",
      "sunderkand-path-at-home",
      "monthly-sunderkand-path-online",
      "mata-ki-chowki-jagran",
    ],
  },

  {
    phone: "+919000000004",
    name: "Sunil Joshi",
    displayName: "Jyotishacharya Sunil Joshi",
    displayNameHi: "ज्योतिषाचार्य सुनील जोशी",
    bio: "Jyotishacharya Sunil Joshi reads charts the old way — Lahiri ayanamsa, parashari dasha, and a long look at the dispositor before any verdict is given. Fifteen years of consulting in Jaipur have made him blunt about what a chart does and does not show, and he refuses to prescribe an expensive ratna where a japa will do. He consults in Hindi and English on kundli analysis, milan, muhurat and vastu.",
    bioHi: "ज्योतिषाचार्य सुनील जोशी कुंडली पुराने ढंग से पढ़ते हैं — लाहिड़ी अयनांश, पराशरी दशा, और कोई निर्णय देने से पूर्व दिशाधिपति पर लंबी दृष्टि। जयपुर में पंद्रह वर्षों के परामर्श ने उन्हें इस विषय में स्पष्टवादी बना दिया है कि कुंडली क्या दिखाती है और क्या नहीं, और जहाँ जप से काम चल जाए वहाँ वे महँगा रत्न बताने से इनकार कर देते हैं। वे कुंडली विश्लेषण, मिलान, मुहूर्त एवं वास्तु पर हिंदी तथा अंग्रेज़ी में परामर्श देते हैं।",
    photoUrl: "/uploads/demo/pandits/sunil-joshi.svg",
    classification: "JYOTISHI",
    specialities: ["kundli", "muhurat", "mangal-dosh", "navgrah-shanti", "vastu-shanti", "kaal-sarp"],
    languages: ["hi", "en", "sa"],
    experienceYears: 15,
    sampradaya: "smarta",
    gotra: "Garg",
    education: "Jyotish Acharya, Rashtriya Sanskrit Sansthan, Jaipur",
    educationHi: "ज्योतिष आचार्य, राष्ट्रीय संस्कृत संस्थान, जयपुर",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
    serviceRadiusKm: 20,
    servesOnline: true,
    servesAtHome: false,
    servesAtTemple: false,
    templeSlug: null,
    kycStatus: "SUBMITTED",
    kycReviewNote: null,
    verified: false,
    featured: false,
    isActive: true,
    ratingAvg: 4.7,
    ratingCount: 46,
    completedCount: 210,
    commissionPct: 20,
    bankAccountName: "Sunil Joshi",
    bankAccountNo: "XXXXXXXX6104",
    bankIfsc: "HDFC0000321",
    upiId: "suniljoshi@upi",
    documents: [
      DOC("PHOTO", "photo", null, "PENDING"),
      DOC("AADHAAR_FRONT", "aadhaar-front", "9052 6612 4409", "PENDING"),
      DOC("AADHAAR_BACK", "aadhaar-back", "9052 6612 4409", "PENDING"),
      DOC("PAN", "pan", "BNZPJ7745M", "PENDING"),
      DOC("CERTIFICATE", "certificate", "RSS-JYO-2011-0908", "PENDING", "Awaiting confirmation from the institute."),
    ],
    availability: [
      { weekday: 1, startTime: "10:00", endTime: "19:00", enabled: true },
      { weekday: 2, startTime: "10:00", endTime: "19:00", enabled: true },
      { weekday: 3, startTime: "10:00", endTime: "19:00", enabled: true },
      { weekday: 4, startTime: "10:00", endTime: "19:00", enabled: true },
      { weekday: 5, startTime: "10:00", endTime: "19:00", enabled: true },
      { weekday: 6, startTime: "10:00", endTime: "14:00", enabled: true },
      { weekday: 0, startTime: "10:00", endTime: "14:00", enabled: false },
    ],
    serviceSlugs: [
      "detailed-kundli-report-pdf",
      "kundli-milan-matchmaking",
      "talk-to-jyotishi-consultation",
      "shubh-muhurat-consultation",
      "mangal-dosh-nivaran-mangalnath",
      "navgrah-shanti-trimbakeshwar",
    ],
  },

  {
    phone: "+919000000005",
    name: "Manoj Upadhyay",
    displayName: "Pt. Manoj Upadhyay",
    displayNameHi: "पं. मनोज उपाध्याय",
    bio: "Pt. Manoj Upadhyay follows the Shakta tradition at Kamakhya and performs Chandi path, Durga Saptashati and the Navratri anushthans of the Nilachal hill. He has twelve years of practice and is fluent in Bengali and Assamese as well as Hindi.",
    bioHi: "पं. मनोज उपाध्याय कामाख्या में शाक्त परंपरा का पालन करते हैं और नीलाचल पर्वत के चंडी पाठ, दुर्गा सप्तशती तथा नवरात्रि अनुष्ठान संपन्न कराते हैं। उन्हें बारह वर्ष का अभ्यास है और वे हिंदी के साथ बंगाली एवं असमिया में भी सहज हैं।",
    photoUrl: "/uploads/demo/pandits/manoj-upadhyay.svg",
    classification: "TANTRIK",
    specialities: ["durga-path", "kaal-sarp", "mangal-dosh", "havan", "navgrah-shanti"],
    languages: ["hi", "bn", "sa"],
    experienceYears: 12,
    sampradaya: "shakta",
    gotra: "Kaushik",
    education: "Shastri (Sanskrit), Gauhati University",
    educationHi: "शास्त्री (संस्कृत), गुवाहाटी विश्वविद्यालय",
    city: "Guwahati",
    state: "Assam",
    pincode: "781010",
    serviceRadiusKm: 20,
    servesOnline: true,
    servesAtHome: true,
    servesAtTemple: true,
    templeSlug: "kamakhya",
    kycStatus: "REJECTED",
    kycReviewNote:
      "Rejected on 2 counts: the Aadhaar back image is cropped and the address is unreadable, and the name on the bank proof (M. Upadhyay HUF) does not match the profile name. Please re-upload a full, uncropped Aadhaar back and a personal account passbook, then resubmit — the application will be reviewed within 48 hours.",
    verified: false,
    featured: false,
    isActive: true,
    ratingAvg: 0,
    ratingCount: 0,
    completedCount: 0,
    commissionPct: 20,
    bankAccountName: "M. Upadhyay HUF",
    bankAccountNo: "XXXXXXXX5517",
    bankIfsc: "UBIN0812345",
    upiId: null,
    documents: [
      DOC("PHOTO", "photo", null, "APPROVED"),
      DOC("AADHAAR_FRONT", "aadhaar-front", "7745 3318 6612", "APPROVED"),
      DOC("AADHAAR_BACK", "aadhaar-back", "7745 3318 6612", "REJECTED", "Image is cropped — the address block is cut off. Please re-upload the full back side."),
      DOC("PAN", "pan", "CJKPU5517N", "APPROVED"),
      DOC("BANK_PROOF", "bank-proof", "UBIN0812345", "REJECTED", "Account name (M. Upadhyay HUF) does not match the profile name. A personal savings account is required."),
    ],
    availability: [
      { weekday: 2, startTime: "06:00", endTime: "12:00", enabled: true },
      { weekday: 5, startTime: "06:00", endTime: "12:00", enabled: true },
      { weekday: 6, startTime: "06:00", endTime: "12:00", enabled: true },
      { weekday: 0, startTime: "06:00", endTime: "12:00", enabled: true },
    ],
    serviceSlugs: [],
  },

  {
    phone: "+919000000006",
    name: "Vinod Dubey",
    displayName: "Acharya Vinod Dubey",
    displayNameHi: "आचार्य विनोद दुबे",
    bio: "Acharya Vinod Dubey is a kathavachak of the Vrindavan tradition who has completed more than two hundred Bhagwat saptahs and Shiv Mahapuran kathas. He sings the katha rather than reads it, and his Sudama prasang has a reputation of its own in Braj.",
    bioHi: "आचार्य विनोद दुबे वृंदावन परंपरा के कथावाचक हैं जिन्होंने दो सौ से अधिक भागवत सप्ताह एवं शिव महापुराण कथाएँ पूर्ण की हैं। वे कथा पढ़ते नहीं, गाते हैं, और उनके सुदामा प्रसंग की ब्रज में अपनी अलग प्रतिष्ठा है।",
    photoUrl: "/uploads/demo/pandits/vinod-dubey.svg",
    classification: "KATHAVACHAK",
    specialities: ["bhagwat-katha", "sunderkand", "satyanarayan", "durga-path", "ganesh-pooja"],
    languages: ["hi", "sa", "en"],
    experienceYears: 20,
    sampradaya: "vaishnava",
    gotra: "Parashar",
    education: "Acharya (Sahitya), Sri Sudarshan Sanskrit Mahavidyalaya, Vrindavan",
    educationHi: "आचार्य (साहित्य), श्री सुदर्शन संस्कृत महाविद्यालय, वृंदावन",
    city: "Vrindavan",
    state: "Uttar Pradesh",
    pincode: "281121",
    serviceRadiusKm: 60,
    servesOnline: true,
    servesAtHome: true,
    servesAtTemple: false,
    templeSlug: "banke-bihari",
    kycStatus: "IN_PROGRESS",
    kycReviewNote: null,
    verified: false,
    featured: false,
    isActive: true,
    ratingAvg: 0,
    ratingCount: 0,
    completedCount: 0,
    commissionPct: 20,
    bankAccountName: null,
    bankAccountNo: null,
    bankIfsc: null,
    upiId: "vinoddubey@upi",
    documents: [
      DOC("PHOTO", "photo", null, "PENDING"),
      DOC("AADHAAR_FRONT", "aadhaar-front", "4409 5517 3318", "PENDING"),
    ],
    availability: [
      { weekday: 1, startTime: "09:00", endTime: "12:00", enabled: true },
      { weekday: 3, startTime: "09:00", endTime: "12:00", enabled: true },
      { weekday: 5, startTime: "09:00", endTime: "12:00", enabled: true },
      { weekday: 6, startTime: "09:00", endTime: "12:00", enabled: true },
    ],
    serviceSlugs: [],
  },
];

// ───────────────────────────── devotees ─────────────────────────────

export type DemoFamilyMember = { name: string; relation: string; gotra: string | null; dob: string | null };

export type DemoDevotee = {
  phone: string;
  name: string | null;
  locale: "en" | "hi";
  gender: string | null;
  gotra: string | null;
  dob: string | null;
  tob: string | null;
  birthPlace: string | null;
  rashi: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  addressLine: string | null;
  onboarded: boolean;
  family: DemoFamilyMember[];
};

export const DEMO_DEVOTEES: DemoDevotee[] = [
  {
    phone: "+919111111111",
    name: "Ramesh Kumar",
    locale: "hi",
    gender: "male",
    gotra: "Kashyap",
    dob: "1984-07-19",
    tob: "05:42",
    birthPlace: "Meerut, Uttar Pradesh",
    rashi: "kark",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110092",
    addressLine: "B-114, Second Floor, Nirman Vihar, Vikas Marg",
    onboarded: true,
    family: [
      { name: "Sunita Kumar", relation: "spouse", gotra: "Kashyap", dob: "1987-03-02" },
      { name: "Aarav Kumar", relation: "son", gotra: "Kashyap", dob: "2015-11-08" },
      { name: "Kamla Devi", relation: "mother", gotra: "Kashyap", dob: "1958-01-26" },
    ],
  },
  {
    phone: "+919222222222",
    name: "Sunita Sharma",
    locale: "hi",
    gender: "female",
    gotra: "Bharadwaj",
    dob: "1991-05-14",
    tob: "21:10",
    birthPlace: "Jaipur, Rajasthan",
    rashi: "vrishchik",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302017",
    addressLine: "42, Shanti Path, Tilak Nagar",
    onboarded: true,
    family: [{ name: "Mahesh Sharma", relation: "spouse", gotra: "Bharadwaj", dob: "1988-09-30" }],
  },
  {
    phone: "+919333333333",
    name: null,
    locale: "en",
    gender: null,
    gotra: null,
    dob: null,
    tob: null,
    birthPlace: null,
    rashi: null,
    city: null,
    state: null,
    pincode: null,
    addressLine: null,
    onboarded: false,
    family: [],
  },
];

// ───────────────────────────── bookings ─────────────────────────────

export type DemoBookingEvent = { status: string; note: string; actorRole: "USER" | "PANDIT" | "ADMIN" | "SYSTEM"; dayOffset: number };

export type DemoBooking = {
  code: string;
  userPhone: string;
  serviceSlug: string;
  /** Package slug within the service; the seed resolves it to the row and its price. */
  packageSlug: "single" | "couple" | "family" | "joint";
  panditPhone: string | null;
  status: BookingStatusName;
  /** Days from the seed run. Negative = in the past. */
  dayOffset: number;
  createdDayOffset: number;
  scheduledSlot: string | null;
  devotees: { name: string; gotra: string; relation: string }[];
  sankalpNote: string;
  addonSlugs: string[];
  couponCode: string | null;
  useAddress: boolean;
  prasadDelivery: boolean;
  liveLink: string | null;
  videoUrl: string | null;
  photos: string[];
  panditNote: string | null;
  adminNote: string | null;
  cancelReason: string | null;
  paymentStatus: PaymentStatusName;
  paymentMethod: string | null;
  timeline: DemoBookingEvent[];
  review: { rating: number; comment: string } | null;
};

/** Devotional recordings used as the "pooja video" on completed demo bookings. */
const DEMO_VIDEOS = {
  rudrabhishek: "https://www.youtube.com/embed/ynFmkEKqLOQ",
  satyanarayan: "https://www.youtube.com/embed/XbwIGxHlQKg",
  devi: "https://www.youtube.com/embed/JePquYyxNVM",
};

const EV = (status: string, note: string, actorRole: DemoBookingEvent["actorRole"], dayOffset: number): DemoBookingEvent => ({
  status,
  note,
  actorRole,
  dayOffset,
});

export const DEMO_BOOKINGS: DemoBooking[] = [
  // ── completed ──
  {
    code: "DD-2608-K7RA",
    userPhone: "+919111111111",
    serviceSlug: "rudrabhishek-kashi-vishwanath",
    packageSlug: "single",
    panditPhone: "+919000000001",
    status: "COMPLETED",
    dayOffset: -21,
    createdDayOffset: -26,
    scheduledSlot: "06:00",
    devotees: [{ name: "Ramesh Kumar", gotra: "Kashyap", relation: "self" }],
    sankalpNote: "For my mother's health — she has been unwell since Chaitra and the doctors keep changing the medicine.",
    addonSlugs: ["ganga-jal", "prasad-delivery"],
    couponCode: "WELCOME101",
    useAddress: false,
    prasadDelivery: true,
    liveLink: null,
    videoUrl: DEMO_VIDEOS.rudrabhishek,
    photos: ["/images/services/rudrabhishek-kashi-vishwanath.svg", "/images/services/rudrabhishek-kashi-vishwanath-alt.svg"],
    panditNote: "Abhishek completed with Ganga jal drawn at Dashashwamedh at 05:10. Sankalp taken in the name of Kamla Devi, Kashyap gotra.",
    adminNote: null,
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "upi",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -26),
      EV("CONFIRMED", "Payment received", "SYSTEM", -26),
      EV("ASSIGNED", "Pt. Rajesh Shastri assigned", "ADMIN", -25),
      EV("IN_PROGRESS", "Abhishek started at the sanctum", "PANDIT", -21),
      EV("COMPLETED", "Video and photographs uploaded", "PANDIT", -21),
    ],
    review: {
      rating: 5,
      comment:
        "Pandit ji called two days before and asked for my mother's nakshatra as well, which nobody had asked me before. In the video you can hear her name clearly in the sankalp. The Ganga jal bottle reached us in five days. Worth every rupee.",
    },
  },
  {
    code: "DD-2608-M3TQ",
    userPhone: "+919111111111",
    serviceSlug: "satyanarayan-katha-at-home",
    packageSlug: "couple",
    panditPhone: "+919000000002",
    status: "COMPLETED",
    dayOffset: -14,
    createdDayOffset: -19,
    scheduledSlot: "09:00",
    devotees: [
      { name: "Ramesh Kumar", gotra: "Kashyap", relation: "self" },
      { name: "Sunita Kumar", gotra: "Kashyap", relation: "spouse" },
    ],
    sankalpNote: "Katha for the vow taken when Aarav recovered last winter.",
    addonSlugs: ["churma-panjiri", "brahmin-bhojan"],
    couponCode: null,
    useAddress: true,
    prasadDelivery: false,
    liveLink: null,
    videoUrl: DEMO_VIDEOS.satyanarayan,
    photos: ["/images/services/satyanarayan-katha-at-home.svg"],
    panditNote: "All five adhyay read in Hindi. Twenty-two guests attended. Prasad distributed.",
    adminNote: null,
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "card",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -19),
      EV("CONFIRMED", "Payment received", "SYSTEM", -19),
      EV("ASSIGNED", "Acharya Devendra Mishra assigned", "ADMIN", -18),
      EV("IN_PROGRESS", "Pandit reached the address", "PANDIT", -14),
      EV("COMPLETED", "Katha concluded, prasad distributed", "PANDIT", -14),
    ],
    review: {
      rating: 5,
      comment:
        "Acharya ji arrived thirty minutes early, brought everything including the chowki, and read the katha in Hindi so my mother-in-law could follow every word. No mention of dakshina at all. We will be calling him for Aarav's mundan.",
    },
  },
  {
    code: "DD-2608-P9WD",
    userPhone: "+919222222222",
    serviceSlug: "vaishno-devi-chunri-naariyal-chadhava",
    packageSlug: "couple",
    panditPhone: null,
    status: "COMPLETED",
    dayOffset: -11,
    createdDayOffset: -13,
    scheduledSlot: "11:00",
    devotees: [{ name: "Sunita Sharma", gotra: "Bharadwaj", relation: "self" }],
    sankalpNote: "Mannat for my brother's job — he has been trying since last Navratri.",
    addonSlugs: ["bhairav-darshan", "prasad-delivery"],
    couponCode: null,
    useAddress: false,
    prasadDelivery: true,
    liveLink: null,
    videoUrl: DEMO_VIDEOS.devi,
    photos: ["/images/services/vaishno-devi-chunri-naariyal-chadhava.svg", "/images/services/vaishno-devi-chunri-naariyal-chadhava-alt.svg"],
    panditNote: null,
    adminNote: "Atka dispatched by the shrine board on the same evening.",
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "upi",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -13),
      EV("CONFIRMED", "Payment received", "SYSTEM", -13),
      EV("IN_PROGRESS", "Sevak began the climb to the Bhawan", "SYSTEM", -11),
      EV("COMPLETED", "Offering made, atka dispatched", "ADMIN", -11),
    ],
    review: {
      rating: 4,
      comment:
        "The photograph from the Bhawan came the same day, which I did not expect. Atka took nine days to reach Jaipur instead of the seven mentioned, but everything inside was sealed and intact.",
    },
  },
  {
    code: "DD-2608-R4HN",
    userPhone: "+919111111111",
    serviceSlug: "sunderkand-path-at-home",
    packageSlug: "couple",
    panditPhone: "+919000000003",
    status: "COMPLETED",
    dayOffset: -7,
    createdDayOffset: -10,
    scheduledSlot: "18:30",
    devotees: [
      { name: "Ramesh Kumar", gotra: "Kashyap", relation: "self" },
      { name: "Kamla Devi", gotra: "Kashyap", relation: "mother" },
    ],
    sankalpNote: "Evening path before my court date. Please keep the sankalp in my mother's name too.",
    addonSlugs: ["bhajan-mandali", "boondi-prasad-51"],
    couponCode: null,
    useAddress: true,
    prasadDelivery: false,
    liveLink: null,
    videoUrl: null,
    photos: ["/images/services/sunderkand-path-at-home.svg"],
    panditNote: "Full kaand sung with mandali. About forty neighbours joined. Aarti at 21:20.",
    adminNote: null,
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "upi",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -10),
      EV("CONFIRMED", "Payment received", "SYSTEM", -10),
      EV("ASSIGNED", "Pt. Hariom Tiwari assigned", "ADMIN", -9),
      EV("IN_PROGRESS", "Path started", "PANDIT", -7),
      EV("COMPLETED", "Path concluded with aarti", "PANDIT", -7),
    ],
    review: {
      rating: 5,
      comment: "The mandali was excellent — half the colony came and stayed till the aarti. Pandit ji sang the whole kaand from memory. My mother has not stopped talking about it.",
    },
  },
  {
    code: "DD-2608-T6JV",
    userPhone: "+919222222222",
    serviceSlug: "kashi-vishwanath-prasad-box",
    packageSlug: "couple",
    panditPhone: null,
    status: "COMPLETED",
    dayOffset: -9,
    createdDayOffset: -12,
    scheduledSlot: null,
    devotees: [{ name: "Sunita Sharma", gotra: "Bharadwaj", relation: "self" }],
    sankalpNote: "Sending this to my father-in-law in Kota for his birthday.",
    addonSlugs: ["gift-wrap"],
    couponCode: null,
    useAddress: true,
    prasadDelivery: true,
    liveLink: null,
    videoUrl: null,
    photos: ["/images/services/kashi-vishwanath-prasad-box.svg"],
    panditNote: null,
    adminNote: null,
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "netbanking",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -12),
      EV("CONFIRMED", "Payment received", "SYSTEM", -12),
      EV("IN_PROGRESS", "Prasad collected and offered at the sanctum", "SYSTEM", -10),
      EV("COMPLETED", "Parcel dispatched with tracking", "ADMIN", -9),
    ],
    review: { rating: 5, comment: "The gift card with the sankalp printed on it was a lovely touch. Papa called the moment he opened it. Ganga jal vial was properly sealed." },
  },
  {
    code: "DD-2608-W2XG",
    userPhone: "+919111111111",
    serviceSlug: "mahakal-bhasma-aarti-live-darshan",
    packageSlug: "single",
    panditPhone: null,
    status: "COMPLETED",
    dayOffset: -5,
    createdDayOffset: -8,
    scheduledSlot: "04:00",
    devotees: [{ name: "Ramesh Kumar", gotra: "Kashyap", relation: "self" }],
    sankalpNote: "Been trying for a Bhasma Aarti pass for three years. This was the next best thing.",
    addonSlugs: ["aarti-reminder"],
    couponCode: "SHIVBHAKT",
    useAddress: false,
    prasadDelivery: false,
    liveLink: null,
    videoUrl: null,
    photos: ["/images/services/mahakal-bhasma-aarti-live-darshan.svg"],
    panditNote: null,
    adminNote: null,
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "upi",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -8),
      EV("CONFIRMED", "Payment received", "SYSTEM", -8),
      EV("IN_PROGRESS", "Live darshan link opened", "SYSTEM", -5),
      EV("COMPLETED", "Aarti recording uploaded", "ADMIN", -5),
    ],
    review: {
      rating: 4,
      comment: "Link opened exactly on time and the whole family watched at 3:45 am. The stream froze twice for about a minute. Recording was clean though, and my name was read out.",
    },
  },

  // ── upcoming, pandit assigned ──
  {
    code: "DD-2609-A2FH",
    userPhone: "+919111111111",
    serviceSlug: "griha-pravesh-pooja-at-home",
    packageSlug: "family",
    panditPhone: "+919000000002",
    status: "ASSIGNED",
    dayOffset: 4,
    createdDayOffset: -2,
    scheduledSlot: "06:30",
    devotees: [
      { name: "Ramesh Kumar", gotra: "Kashyap", relation: "self" },
      { name: "Sunita Kumar", gotra: "Kashyap", relation: "spouse" },
      { name: "Aarav Kumar", gotra: "Kashyap", relation: "son" },
      { name: "Kamla Devi", gotra: "Kashyap", relation: "mother" },
    ],
    sankalpNote: "Moving into the new flat in Vaishali. Please include the kitchen vidhi and the milk boiling.",
    addonSlugs: ["vastu-yantra", "toran-decor", "brahmin-bhojan"],
    couponCode: null,
    useAddress: true,
    prasadDelivery: false,
    liveLink: null,
    videoUrl: null,
    photos: [],
    panditNote: "Called the devotee, muhurat confirmed for 06:45. Bringing full samagri and havan kund.",
    adminNote: null,
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "card",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -2),
      EV("CONFIRMED", "Payment received", "SYSTEM", -2),
      EV("ASSIGNED", "Acharya Devendra Mishra assigned", "ADMIN", -1),
    ],
    review: null,
  },
  {
    code: "DD-2609-B5LK",
    userPhone: "+919222222222",
    serviceSlug: "mata-ki-chowki-jagran",
    packageSlug: "couple",
    panditPhone: "+919000000003",
    status: "ASSIGNED",
    dayOffset: 7,
    createdDayOffset: -3,
    scheduledSlot: "18:30",
    devotees: [
      { name: "Sunita Sharma", gotra: "Bharadwaj", relation: "self" },
      { name: "Mahesh Sharma", gotra: "Bharadwaj", relation: "spouse" },
    ],
    sankalpNote: "Chowki for the mannat taken at Vaishno Devi when my brother got the job.",
    addonSlugs: ["kanya-poojan-nine"],
    couponCode: null,
    useAddress: true,
    prasadDelivery: false,
    liveLink: null,
    videoUrl: null,
    photos: [],
    panditNote: "Mandali confirmed. Akhand jyot samagri arranged.",
    adminNote: null,
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "upi",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -3),
      EV("CONFIRMED", "Payment received", "SYSTEM", -3),
      EV("ASSIGNED", "Pt. Hariom Tiwari assigned", "ADMIN", -2),
    ],
    review: null,
  },
  {
    code: "DD-2609-C8NX",
    userPhone: "+919111111111",
    serviceSlug: "shraddh-pind-daan-at-home",
    packageSlug: "couple",
    panditPhone: "+919000000003",
    status: "ASSIGNED",
    dayOffset: 9,
    createdDayOffset: -1,
    scheduledSlot: "06:30",
    devotees: [{ name: "Ramesh Kumar", gotra: "Kashyap", relation: "self" }],
    sankalpNote: "Shraddh for my father, Shri Devi Prasad Kumar, Kashyap gotra. Also for my grandfather whose tithi we do not know.",
    addonSlugs: ["brahmin-bhojan-five", "gau-seva"],
    couponCode: null,
    useAddress: true,
    prasadDelivery: false,
    liveLink: null,
    videoUrl: null,
    photos: [],
    panditNote: "Both names noted. Will perform tripindi for the ancestor with an unknown tithi.",
    adminNote: null,
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "upi",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -1),
      EV("CONFIRMED", "Payment received", "SYSTEM", -1),
      EV("ASSIGNED", "Pt. Hariom Tiwari assigned", "ADMIN", -1),
    ],
    review: null,
  },

  // ── confirmed, pandit not yet assigned ──
  {
    code: "DD-2609-D4QJ",
    userPhone: "+919111111111",
    serviceSlug: "mahamrityunjay-jaap-mahakaleshwar",
    packageSlug: "couple",
    panditPhone: null,
    status: "CONFIRMED",
    dayOffset: 6,
    createdDayOffset: 0,
    scheduledSlot: "06:00",
    devotees: [
      { name: "Kamla Devi", gotra: "Kashyap", relation: "mother" },
      { name: "Ramesh Kumar", gotra: "Kashyap", relation: "self" },
    ],
    sankalpNote: "Sawa lakh jaap before my mother's operation on the 24th.",
    addonSlugs: ["mrityunjay-kavach", "prasad-delivery"],
    couponCode: null,
    useAddress: false,
    prasadDelivery: true,
    liveLink: null,
    videoUrl: null,
    photos: [],
    panditNote: null,
    adminNote: "Assign a Ujjain acharya — devotee has asked for the jaap to begin three days before the date.",
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "upi",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", 0),
      EV("CONFIRMED", "Payment received", "SYSTEM", 0),
    ],
    review: null,
  },

  // ── in progress, live ──
  {
    code: "DD-2609-E6VM",
    userPhone: "+919222222222",
    serviceSlug: "monthly-sunderkand-path-online",
    packageSlug: "single",
    panditPhone: "+919000000003",
    status: "IN_PROGRESS",
    dayOffset: 0,
    createdDayOffset: -5,
    scheduledSlot: "18:00",
    devotees: [{ name: "Sunita Sharma", gotra: "Bharadwaj", relation: "self" }],
    sankalpNote: "Monthly path, third month of the subscription.",
    addonSlugs: ["chalisa-booklet"],
    couponCode: null,
    useAddress: false,
    prasadDelivery: false,
    liveLink: "https://meet.divyadham.app/live/DD-2609-E6VM",
    videoUrl: null,
    photos: [],
    panditNote: "Path in progress from the Sankat Mochan mandir.",
    adminNote: null,
    cancelReason: null,
    paymentStatus: "PAID",
    paymentMethod: "upi",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -5),
      EV("CONFIRMED", "Payment received", "SYSTEM", -5),
      EV("ASSIGNED", "Pt. Hariom Tiwari assigned", "ADMIN", -4),
      EV("IN_PROGRESS", "Live link opened", "PANDIT", 0),
    ],
    review: null,
  },

  // ── payment pending ──
  {
    code: "DD-2609-F1YT",
    userPhone: "+919111111111",
    serviceSlug: "kashi-vishwanath-rudraksha-bilva-chadhava",
    packageSlug: "couple",
    panditPhone: null,
    status: "PENDING_PAYMENT",
    dayOffset: 2,
    createdDayOffset: 0,
    scheduledSlot: "07:00",
    devotees: [{ name: "Aarav Kumar", gotra: "Kashyap", relation: "son" }],
    sankalpNote: "For Aarav's exams. Please have the rudraksha mala returned.",
    addonSlugs: ["ganga-jal-bottle"],
    couponCode: null,
    useAddress: false,
    prasadDelivery: true,
    liveLink: null,
    videoUrl: null,
    photos: [],
    panditNote: null,
    adminNote: null,
    cancelReason: null,
    paymentStatus: "CREATED",
    paymentMethod: null,
    timeline: [EV("PENDING_PAYMENT", "Booking created, awaiting payment", "USER", 0)],
    review: null,
  },

  // ── payment failed ──
  {
    code: "DD-2609-G7ZB",
    userPhone: "+919222222222",
    serviceSlug: "chandi-havan-kamakhya",
    packageSlug: "single",
    panditPhone: null,
    status: "FAILED",
    dayOffset: 5,
    createdDayOffset: -1,
    scheduledSlot: "06:00",
    devotees: [{ name: "Sunita Sharma", gotra: "Bharadwaj", relation: "self" }],
    sankalpNote: "Chandi havan before Navratri.",
    addonSlugs: [],
    couponCode: null,
    useAddress: false,
    prasadDelivery: false,
    liveLink: null,
    videoUrl: null,
    photos: [],
    panditNote: null,
    adminNote: "Card declined by the issuing bank. Devotee informed; asked to retry with UPI.",
    cancelReason: null,
    paymentStatus: "FAILED",
    paymentMethod: "card",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -1),
      EV("FAILED", "Payment declined by the bank", "SYSTEM", -1),
    ],
    review: null,
  },

  // ── cancelled ──
  {
    code: "DD-2609-H3CR",
    userPhone: "+919111111111",
    serviceSlug: "shop-office-opening-pooja",
    packageSlug: "couple",
    panditPhone: null,
    status: "CANCELLED",
    dayOffset: 3,
    createdDayOffset: -4,
    scheduledSlot: "09:00",
    devotees: [{ name: "Ramesh Kumar", gotra: "Kashyap", relation: "self" }],
    sankalpNote: "Opening pooja for the new shop in Laxmi Nagar.",
    addonSlugs: ["new-bahi-khata"],
    couponCode: null,
    useAddress: true,
    prasadDelivery: false,
    liveLink: null,
    videoUrl: null,
    photos: [],
    panditNote: null,
    adminNote: null,
    cancelReason: "Shop possession delayed by the landlord — devotee will rebook once the date is fixed.",
    paymentStatus: "CREATED",
    paymentMethod: null,
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -4),
      EV("CANCELLED", "Cancelled by the devotee before payment", "USER", -3),
    ],
    review: null,
  },

  // ── refunded ──
  {
    code: "DD-2608-J5DS",
    userPhone: "+919222222222",
    serviceSlug: "khatu-shyam-prasad-box",
    packageSlug: "family",
    panditPhone: null,
    status: "REFUNDED",
    dayOffset: -6,
    createdDayOffset: -10,
    scheduledSlot: null,
    devotees: [{ name: "Sunita Sharma", gotra: "Bharadwaj", relation: "self" }],
    sankalpNote: "Mela hamper for the family in Sikar.",
    addonSlugs: ["express-delivery"],
    couponCode: null,
    useAddress: true,
    prasadDelivery: true,
    liveLink: null,
    videoUrl: null,
    photos: [],
    panditNote: null,
    adminNote: "Courier could not service the destination pin code. Full amount refunded to source on the same day.",
    cancelReason: "Delivery pin code not serviceable — refunded in full.",
    paymentStatus: "REFUNDED",
    paymentMethod: "upi",
    timeline: [
      EV("PENDING_PAYMENT", "Booking created", "USER", -10),
      EV("CONFIRMED", "Payment received", "SYSTEM", -10),
      EV("CANCELLED", "Pin code not serviceable", "ADMIN", -7),
      EV("REFUNDED", "Full amount refunded to source", "ADMIN", -6),
    ],
    review: null,
  },
];

// ───────────────────────────── notifications ─────────────────────────────

export type DemoNotification = {
  userPhone: string;
  type: NotificationTypeName;
  titleEn: string;
  titleHi: string;
  bodyEn: string;
  bodyHi: string;
  /** `booking:<code>` is rewritten by the seed to `/bookings/<id>`. */
  href: string;
  imageUrl: string | null;
  read: boolean;
  dedupeKey: string;
  dayOffset: number;
};

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    userPhone: "+919111111111",
    type: "FESTIVAL_REMINDER",
    titleEn: "Pitru Paksha begins soon",
    titleHi: "पितृ पक्ष शीघ्र आरंभ",
    bodyEn: "Shraddh and tarpan for your ancestors can be booked now — pandits fill up fast in the first three days.",
    bodyHi: "पितरों हेतु श्राद्ध एवं तर्पण अभी बुक किए जा सकते हैं — प्रथम तीन दिनों में पंडित जी शीघ्र व्यस्त हो जाते हैं।",
    href: "/pooja/shraddh-pind-daan-at-home",
    imageUrl: "/images/festivals/pitru-paksha.svg",
    read: false,
    dedupeKey: "demo:festival:pitru-paksha-2026:7",
    dayOffset: -1,
  },
  {
    userPhone: "+919111111111",
    type: "BOOKING_UPDATE",
    titleEn: "Pandit assigned for your Griha Pravesh",
    titleHi: "आपके गृह प्रवेश हेतु पंडित नियुक्त",
    bodyEn: "Acharya Devendra Mishra will conduct the vidhi. He will call you a day before to confirm the muhurat.",
    bodyHi: "आचार्य देवेंद्र मिश्र विधि संपन्न कराएँगे। वे मुहूर्त की पुष्टि हेतु एक दिन पूर्व आपको कॉल करेंगे।",
    href: "booking:DD-2609-A2FH",
    imageUrl: "/images/services/griha-pravesh-pooja-at-home.svg",
    read: false,
    dedupeKey: "demo:booking:DD-2609-A2FH:assigned",
    dayOffset: -1,
  },
  {
    userPhone: "+919111111111",
    type: "BOOKING_UPDATE",
    titleEn: "Your Rudrabhishek video is ready",
    titleHi: "आपके रुद्राभिषेक का वीडियो तैयार है",
    bodyEn: "The full recording, photographs and the aarti clip from Kashi Vishwanath are now in your booking.",
    bodyHi: "काशी विश्वनाथ से संपूर्ण रिकॉर्डिंग, छायाचित्र एवं आरती क्लिप अब आपकी बुकिंग में उपलब्ध हैं।",
    href: "booking:DD-2608-K7RA",
    imageUrl: "/images/services/rudrabhishek-kashi-vishwanath.svg",
    read: true,
    dedupeKey: "demo:booking:DD-2608-K7RA:completed",
    dayOffset: -21,
  },
  {
    userPhone: "+919111111111",
    type: "PROMO",
    titleEn: "₹101 off your next seva",
    titleHi: "आपकी अगली सेवा पर ₹101 की छूट",
    bodyEn: "Use code WELCOME101 on any booking above ₹501. Valid on poojas, chadhava and prasad.",
    bodyHi: "₹501 से अधिक की किसी भी बुकिंग पर कोड WELCOME101 लगाएँ। पूजा, चढ़ावा एवं प्रसाद पर मान्य।",
    href: "/poojas",
    imageUrl: "/images/festivals/dhanteras.svg",
    read: false,
    dedupeKey: "demo:promo:welcome101",
    dayOffset: -3,
  },
  {
    userPhone: "+919111111111",
    type: "PANCHANG",
    titleEn: "Today's panchang is ready",
    titleHi: "आज का पंचांग तैयार है",
    bodyEn: "Tithi, nakshatra, rahu kaal and the abhijit muhurat for your city — check before fixing anything today.",
    bodyHi: "आपके नगर हेतु तिथि, नक्षत्र, राहु काल एवं अभिजित मुहूर्त — आज कुछ भी तय करने से पूर्व देख लें।",
    href: "/panchang",
    imageUrl: null,
    read: true,
    dedupeKey: "demo:panchang:daily",
    dayOffset: 0,
  },
  {
    userPhone: "+919111111111",
    type: "SYSTEM",
    titleEn: "Add your gotra to speed up bookings",
    titleHi: "बुकिंग शीघ्र करने हेतु अपना गोत्र जोड़ें",
    bodyEn: "Your gotra and rashi are used in every sankalp. Save them once in your account and they fill in automatically.",
    bodyHi: "प्रत्येक संकल्प में आपका गोत्र एवं राशि प्रयुक्त होते हैं। इन्हें एक बार खाते में सहेजें, आगे स्वतः भर जाएँगे।",
    href: "/account",
    imageUrl: null,
    read: true,
    dedupeKey: "demo:system:profile-gotra",
    dayOffset: -6,
  },
];

// ───────────────────────────── banners ─────────────────────────────

export type DemoBanner = {
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  imageUrl: string;
  href: string;
  placement: string;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
};

export const DEMO_BANNERS: DemoBanner[] = [
  {
    titleEn: "Sharad Navratri — nine nights of the Mother",
    titleHi: "शारदीय नवरात्रि — माँ की नौ रातें",
    subtitleEn: "Book the nine-day Durga pooja at Kamakhya, or a Mata ki Chowki at your own home.",
    subtitleHi: "कामाख्या में नौ दिवसीय दुर्गा पूजा बुक करें, अथवा अपने घर पर माता की चौकी।",
    imageUrl: "/images/festivals/sharad-navratri.svg",
    href: "/pooja/navratri-durga-pooja-nine-day",
    placement: "home",
    sortOrder: 1,
    startsAt: "2026-09-20",
    endsAt: "2026-10-21",
  },
  {
    titleEn: "Pitru Paksha — tarpan for those who came before",
    titleHi: "पितृ पक्ष — पूर्वजों हेतु तर्पण",
    subtitleEn: "Tripindi shraddh at Gaya, or the complete vidhi performed at your own home.",
    subtitleHi: "गया में त्रिपिंडी श्राद्ध, अथवा आपके ही घर पर संपूर्ण विधि।",
    imageUrl: "/images/festivals/pitru-paksha.svg",
    href: "/pooja/pitru-dosh-tripindi-shraddh-gaya",
    placement: "home",
    sortOrder: 2,
    startsAt: "2026-09-15",
    endsAt: "2026-10-11",
  },
  {
    titleEn: "Diwali Lakshmi Pooja — book the muhurat early",
    titleHi: "दीपावली लक्ष्मी पूजा — मुहूर्त पहले बुक करें",
    subtitleEn: "Pradosh-kaal Lakshmi-Kuber pooja in your name, with 10% off using DIWALI10.",
    subtitleHi: "आपके नाम से प्रदोष काल लक्ष्मी-कुबेर पूजा, DIWALI10 से 10% छूट सहित।",
    imageUrl: "/images/festivals/diwali.svg",
    href: "/pooja/diwali-lakshmi-pooja-special",
    placement: "home",
    sortOrder: 3,
    startsAt: "2026-10-20",
    endsAt: "2026-11-12",
  },
];

// ───────────────────────────── coupons ─────────────────────────────

export type DemoCoupon = {
  code: string;
  descriptionEn: string;
  descriptionHi: string;
  discountPct: number | null;
  discountFlat: number | null;
  minAmount: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string | null;
  validTo: string | null;
  active: boolean;
};

export const DEMO_COUPONS: DemoCoupon[] = [
  {
    code: "WELCOME101",
    descriptionEn: "₹101 off your first seva on any booking above ₹501.",
    descriptionHi: "₹501 से अधिक की किसी भी बुकिंग पर पहली सेवा पर ₹101 की छूट।",
    discountPct: null,
    discountFlat: 101,
    minAmount: 501,
    maxUses: 5000,
    usedCount: 1284,
    validFrom: null,
    validTo: null,
    active: true,
  },
  {
    code: "DIWALI10",
    descriptionEn: "10% off every Diwali seva on bookings above ₹1,001.",
    descriptionHi: "₹1,001 से अधिक की बुकिंग पर प्रत्येक दीपावली सेवा पर 10% छूट।",
    discountPct: 10,
    discountFlat: null,
    minAmount: 1001,
    maxUses: 2000,
    usedCount: 0,
    validFrom: "2026-10-25",
    validTo: "2026-11-10",
    active: true,
  },
  {
    code: "SHIVBHAKT",
    descriptionEn: "15% off Shiva poojas — Rudrabhishek, Mahamrityunjay jaap and Shravan Somvar seva.",
    descriptionHi: "शिव पूजाओं पर 15% छूट — रुद्राभिषेक, महामृत्युंजय जाप एवं श्रावण सोमवार सेवा।",
    discountPct: 15,
    discountFlat: null,
    minAmount: 0,
    maxUses: null,
    usedCount: 342,
    validFrom: null,
    validTo: null,
    active: true,
  },
];

// ───────────────────────────── campaign ─────────────────────────────

export type DemoCampaign = {
  titleEn: string;
  titleHi: string;
  bodyEn: string;
  bodyHi: string;
  href: string;
  imageUrl: string;
  audience: string;
  status: string;
  sentCount: number;
  sentDayOffset: number;
};

export const DEMO_CAMPAIGNS: DemoCampaign[] = [
  {
    titleEn: "Pitru Paksha starts on 27 September",
    titleHi: "पितृ पक्ष 27 सितंबर से आरंभ",
    bodyEn: "Book shraddh, tarpan and pind daan at Gaya or at your own home. Slots on the first three days fill fastest.",
    bodyHi: "गया अथवा अपने घर पर श्राद्ध, तर्पण एवं पिंड दान बुक करें। प्रथम तीन दिनों के स्लॉट सबसे तेज़ी से भरते हैं।",
    href: "/pooja/pitru-dosh-tripindi-shraddh-gaya",
    imageUrl: "/images/festivals/pitru-paksha.svg",
    audience: "ONBOARDED",
    status: "SENT",
    sentCount: 2,
    sentDayOffset: -2,
  },
];

// ───────────────────────────── consultations ─────────────────────────────

export type DemoConsultation = {
  userPhone: string;
  panditPhone: string | null;
  topic: string;
  question: string;
  mode: "chat" | "call" | "video";
  status: "REQUESTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  answer: string | null;
  meetingLink: string | null;
  amount: number;
  scheduledDayOffset: number | null;
  createdDayOffset: number;
};

export const DEMO_CONSULTATIONS: DemoConsultation[] = [
  {
    userPhone: "+919111111111",
    panditPhone: null,
    topic: "career",
    question:
      "I have an offer from a company in Pune at a higher salary, but it means moving the whole family and taking my son out of his school mid-year. My current job is stable but has gone nowhere for four years. Should I take it, and if so, when?",
    mode: "call",
    status: "REQUESTED",
    answer: null,
    meetingLink: null,
    amount: 351,
    scheduledDayOffset: null,
    createdDayOffset: 0,
  },
  {
    userPhone: "+919222222222",
    panditPhone: "+919000000004",
    topic: "marriage",
    question:
      "My younger sister is 29 and every match has fallen through at the last stage. Two pandits have told her there is Mangal dosh. Is it really there in her chart, and what should we actually do about it?",
    mode: "video",
    status: "COMPLETED",
    answer:
      "There is Mangal in the eighth house from the lagna, so the dosh is present — but it is substantially cancelled here, because Mangal is in its own rashi and Guru aspects the seventh house directly. This is a well-known parihar and no competent jyotishi should be treating the match as impossible. What is actually delaying things is the Shani antardasha running until Chaitra next year, which is why proposals stall at the final stage rather than at the start. Practical advice: do not force a decision before that dasha changes; have her keep the Tuesday fast and offer masoor daal and red cloth at a Hanuman temple; a Mangal shanti with 10,000 japa is enough — the expensive remedies she has been offered are not required. Look again seriously from Vaishakha onwards.",
    meetingLink: "https://meet.divyadham.app/consult/DD-CN-0042",
    amount: 651,
    scheduledDayOffset: -8,
    createdDayOffset: -12,
  },
];

// ───────────────────────────── settings ─────────────────────────────

export const DEMO_SETTINGS: Record<string, string> = {
  app_name: "DivyaDham",
  tagline_en: "Temples, poojas and pandits — wherever you are",
  tagline_hi: "मंदिर, पूजा और पंडित — आप जहाँ भी हों",
  support_phone: "+919000000000",
  support_email: "seva@divyadham.app",
  support_whatsapp: "+919000000000",
  commission_pct: "20",
  currency: "INR",
  home_notice_en: "Pitru Paksha bookings are open — shraddh and tarpan slots at Gaya fill fastest in the first three days.",
  home_notice_hi: "पितृ पक्ष की बुकिंग खुली है — गया में श्राद्ध एवं तर्पण के स्लॉट प्रथम तीन दिनों में सबसे तेज़ी से भरते हैं।",
  maintenance_banner_en: "",
  maintenance_banner_hi: "",
  terms_url: "/legal/terms",
  privacy_url: "/legal/privacy",
};
