/* THROWAWAY dev fixture for the devotee-app agent. Delete after testing. */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const J = (v: unknown) => JSON.stringify(v);
const key = (d: Date) => d.toISOString().slice(0, 10);
const plus = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return key(d);
};

async function main() {
  const cats = [
    { slug: "shiv", nameEn: "Shiv", nameHi: "शिव", icon: "🔱", sortOrder: 1 },
    { slug: "durga", nameEn: "Durga", nameHi: "दुर्गा", icon: "🌺", sortOrder: 2 },
    { slug: "hanuman", nameEn: "Hanuman", nameHi: "हनुमान", icon: "🚩", sortOrder: 3 },
    { slug: "lakshmi", nameEn: "Lakshmi", nameHi: "लक्ष्मी", icon: "🪔", sortOrder: 4 },
    { slug: "griha", nameEn: "Griha Pravesh", nameHi: "गृह प्रवेश", icon: "🏠", sortOrder: 5 },
    { slug: "navgrah", nameEn: "Navgrah", nameHi: "नवग्रह", icon: "🪐", sortOrder: 6 },
    { slug: "pitru", nameEn: "Pitru Dosh", nameHi: "पितृ दोष", icon: "🙏", sortOrder: 7 },
    { slug: "vivah", nameEn: "Vivah", nameHi: "विवाह", icon: "💍", sortOrder: 8 },
  ];
  for (const c of cats) await db.category.upsert({ where: { slug: c.slug }, create: c, update: c });

  const temples = [
    {
      slug: "kashi-vishwanath",
      nameEn: "Kashi Vishwanath Temple",
      nameHi: "काशी विश्वनाथ मंदिर",
      deityEn: "Lord Shiva",
      deityHi: "भगवान शिव",
      city: "Varanasi",
      state: "Uttar Pradesh",
      descriptionEn: "One of the twelve Jyotirlingas, on the western bank of the Ganga.",
      descriptionHi: "गंगा के पश्चिमी तट पर स्थित द्वादश ज्योतिर्लिंगों में से एक।",
      historyEn: "Rebuilt by Maharani Ahilyabai Holkar in 1780, the shrine has been a centre of devotion for centuries.",
      historyHi: "1780 में महारानी अहिल्याबाई होलकर द्वारा पुनर्निर्मित यह मंदिर सदियों से श्रद्धा का केंद्र रहा है।",
      timings: "03:00-11:00, 12:00-23:00",
      latitude: 25.3109,
      longitude: 83.0107,
      liveDarshanUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      featured: true,
    },
    {
      slug: "mahakaleshwar",
      nameEn: "Mahakaleshwar Temple",
      nameHi: "महाकालेश्वर मंदिर",
      deityEn: "Lord Mahakal",
      deityHi: "भगवान महाकाल",
      city: "Ujjain",
      state: "Madhya Pradesh",
      descriptionEn: "Famous for the Bhasma Aarti performed at dawn.",
      descriptionHi: "प्रातःकाल की भस्म आरती के लिए प्रसिद्ध।",
      timings: "04:00-23:00",
      latitude: 23.1828,
      longitude: 75.7683,
      featured: true,
    },
    {
      slug: "vaishno-devi",
      nameEn: "Vaishno Devi",
      nameHi: "वैष्णो देवी",
      deityEn: "Mata Vaishno Devi",
      deityHi: "माता वैष्णो देवी",
      city: "Katra",
      state: "Jammu & Kashmir",
      descriptionEn: "The holy cave shrine of Mata Rani in the Trikuta hills.",
      descriptionHi: "त्रिकूट पर्वत में माता रानी की पवित्र गुफा।",
      timings: "05:00-22:00",
      latitude: 33.0304,
      longitude: 74.9496,
      featured: true,
    },
    {
      slug: "salasar-balaji",
      nameEn: "Salasar Balaji",
      nameHi: "सालासर बालाजी",
      deityEn: "Hanuman ji",
      deityHi: "हनुमान जी",
      city: "Salasar",
      state: "Rajasthan",
      timings: "04:00-22:00",
      latitude: 27.7211,
      longitude: 74.7333,
    },
  ];
  for (const t of temples) await db.temple.upsert({ where: { slug: t.slug }, create: t, update: t });

  const festivals = [
    {
      slug: "maha-shivratri",
      nameEn: "Maha Shivratri",
      nameHi: "महाशिवरात्रि",
      type: "FESTIVAL" as const,
      date: plus(12),
      deityEn: "Lord Shiva",
      deityHi: "भगवान शिव",
      descriptionEn: "The great night of Shiva, observed with fasting and night-long worship.",
      descriptionHi: "शिव की महान रात्रि, उपवास एवं रात्रि जागरण के साथ मनाई जाती है।",
      significanceEn: "It marks the union of Shiva and Shakti and the removal of ignorance.",
      significanceHi: "यह शिव एवं शक्ति के मिलन तथा अज्ञान के नाश का प्रतीक है।",
      ritualsEn: J(["Fast through the day", "Offer bel patra and milk on the Shivling", "Chant Om Namah Shivaya", "Stay awake for the four prahars"]),
      ritualsHi: J(["दिनभर उपवास रखें", "शिवलिंग पर बेलपत्र एवं दूध अर्पित करें", "ॐ नमः शिवाय का जाप करें", "चारों प्रहर जागरण करें"]),
      major: true,
    },
    { slug: "ekadashi-vrat", nameEn: "Nirjala Ekadashi", nameHi: "निर्जला एकादशी", type: "EKADASHI" as const, date: plus(4), major: false },
    {
      slug: "navratri",
      nameEn: "Sharad Navratri",
      nameHi: "शारदीय नवरात्रि",
      type: "FESTIVAL" as const,
      date: plus(30),
      endDate: plus(38),
      deityEn: "Maa Durga",
      deityHi: "माँ दुर्गा",
      descriptionEn: "Nine nights of devotion to the nine forms of Maa Durga.",
      descriptionHi: "माँ दुर्गा के नौ स्वरूपों की आराधना की नौ रातें।",
      major: true,
    },
    { slug: "diwali", nameEn: "Diwali", nameHi: "दीपावली", type: "FESTIVAL" as const, date: plus(60), deityEn: "Maa Lakshmi", deityHi: "माँ लक्ष्मी", major: true },
    { slug: "purnima", nameEn: "Guru Purnima", nameHi: "गुरु पूर्णिमा", type: "PURNIMA" as const, date: plus(2), major: false },
  ];
  for (const f of festivals) await db.festival.upsert({ where: { slug: f.slug }, create: f, update: f });

  const kashi = await db.temple.findUniqueOrThrow({ where: { slug: "kashi-vishwanath" } });
  const mahakal = await db.temple.findUniqueOrThrow({ where: { slug: "mahakaleshwar" } });
  const vaishno = await db.temple.findUniqueOrThrow({ where: { slug: "vaishno-devi" } });
  const salasar = await db.temple.findUniqueOrThrow({ where: { slug: "salasar-balaji" } });
  const shivCat = await db.category.findUniqueOrThrow({ where: { slug: "shiv" } });
  const grihaCat = await db.category.findUniqueOrThrow({ where: { slug: "griha" } });
  const shivratri = await db.festival.findUniqueOrThrow({ where: { slug: "maha-shivratri" } });

  const services = [
    {
      slug: "rudrabhishek-kashi",
      type: "ONLINE_POOJA" as const,
      nameEn: "Maha Rudrabhishek at Kashi Vishwanath",
      nameHi: "काशी विश्वनाथ में महा रुद्राभिषेक",
      taglineEn: "For health, protection and removal of obstacles",
      taglineHi: "आरोग्य, रक्षा एवं बाधा निवारण हेतु",
      descriptionEn:
        "Vedic pandits of Kashi perform the Maha Rudrabhishek in your name with milk, honey, curd, ghee and Ganga jal, chanting the Rudri path eleven times.",
      descriptionHi:
        "काशी के वैदिक पंडित आपके नाम से दूध, मधु, दही, घी एवं गंगाजल से महा रुद्राभिषेक करते हैं तथा रुद्री पाठ का ग्यारह बार पाठ करते हैं।",
      benefitsEn: J(["Relief from health troubles", "Protection from unseen fears", "Peace at home", "Progress in stuck work"]),
      benefitsHi: J(["स्वास्थ्य कष्टों से राहत", "अदृश्य भय से रक्षा", "गृह शांति", "रुके कार्यों में प्रगति"]),
      processEn: J([
        { title: "Book the pooja", desc: "Add the names and gotra of every devotee." },
        { title: "Sankalp", desc: "Pandit ji takes your sankalp at the temple." },
        { title: "Rudrabhishek", desc: "Abhishek with panchamrit and Rudri path." },
        { title: "Video & prasad", desc: "You receive the video and the temple prasad." },
      ]),
      processHi: J([
        { title: "पूजा बुक करें", desc: "सभी भक्तों के नाम एवं गोत्र जोड़ें।" },
        { title: "संकल्प", desc: "पंडित जी मंदिर में आपका संकल्प कराते हैं।" },
        { title: "रुद्राभिषेक", desc: "पंचामृत से अभिषेक एवं रुद्री पाठ।" },
        { title: "वीडियो एवं प्रसाद", desc: "आपको वीडियो एवं मंदिर का प्रसाद प्राप्त होता है।" },
      ]),
      faqEn: J([
        { q: "Do I need to be present?", a: "No. The pooja is performed on your behalf and the video is shared with you." },
        { q: "What if I don't know my gotra?", a: "Kashyap gotra is used, as prescribed for those who do not know theirs." },
        { q: "When will I get the prasad?", a: "Prasad is couriered within 7-10 days of the pooja." },
      ]),
      faqHi: J([
        { q: "क्या मेरा उपस्थित होना आवश्यक है?", a: "नहीं। पूजा आपकी ओर से सम्पन्न होती है और वीडियो आपको भेजा जाता है।" },
        { q: "यदि गोत्र ज्ञात न हो तो?", a: "शास्त्रानुसार कश्यप गोत्र का उपयोग किया जाता है।" },
        { q: "प्रसाद कब मिलेगा?", a: "पूजा के 7-10 दिनों के भीतर प्रसाद कूरियर किया जाता है।" },
      ]),
      deityEn: "Lord Shiva",
      deityHi: "भगवान शिव",
      basePrice: 1100,
      compareAtPrice: 1800,
      durationMin: 90,
      categoryId: shivCat.id,
      templeId: kashi.id,
      festivalId: shivratri.id,
      nextDate: plus(3),
      slots: J(["06:00", "08:30", "11:00", "17:30"]),
      tags: J(["rudrabhishek", "shiv", "kashi"]),
      featured: true,
      trending: true,
      ratingAvg: 4.9,
      ratingCount: 214,
      bookingCount: 1832,
      sortOrder: 1,
    },
    {
      slug: "bhasma-aarti-mahakal",
      type: "ONLINE_POOJA" as const,
      nameEn: "Bhasma Aarti Sankalp at Mahakaleshwar",
      nameHi: "महाकालेश्वर में भस्म आरती संकल्प",
      taglineEn: "Your name in the dawn aarti of Mahakal",
      taglineHi: "महाकाल की प्रातःकालीन आरती में आपका नाम",
      descriptionEn: "A sankalp is taken in your name during the Bhasma Aarti, the first aarti of the day at Mahakaleshwar.",
      descriptionHi: "महाकालेश्वर की दिन की प्रथम आरती, भस्म आरती के समय आपके नाम से संकल्प लिया जाता है।",
      benefitsEn: J(["Freedom from fear of untimely death", "Courage and clarity", "Blessings of Mahakal"]),
      benefitsHi: J(["अकाल मृत्यु के भय से मुक्ति", "साहस एवं स्पष्टता", "महाकाल का आशीर्वाद"]),
      deityEn: "Lord Shiva",
      deityHi: "भगवान शिव",
      basePrice: 851,
      durationMin: 60,
      categoryId: shivCat.id,
      templeId: mahakal.id,
      nextDate: plus(1),
      slots: J(["04:00"]),
      featured: true,
      ratingAvg: 4.8,
      ratingCount: 96,
      bookingCount: 640,
      sortOrder: 2,
    },
    {
      slug: "chunri-chadhava-vaishno-devi",
      type: "CHADHAVA" as const,
      nameEn: "Chunri & Shringar Chadhava at Vaishno Devi",
      nameHi: "वैष्णो देवी में चुनरी एवं श्रृंगार चढ़ावा",
      taglineEn: "Offer a chunri to Mata Rani in your name",
      taglineHi: "माता रानी को आपके नाम से चुनरी अर्पित करें",
      descriptionEn: "A red chunri, bangles, sindoor and shringar samagri are offered at the holy cave on your behalf.",
      descriptionHi: "पवित्र गुफा में आपकी ओर से लाल चुनरी, चूड़ियाँ, सिंदूर एवं श्रृंगार सामग्री अर्पित की जाती है।",
      benefitsEn: J(["Mata's blessings for the family", "Fulfilment of a manokamna", "Peace and prosperity"]),
      benefitsHi: J(["परिवार पर माता की कृपा", "मनोकामना पूर्ति", "शांति एवं समृद्धि"]),
      deityEn: "Maa Durga",
      deityHi: "माँ दुर्गा",
      basePrice: 551,
      compareAtPrice: 751,
      templeId: vaishno.id,
      nextDate: plus(2),
      slots: J([]),
      trending: true,
      ratingAvg: 4.7,
      ratingCount: 58,
      bookingCount: 412,
      sortOrder: 3,
    },
    {
      slug: "griha-pravesh-pooja",
      type: "PANDIT_AT_HOME" as const,
      nameEn: "Griha Pravesh Pooja at home",
      nameHi: "घर पर गृह प्रवेश पूजा",
      taglineEn: "A verified pandit ji with full samagri",
      taglineHi: "पूरी सामग्री के साथ सत्यापित पंडित जी",
      descriptionEn: "Vastu shanti, Ganesh pooja, navgrah shanti and havan performed at your new home by a verified purohit.",
      descriptionHi: "सत्यापित पुरोहित द्वारा आपके नए घर में वास्तु शांति, गणेश पूजा, नवग्रह शांति एवं हवन।",
      benefitsEn: J(["Vastu dosh shanti", "Auspicious start in the new home", "Samagri included"]),
      benefitsHi: J(["वास्तु दोष शांति", "नए घर में शुभ आरंभ", "सामग्री सम्मिलित"]),
      deityEn: "Lord Ganesha",
      deityHi: "भगवान गणेश",
      basePrice: 4100,
      durationMin: 180,
      categoryId: grihaCat.id,
      slots: J([]),
      featured: true,
      ratingAvg: 4.8,
      ratingCount: 41,
      bookingCount: 128,
      sortOrder: 4,
    },
    {
      slug: "salasar-prasad",
      type: "PRASAD" as const,
      nameEn: "Salasar Balaji Prasad box",
      nameHi: "सालासर बालाजी प्रसाद",
      taglineEn: "Churma prasad delivered to your home",
      taglineHi: "चूरमा प्रसाद आपके घर तक",
      descriptionEn: "Traditional churma prasad from Salasar Balaji, packed and couriered to your address.",
      descriptionHi: "सालासर बालाजी का पारंपरिक चूरमा प्रसाद, पैक करके आपके पते पर भेजा जाता है।",
      deityEn: "Hanuman ji",
      deityHi: "हनुमान जी",
      basePrice: 399,
      templeId: salasar.id,
      nextDate: plus(1),
      slots: J([]),
      ratingAvg: 4.6,
      ratingCount: 22,
      bookingCount: 96,
      sortOrder: 5,
    },
    {
      slug: "kundli-analysis",
      type: "ASTROLOGY" as const,
      nameEn: "Detailed Kundli analysis",
      nameHi: "विस्तृत कुंडली विश्लेषण",
      taglineEn: "45 minutes with a learned jyotishi",
      taglineHi: "विद्वान ज्योतिषी के साथ 45 मिनट",
      descriptionEn: "A complete reading of your birth chart with dasha analysis and practical remedies.",
      descriptionHi: "दशा विश्लेषण एवं व्यावहारिक उपायों सहित आपकी जन्मकुंडली का सम्पूर्ण अध्ययन।",
      basePrice: 999,
      durationMin: 45,
      slots: J(["10:00", "16:00", "19:00"]),
      nextDate: plus(1),
      ratingAvg: 4.7,
      ratingCount: 33,
      bookingCount: 210,
      sortOrder: 6,
    },
    {
      slug: "sunderkand-path",
      type: "KATHA" as const,
      nameEn: "Sunderkand Path at home",
      nameHi: "घर पर सुंदरकांड पाठ",
      taglineEn: "With bhajan mandali and prasad",
      taglineHi: "भजन मंडली एवं प्रसाद सहित",
      descriptionEn: "A three-hour Sunderkand path with a bhajan mandali at your home.",
      descriptionHi: "आपके घर पर भजन मंडली के साथ तीन घंटे का सुंदरकांड पाठ।",
      deityEn: "Hanuman ji",
      deityHi: "हनुमान जी",
      basePrice: 5100,
      durationMin: 180,
      slots: J([]),
      ratingAvg: 4.9,
      ratingCount: 18,
      bookingCount: 64,
      sortOrder: 7,
    },
  ];

  for (const s of services) {
    await db.service.upsert({ where: { slug: s.slug }, create: s, update: s });
  }

  // packages + addons for the two hero services
  const rudra = await db.service.findUniqueOrThrow({ where: { slug: "rudrabhishek-kashi" } });
  await db.servicePackage.deleteMany({ where: { serviceId: rudra.id } });
  await db.servicePackage.createMany({
    data: [
      {
        serviceId: rudra.id,
        slug: "single",
        nameEn: "Single devotee",
        nameHi: "एक भक्त",
        descriptionEn: "Sankalp with one name and gotra",
        descriptionHi: "एक नाम एवं गोत्र से संकल्प",
        price: 1100,
        compareAtPrice: 1800,
        maxDevotees: 1,
        featuresEn: J(["Sankalp with your name", "Pooja video", "Temple prasad"]),
        featuresHi: J(["आपके नाम से संकल्प", "पूजा वीडियो", "मंदिर का प्रसाद"]),
        sortOrder: 1,
      },
      {
        serviceId: rudra.id,
        slug: "family",
        nameEn: "Family (up to 4)",
        nameHi: "परिवार (4 तक)",
        descriptionEn: "Sankalp for the whole family",
        descriptionHi: "सम्पूर्ण परिवार के लिए संकल्प",
        price: 2100,
        compareAtPrice: 3100,
        maxDevotees: 4,
        featuresEn: J(["Sankalp with 4 names", "HD pooja video", "Temple prasad", "Priority slot"]),
        featuresHi: J(["4 नामों से संकल्प", "एचडी पूजा वीडियो", "मंदिर का प्रसाद", "प्राथमिकता समय"]),
        popular: true,
        sortOrder: 2,
      },
      {
        serviceId: rudra.id,
        slug: "joint",
        nameEn: "Joint family (up to 8)",
        nameHi: "संयुक्त परिवार (8 तक)",
        price: 3100,
        maxDevotees: 8,
        featuresEn: J(["Sankalp with 8 names", "HD pooja video", "Large prasad box"]),
        featuresHi: J(["8 नामों से संकल्प", "एचडी पूजा वीडियो", "बड़ा प्रसाद पैक"]),
        sortOrder: 3,
      },
    ],
  });
  await db.serviceAddon.deleteMany({ where: { serviceId: rudra.id } });
  await db.serviceAddon.createMany({
    data: [
      { serviceId: rudra.id, slug: "rudraksha", nameEn: "Energised Rudraksha", nameHi: "अभिमंत्रित रुद्राक्ष", price: 351 },
      { serviceId: rudra.id, slug: "ganga-jal", nameEn: "Ganga jal bottle", nameHi: "गंगाजल", price: 151 },
      { serviceId: rudra.id, slug: "deepdaan", nameEn: "Deep daan at the ghat", nameHi: "घाट पर दीपदान", price: 251 },
    ],
  });

  const chunri = await db.service.findUniqueOrThrow({ where: { slug: "chunri-chadhava-vaishno-devi" } });
  await db.servicePackage.deleteMany({ where: { serviceId: chunri.id } });
  await db.servicePackage.createMany({
    data: [
      { serviceId: chunri.id, slug: "basic", nameEn: "Chunri", nameHi: "चुनरी", price: 551, maxDevotees: 2, featuresEn: J(["Red chunri", "Photo of the offering"]), featuresHi: J(["लाल चुनरी", "अर्पण का छायाचित्र"]), sortOrder: 1 },
      { serviceId: chunri.id, slug: "shringar", nameEn: "Full shringar", nameHi: "पूर्ण श्रृंगार", price: 1101, maxDevotees: 4, popular: true, featuresEn: J(["Chunri, bangles, sindoor", "Photos & video", "Prasad"]), featuresHi: J(["चुनरी, चूड़ियाँ, सिंदूर", "छायाचित्र एवं वीडियो", "प्रसाद"]), sortOrder: 2 },
    ],
  });

  const griha = await db.service.findUniqueOrThrow({ where: { slug: "griha-pravesh-pooja" } });
  await db.servicePackage.deleteMany({ where: { serviceId: griha.id } });
  await db.servicePackage.createMany({
    data: [
      { serviceId: griha.id, slug: "standard", nameEn: "Standard", nameHi: "सामान्य", price: 4100, maxDevotees: 6, popular: true, featuresEn: J(["Pandit ji + samagri", "Vastu shanti", "Havan"]), featuresHi: J(["पंडित जी + सामग्री", "वास्तु शांति", "हवन"]), sortOrder: 1 },
      { serviceId: griha.id, slug: "premium", nameEn: "With Satyanarayan katha", nameHi: "सत्यनारायण कथा सहित", price: 6100, maxDevotees: 10, featuresEn: J(["Everything in Standard", "Satyanarayan katha", "Two pandits"]), featuresHi: J(["सामान्य का सब कुछ", "सत्यनारायण कथा", "दो पंडित"]), sortOrder: 2 },
    ],
  });

  const content = [
    {
      slug: "shiv-aarti",
      type: "AARTI" as const,
      titleEn: "Om Jai Shiv Omkara",
      titleHi: "ॐ जय शिव ओंकारा",
      deityEn: "Lord Shiva",
      deityHi: "भगवान शिव",
      bodyHi:
        "ॐ जय शिव ओंकारा, स्वामी जय शिव ओंकारा।\nब्रह्मा विष्णु सदाशिव, अर्द्धांगी धारा॥\nॐ जय शिव ओंकारा॥\n\nएकानन चतुरानन पंचानन राजे।\nहंसासन गरुड़ासन वृषवाहन साजे॥\nॐ जय शिव ओंकारा॥",
      bodyEn:
        "Om Jai Shiv Omkara, Swami Jai Shiv Omkara.\nBrahma Vishnu Sadashiv, ardhangi dhara.\n\nMeaning: Victory to Shiva, the primordial Om; Brahma, Vishnu and Shiva are one, with Shakti as the other half.",
      featured: true,
      views: 1240,
    },
    {
      slug: "hanuman-chalisa",
      type: "CHALISA" as const,
      titleEn: "Hanuman Chalisa",
      titleHi: "हनुमान चालीसा",
      deityEn: "Hanuman ji",
      deityHi: "हनुमान जी",
      bodyHi:
        "श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि।\nबरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥\n\nजय हनुमान ज्ञान गुन सागर।\nजय कपीस तिहुँ लोक उजागर॥\nराम दूत अतुलित बल धामा।\nअंजनि पुत्र पवनसुत नामा॥",
      bodyEn: "Shri Guru charan saroj raj, nij manu mukuru sudhari…\n\nMeaning: Cleansing the mirror of my mind with the dust of my Guru's lotus feet, I sing the pure glory of Raghubar.",
      featured: true,
      views: 8210,
    },
    {
      slug: "gayatri-mantra",
      type: "MANTRA" as const,
      titleEn: "Gayatri Mantra",
      titleHi: "गायत्री मंत्र",
      deityEn: "Savitr",
      deityHi: "सवितृ",
      bodyHi: "ॐ भूर्भुवः स्वः।\nतत्सवितुर्वरेण्यं।\nभर्गो देवस्य धीमहि।\nधियो यो नः प्रचोदयात्॥",
      bodyEn: "Om bhur bhuvah svah, tat savitur varenyam, bhargo devasya dhimahi, dhiyo yo nah prachodayat.",
      views: 3400,
    },
  ];
  for (const c of content) await db.contentItem.upsert({ where: { slug: c.slug }, create: c, update: c });

  const banners = [
    { titleEn: "Maha Shivratri special poojas", titleHi: "महाशिवरात्रि विशेष पूजा", subtitleEn: "Book your sankalp at Kashi & Ujjain", subtitleHi: "काशी एवं उज्जैन में संकल्प बुक करें", href: "/festivals/maha-shivratri", placement: "home", sortOrder: 1 },
    { titleEn: "Chadhava at Vaishno Devi", titleHi: "वैष्णो देवी में चढ़ावा", subtitleEn: "Offer a chunri in your name", subtitleHi: "अपने नाम से चुनरी अर्पित करें", href: "/chadhava", placement: "home", sortOrder: 2 },
  ];
  const existingBanners = await db.banner.count();
  if (existingBanners === 0) await db.banner.createMany({ data: banners });

  await db.coupon.upsert({
    where: { code: "DIVYA10" },
    create: { code: "DIVYA10", descriptionEn: "10% off your first pooja", descriptionHi: "पहली पूजा पर 10% छूट", discountPct: 10, minAmount: 500, maxUses: 1000 },
    update: { active: true },
  });

  // a pandit so /pandits and temple pages are not empty
  const pUser = await db.user.upsert({
    where: { phone: "+919000000001" },
    create: { phone: "+919000000001", name: "Pt. Ramesh Shastri", role: "PANDIT", locale: "hi", onboarded: true, city: "Varanasi" },
    update: {},
  });
  const pandit = await db.panditProfile.upsert({
    where: { userId: pUser.id },
    create: {
      userId: pUser.id,
      displayName: "Pt. Ramesh Shastri",
      displayNameHi: "पं. रमेश शास्त्री",
      bio: "Third-generation Kashi purohit, performing Rudrabhishek and Navgrah shanti for over 18 years.",
      bioHi: "काशी के तृतीय पीढ़ी के पुरोहित, 18 वर्षों से रुद्राभिषेक एवं नवग्रह शांति सम्पन्न कराते हुए।",
      classification: "VEDIC",
      specialities: J(["rudrabhishek", "navgrah-shanti", "griha-pravesh"]),
      languages: J(["hi", "sa", "en"]),
      experienceYears: 18,
      city: "Varanasi",
      state: "Uttar Pradesh",
      templeId: kashi.id,
      kycStatus: "APPROVED",
      verified: true,
      featured: true,
      ratingAvg: 4.9,
      ratingCount: 87,
      completedCount: 412,
    },
    update: { kycStatus: "APPROVED", verified: true },
  });
  for (const slug of ["rudrabhishek-kashi", "griha-pravesh-pooja", "sunderkand-path"]) {
    const svc = await db.service.findUniqueOrThrow({ where: { slug } });
    await db.panditService.upsert({
      where: { panditId_serviceId: { panditId: pandit.id, serviceId: svc.id } },
      create: { panditId: pandit.id, serviceId: svc.id },
      update: {},
    });
  }

  const jUser = await db.user.upsert({
    where: { phone: "+919000000002" },
    create: { phone: "+919000000002", name: "Acharya Vinod Joshi", role: "PANDIT", locale: "hi", onboarded: true, city: "Ujjain" },
    update: {},
  });
  await db.panditProfile.upsert({
    where: { userId: jUser.id },
    create: {
      userId: jUser.id,
      displayName: "Acharya Vinod Joshi",
      displayNameHi: "आचार्य विनोद जोशी",
      bioHi: "कुंडली विश्लेषण एवं मुहूर्त निर्धारण में 12 वर्षों का अनुभव।",
      bio: "Twelve years of experience in kundli analysis and muhurat.",
      classification: "JYOTISHI",
      specialities: J(["kundli", "muhurat", "mangal-dosh"]),
      languages: J(["hi", "en"]),
      experienceYears: 12,
      city: "Ujjain",
      state: "Madhya Pradesh",
      kycStatus: "APPROVED",
      verified: true,
      ratingAvg: 4.7,
      ratingCount: 31,
      completedCount: 154,
    },
    update: { kycStatus: "APPROVED", verified: true },
  });

  console.log("dev fixture ready");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
