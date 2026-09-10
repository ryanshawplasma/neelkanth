/**
 * Festival & observance calendar.
 *
 * Two sources feed the `Festival` table:
 *
 * 1. `MAJOR_FESTIVALS` — hand-curated major festivals for 2026-09-01 … 2027-12-31.
 *    Every date was cross-checked against drikpanchang.com's Hindu calendar for
 *    New Delhi (see docs in the seed report). Content is authored once per
 *    "family" (`FESTIVAL_TEMPLATES`) and instantiated per occurrence, so the 2026
 *    and 2027 Diwali rows share the same copy and artwork but differ in date/slug.
 *
 * 2. `generateRecurringObservances(from, to)` — computed from `src/lib/panchang.ts`
 *    using the tithi prevailing at sunrise: Ekadashi (with its traditional name),
 *    Purnima, Amavasya, Pradosh Vrat, Sankashti / Vinayaka Chaturthi and Masik
 *    Shivratri. Consecutive days carrying the same tithi are de-duplicated (the
 *    first day wins), which mirrors how vrats are observed.
 *
 * Ekadashi / Purnima / Amavasya names are keyed by the **purnimanta** month, which
 * is the convention used by North-Indian panchangs (e.g. Rama Ekadashi is
 * "Kartik Krishna Ekadashi" even though the amanta month is still Ashwin).
 */
import { getPanchang } from "@/lib/panchang";
import type { FestivalTypeName } from "./types";

export type FestivalSeed = {
  slug: string;
  nameEn: string;
  nameHi: string;
  type: FestivalTypeName;
  date: string; // YYYY-MM-DD
  endDate: string | null;
  deityEn: string;
  deityHi: string;
  descriptionEn: string;
  descriptionHi: string;
  significanceEn: string;
  significanceHi: string;
  ritualsEn: string[];
  ritualsHi: string[];
  imageUrl: string;
  major: boolean;
  remindDaysBefore: number[];
};

type Template = Omit<FestivalSeed, "slug" | "date" | "endDate">;

const fimg = (key: string) => `/images/festivals/${key}.svg`;

/** One authored entry per festival family; occurrences below reuse it. */
export const FESTIVAL_TEMPLATES: Record<string, Template> = {
  "krishna-janmashtami": {
    nameEn: "Krishna Janmashtami",
    nameHi: "कृष्ण जन्माष्टमी",
    type: "JAYANTI",
    deityEn: "Lord Krishna",
    deityHi: "भगवान श्रीकृष्ण",
    descriptionEn:
      "Janmashtami marks the midnight descent of Lord Krishna in the prison of Mathura, when the eighth child of Devaki broke every chain that held the world. Devotees keep a night-long fast, rock the little cradle at the stroke of twelve and break the vrat with panjiri and charnamrit. Mathura, Vrindavan and Dwarka stay awake until dawn.",
    descriptionHi:
      "जन्माष्टमी मथुरा के कारागार में अर्धरात्रि को हुए भगवान श्रीकृष्ण के अवतरण का पर्व है, जब देवकी के आठवें पुत्र ने संसार की हर बेड़ी तोड़ दी। भक्त रातभर व्रत रखते हैं, ठीक बारह बजे नन्हे लाला का पालना झुलाते हैं और पंजीरी तथा चरणामृत से व्रत खोलते हैं। मथुरा, वृंदावन और द्वारका भोर तक जागते रहते हैं।",
    significanceEn:
      "Krishna's birth is the promise of the Gita made flesh — that whenever dharma weakens, the Lord returns. Worship on this night is held to remove obstacles to progeny, to sweeten family life and to grant the courage Arjuna received on the battlefield.",
    significanceHi:
      "श्रीकृष्ण का जन्म गीता के उस वचन का साकार रूप है कि जब-जब धर्म की हानि होती है, प्रभु पुनः अवतरित होते हैं। इस रात्रि की उपासना संतान बाधा दूर करने, गृहस्थ जीवन में मधुरता लाने और अर्जुन जैसा साहस देने वाली मानी गई है।",
    ritualsEn: [
      "Fast from sunrise and break it only after midnight abhishek",
      "Bathe the Laddu Gopal in panchamrit, dress him in new pitambar",
      "Rock the cradle at midnight and sing Nand Ghar Anand Bhayo",
      "Offer makhan-mishri, panjiri, dhaniya prasad and tulsi dal",
      "Read the tenth canto of the Shrimad Bhagwat or Gita chapter 11",
    ],
    ritualsHi: [
      "सूर्योदय से व्रत और मध्यरात्रि अभिषेक के बाद ही पारण",
      "लड्डू गोपाल का पंचामृत स्नान, नवीन पीतांबर धारण",
      "अर्धरात्रि में पालना झुलाकर 'नंद घर आनंद भयो' का गान",
      "माखन-मिश्री, पंजीरी, धनिया प्रसाद एवं तुलसी दल अर्पण",
      "श्रीमद्भागवत का दशम स्कंध अथवा गीता का ग्यारहवाँ अध्याय पाठ",
    ],
    imageUrl: fimg("krishna-janmashtami"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "hartalika-teej": {
    nameEn: "Hartalika Teej",
    nameHi: "हरतालिका तीज",
    type: "VRAT",
    deityEn: "Goddess Parvati & Lord Shiva",
    deityHi: "माता पार्वती एवं भगवान शिव",
    descriptionEn:
      "On Hartalika Teej married women and maidens keep a nirjala fast — without food or even water — in memory of Parvati's austerity to win Shiva as her husband. Sand lingams are shaped at dusk, decorated with bel leaves and worshipped through the night. The name recalls how Parvati's friends carried her away (harat) to the forest so she could complete her tapas.",
    descriptionHi:
      "हरतालिका तीज पर सुहागिनें और कन्याएँ निर्जला व्रत रखती हैं — अन्न तो दूर, जल भी नहीं — यह स्मरण करते हुए कि पार्वती ने शिव को पति रूप में पाने हेतु कठोर तप किया था। संध्या में बालू का शिवलिंग बनाकर बेलपत्र से सजाया जाता है और रातभर पूजा होती है। नाम इस कथा से है कि सखियाँ पार्वती को हरण कर वन ले गईं जिससे वे तप पूर्ण कर सकें।",
    significanceEn:
      "The vrat is kept for an unbroken saubhagya — long life of the husband for married women, and a worthy match for unmarried girls. It is counted among the most demanding vrats of the year and is never broken before sunrise.",
    significanceHi:
      "यह व्रत अखंड सौभाग्य के लिए रखा जाता है — सुहागिनों हेतु पति की दीर्घायु और कुँवारी कन्याओं हेतु मनोवांछित वर। यह वर्ष के सर्वाधिक कठिन व्रतों में गिना जाता है और सूर्योदय से पूर्व कभी नहीं तोड़ा जाता।",
    ritualsEn: [
      "Nirjala vrat from sunrise to the next morning",
      "Shape Shiva, Parvati and Ganesh from river sand and clay",
      "Sixteen shringar offered to Parvati; bel patra to Shiva",
      "Night-long jagran with the Hartalika Teej katha",
      "Break the fast at sunrise after aarti and daan to a Brahmin",
    ],
    ritualsHi: [
      "सूर्योदय से अगले प्रातः तक निर्जला व्रत",
      "नदी की बालू एवं मिट्टी से शिव, पार्वती और गणेश की प्रतिमा",
      "पार्वती को सोलह शृंगार, शिव को बेलपत्र अर्पण",
      "हरतालिका तीज कथा के साथ रातभर जागरण",
      "प्रातः आरती एवं ब्राह्मण दान के पश्चात पारण",
    ],
    imageUrl: fimg("hartalika-teej"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "ganesh-chaturthi": {
    nameEn: "Ganesh Chaturthi",
    nameHi: "गणेश चतुर्थी",
    type: "FESTIVAL",
    deityEn: "Lord Ganesha",
    deityHi: "भगवान श्रीगणेश",
    descriptionEn:
      "Ganesh Chaturthi welcomes Gauri's son into every home and pandal for ten days of song, modak and aarti. Clay murtis are installed on the madhyahna muhurat of Bhadrapada Shukla Chaturthi, honoured with durva grass and red hibiscus, and carried to water on Anant Chaturdashi with the cry of Ganpati Bappa Morya. No auspicious work in the Hindu year begins without first invoking him.",
    descriptionHi:
      "गणेश चतुर्थी पर गौरीपुत्र दस दिनों के लिए हर घर और पंडाल में विराजते हैं — भजन, मोदक और आरती के साथ। भाद्रपद शुक्ल चतुर्थी के मध्याह्न मुहूर्त में मिट्टी की प्रतिमा स्थापित होती है, दूर्वा और लाल गुड़हल से पूजी जाती है, और अनंत चतुर्दशी को 'गणपति बप्पा मोरया' के जयघोष के साथ विसर्जित होती है। हिंदू वर्ष का कोई शुभ कार्य उनके आवाहन बिना आरंभ नहीं होता।",
    significanceEn:
      "Ganesha is Vighnaharta, the remover of obstacles, and Buddhi-Vinayaka, the lord of intellect. Worship in these ten days is believed to clear stalled work, court cases, delayed marriages and blocked finances, and to bless new ventures with a clean beginning.",
    significanceHi:
      "गणेश विघ्नहर्ता हैं और बुद्धि-विनायक भी। इन दस दिनों की उपासना से रुके कार्य, न्यायालयीन प्रकरण, विलंबित विवाह तथा अवरुद्ध धन-प्रवाह खुलते माने जाते हैं, और नए उपक्रमों को शुभ आरंभ मिलता है।",
    ritualsEn: [
      "Pran-pratishtha of the clay murti in the madhyahna muhurat",
      "Shodashopachar pooja with durva, modak and red hibiscus",
      "Ganesh Atharvashirsha and Sankatnashan Ganesh Stotra daily",
      "Morning and evening aarti — Sukhkarta Dukhharta",
      "Visarjan in water on Anant Chaturdashi with uttarpuja",
    ],
    ritualsHi: [
      "मध्याह्न मुहूर्त में मिट्टी की प्रतिमा की प्राण-प्रतिष्ठा",
      "दूर्वा, मोदक एवं लाल गुड़हल से षोडशोपचार पूजन",
      "प्रतिदिन गणेश अथर्वशीर्ष तथा संकटनाशन गणेश स्तोत्र",
      "प्रातः-सायं आरती — सुखकर्ता दुखहर्ता",
      "अनंत चतुर्दशी को उत्तरपूजा सहित जल में विसर्जन",
    ],
    imageUrl: fimg("ganesh-chaturthi"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "radha-ashtami": {
    nameEn: "Radha Ashtami",
    nameHi: "राधा अष्टमी",
    type: "JAYANTI",
    deityEn: "Shri Radha Rani",
    deityHi: "श्री राधा रानी",
    descriptionEn:
      "Fifteen days after Janmashtami, Barsana celebrates the appearance of Shri Radha, the hladini shakti of Krishna himself. Her lotus feet are revealed to devotees only on this day at the Ladli Ji temple. Braj fills with samaj gayan, swings and rain-soaked marigold.",
    descriptionHi:
      "जन्माष्टमी के पंद्रह दिन बाद बरसाना श्री राधा के प्राकट्य का उत्सव मनाता है, जो स्वयं कृष्ण की ह्लादिनी शक्ति हैं। लाड़ली जी मंदिर में उनके चरण-दर्शन केवल इसी दिन होते हैं। सारा ब्रज समाज गायन, हिंडोले और गेंदे के फूलों से भर जाता है।",
    significanceEn:
      "Radha's grace is said to be the shortest path to Krishna — where he is stern, she intercedes. The vrat is kept for marital harmony, devotion and the softening of a hardened heart.",
    significanceHi:
      "राधा की कृपा श्रीकृष्ण तक पहुँचने का सबसे सरल मार्ग मानी गई है — जहाँ वे कठोर हैं, वहाँ राधा सिफारिश करती हैं। यह व्रत दांपत्य सामंजस्य, भक्ति और कठोर हृदय की कोमलता हेतु रखा जाता है।",
    ritualsEn: [
      "Fast until midday and worship Radha-Krishna together",
      "Abhishek of Radha Rani with panchamrit and rose water",
      "Offer kheer, malpua and lehnga-chunri shringar",
      "Chant the Radha Kripa Kataksha Stotra",
      "Feed unmarried girls and offer red bangles",
    ],
    ritualsHi: [
      "मध्याह्न तक व्रत, राधा-कृष्ण का युगल पूजन",
      "राधा रानी का पंचामृत एवं गुलाब जल से अभिषेक",
      "खीर, मालपुआ तथा लहँगा-चुनरी शृंगार अर्पण",
      "राधा कृपा कटाक्ष स्तोत्र का पाठ",
      "कन्या भोज एवं लाल चूड़ियों का दान",
    ],
    imageUrl: fimg("radha-ashtami"),
    major: false,
    remindDaysBefore: [3, 1, 0],
  },

  "anant-chaturdashi": {
    nameEn: "Anant Chaturdashi",
    nameHi: "अनंत चतुर्दशी",
    type: "FESTIVAL",
    deityEn: "Lord Vishnu (Anant)",
    deityHi: "भगवान विष्णु (अनंत)",
    descriptionEn:
      "Anant Chaturdashi closes the Ganesh festival with the great visarjan processions, and is itself the day of the Anant Vrat — worship of Vishnu in his endless form. A fourteen-knotted thread dyed in turmeric is tied on the arm after pooja and worn through the year.",
    descriptionHi:
      "अनंत चतुर्दशी गणेशोत्सव का समापन विशाल विसर्जन यात्राओं के साथ करती है, और स्वयं अनंत व्रत का दिन भी है — विष्णु के अनंत स्वरूप की उपासना। पूजा के बाद हल्दी में रँगा चौदह गाँठों वाला अनंत सूत्र भुजा पर बाँधा जाता है और वर्षभर धारण किया जाता है।",
    significanceEn:
      "The Mahabharata records that Krishna prescribed this vrat to Yudhishthira to regain the kingdom lost at dice. It is kept for the return of lost wealth, honour and stability over fourteen years or fourteen repetitions.",
    significanceHi:
      "महाभारत में वर्णन है कि श्रीकृष्ण ने युधिष्ठिर को द्यूत में खोया राज्य पुनः पाने हेतु यही व्रत बताया था। यह खोया धन, मान और स्थायित्व लौटाने के लिए चौदह वर्ष अथवा चौदह बार किया जाता है।",
    ritualsEn: [
      "Worship Vishnu on a kalash over seven-grain rangoli",
      "Tie the fourteen-knot anant sutra on the right arm",
      "Offer fourteen puris and fourteen sweet gharge",
      "Recite the Anant Vrat Katha of Sushila and Kaundinya",
      "Ganesh visarjan with uttarpuja and aarti at the ghat",
    ],
    ritualsHi: [
      "सप्तधान्य रंगोली पर कलश स्थापित कर विष्णु पूजन",
      "दाहिनी भुजा पर चौदह गाँठ का अनंत सूत्र बंधन",
      "चौदह पूरी एवं चौदह मीठे घारगे का भोग",
      "सुशीला-कौंडिन्य की अनंत व्रत कथा का श्रवण",
      "घाट पर उत्तरपूजा एवं आरती सहित गणेश विसर्जन",
    ],
    imageUrl: fimg("anant-chaturdashi"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "pitru-paksha": {
    nameEn: "Pitru Paksha",
    nameHi: "पितृ पक्ष",
    type: "SPECIAL",
    deityEn: "Pitru Devta (Ancestors)",
    deityHi: "पितृ देवता",
    descriptionEn:
      "For a fortnight the gates of Pitru Loka are said to stand open and the ancestors come to the doorstep of their descendants. Each day carries the shraddh of those who left on that tithi; tarpan of water, black sesame and darbha grass is offered facing south. Gaya, Kashi, Prayag, Haridwar and Trimbakeshwar fill with families performing pind daan.",
    descriptionHi:
      "पंद्रह दिनों तक पितृ लोक के द्वार खुले रहते हैं और पितर अपने वंशजों की देहरी तक आते हैं। प्रत्येक तिथि उन्हीं की श्राद्ध तिथि होती है जिनका देहावसान उस तिथि को हुआ; दक्षिण दिशा की ओर जल, काला तिल और कुश से तर्पण दिया जाता है। गया, काशी, प्रयाग, हरिद्वार और त्र्यंबकेश्वर परिवारों से भर जाते हैं जो पिंडदान करते हैं।",
    significanceEn:
      "Unsatisfied ancestors are held to cause pitru dosh — obstruction in progeny, repeated ill health and quarrels within the family. Shraddh performed in this fortnight, especially at Gaya, is said to grant them moksha and lift the dosh from the lineage.",
    significanceHi:
      "अतृप्त पितर पितृ दोष का कारण माने जाते हैं — संतान बाधा, बार-बार अस्वस्थता और गृह कलह। इस पक्ष में किया गया श्राद्ध, विशेषकर गया में, उन्हें मोक्ष देता है और वंश से दोष हटाता है।",
    ritualsEn: [
      "Daily tarpan with water, black sesame, barley and darbha",
      "Shraddh on the tithi of the ancestor's passing",
      "Brahmin bhojan and daan of cloth, grain and dakshina",
      "Panchbali — food set aside for cow, dog, crow, deva and ant",
      "Pind daan at Gaya, Kashi or Trimbakeshwar for tripindi",
    ],
    ritualsHi: [
      "प्रतिदिन जल, काले तिल, जौ एवं कुश से तर्पण",
      "पितर की देहावसान तिथि पर श्राद्ध कर्म",
      "ब्राह्मण भोजन तथा वस्त्र, अन्न एवं दक्षिणा दान",
      "पंचबलि — गौ, श्वान, काक, देव एवं पिपीलिका हेतु ग्रास",
      "गया, काशी अथवा त्र्यंबकेश्वर में पिंडदान / त्रिपिंडी",
    ],
    imageUrl: fimg("pitru-paksha"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "sarva-pitru-amavasya": {
    nameEn: "Sarva Pitru Amavasya",
    nameHi: "सर्व पितृ अमावस्या",
    type: "AMAVASYA",
    deityEn: "Pitru Devta (Ancestors)",
    deityHi: "पितृ देवता",
    descriptionEn:
      "The last day of Pitru Paksha, also called Mahalaya Amavasya, is reserved for every ancestor whose tithi of passing is unknown or was missed. One shraddh offered today reaches the entire lineage — paternal and maternal, known and forgotten. Lamps of mustard oil are floated on rivers at dusk to light their way back.",
    descriptionHi:
      "पितृ पक्ष का अंतिम दिन, जिसे महालया अमावस्या भी कहते हैं, उन सभी पितरों के लिए है जिनकी तिथि अज्ञात है या छूट गई। आज किया गया एक श्राद्ध समस्त वंश तक पहुँचता है — पितृकुल और मातृकुल, ज्ञात और विस्मृत। संध्या को नदियों में सरसों के तेल के दीप प्रवाहित किए जाते हैं जिससे उन्हें लौटने का मार्ग मिले।",
    significanceEn:
      "This is the single most powerful day of the year for pitru karma. Tripindi shraddh and Narayan bali performed today are the classical remedy for pitru dosh and kaal sarp dosh appearing together in a horoscope.",
    significanceHi:
      "पितृ कर्म हेतु वर्ष का यह सर्वाधिक प्रभावी दिन है। आज किया गया त्रिपिंडी श्राद्ध एवं नारायण बलि कुंडली में एक साथ आए पितृ दोष व काल सर्प दोष का शास्त्रोक्त उपाय है।",
    ritualsEn: [
      "Tarpan for all known and unknown ancestors at sunrise",
      "Tripindi shraddh with kheer, rice pind and til",
      "Feed a cow, a crow and a Brahmin before the family eats",
      "Deep daan of a mustard-oil lamp on flowing water at dusk",
      "Donate white cloth, sesame, iron and an umbrella",
    ],
    ritualsHi: [
      "सूर्योदय पर ज्ञात-अज्ञात समस्त पितरों हेतु तर्पण",
      "खीर, चावल के पिंड एवं तिल से त्रिपिंडी श्राद्ध",
      "परिवार के भोजन से पूर्व गौ, काक एवं ब्राह्मण को ग्रास",
      "संध्या को बहते जल में सरसों तेल का दीपदान",
      "श्वेत वस्त्र, तिल, लोहा एवं छत्र का दान",
    ],
    imageUrl: fimg("sarva-pitru-amavasya"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "sharad-navratri": {
    nameEn: "Sharad Navratri",
    nameHi: "शारदीय नवरात्रि",
    type: "FESTIVAL",
    deityEn: "Goddess Durga (Nav Durga)",
    deityHi: "माँ दुर्गा (नव दुर्गा)",
    descriptionEn:
      "Nine nights of the Mother, one form for each: Shailputri, Brahmacharini, Chandraghanta, Kushmanda, Skandamata, Katyayani, Kalratri, Mahagauri and Siddhidatri. Ghatasthapana on the first morning sows barley in a clay pot and lights an akhand jyoti that must not falter for nine days. Kanya poojan on Ashtami or Navami closes the vrat.",
    descriptionHi:
      "माँ की नौ रात्रियाँ, प्रत्येक का एक स्वरूप — शैलपुत्री, ब्रह्मचारिणी, चंद्रघंटा, कूष्मांडा, स्कंदमाता, कात्यायनी, कालरात्रि, महागौरी और सिद्धिदात्री। प्रथम प्रातः घटस्थापना में मिट्टी के पात्र में जौ बोए जाते हैं और अखंड ज्योति जलाई जाती है जो नौ दिन बुझनी नहीं चाहिए। अष्टमी या नवमी को कन्या पूजन से व्रत पूर्ण होता है।",
    significanceEn:
      "Sharad Navratri falls when the Mother slew Mahishasura and is the strongest window of the year for Shakti upasana. Durga Saptashati path, Chandi havan and Devi kavach recited now are held to destroy enemies, illness and fear, and to grant courage and abundance.",
    significanceHi:
      "शारदीय नवरात्रि उसी काल में आती है जब माँ ने महिषासुर का वध किया था और यह शक्ति उपासना का वर्ष का सर्वश्रेष्ठ अवसर है। इन दिनों दुर्गा सप्तशती पाठ, चंडी हवन तथा देवी कवच शत्रु, रोग एवं भय का नाश कर साहस व समृद्धि देते हैं।",
    ritualsEn: [
      "Ghatasthapana with jau, kalash and akhand jyoti at sunrise",
      "One Nav Durga form worshipped each day with her bhog",
      "Durga Saptashati path or Devi kavach every morning",
      "Kanya poojan of nine girls with halwa, puri and chana",
      "Chandi havan and purnahuti on Navami",
    ],
    ritualsHi: [
      "सूर्योदय पर जौ, कलश एवं अखंड ज्योति से घटस्थापना",
      "प्रतिदिन नव दुर्गा के एक स्वरूप का पूजन एवं भोग",
      "प्रतिदिन प्रातः दुर्गा सप्तशती पाठ अथवा देवी कवच",
      "नौ कन्याओं का पूजन — हलवा, पूरी एवं चना",
      "नवमी को चंडी हवन एवं पूर्णाहुति",
    ],
    imageUrl: fimg("sharad-navratri"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "durga-ashtami": {
    nameEn: "Durga Ashtami",
    nameHi: "दुर्गा अष्टमी",
    type: "FESTIVAL",
    deityEn: "Mahagauri / Mahishasurmardini",
    deityHi: "महागौरी / महिषासुरमर्दिनी",
    descriptionEn:
      "The eighth night is the fiercest and the most fruitful of Navratri. Mahagauri is worshipped at dawn, the sandhi pooja is offered in the forty-eight minutes joining Ashtami and Navami, and nine little girls are fed as the living Mother. Bengal's pandals ring with dhak and dhunuchi.",
    descriptionHi:
      "अष्टमी की रात्रि नवरात्रि की सबसे उग्र और सबसे फलदायी है। प्रातः महागौरी का पूजन होता है, अष्टमी-नवमी के संधिकाल के अड़तालीस मिनट में संधि पूजा होती है, और नौ कन्याओं को साक्षात माँ मानकर भोजन कराया जाता है। बंगाल के पंडाल ढाक और धुनुची से गूँज उठते हैं।",
    significanceEn:
      "Sandhi pooja marks the exact moment the Mother took the Chamunda form. Havan and kanya poojan done today are believed to close the nine-day sadhana and hand the devotee its full fruit.",
    significanceHi:
      "संधि पूजा वही क्षण है जब माँ ने चामुंडा रूप धारण किया था। आज किया गया हवन एवं कन्या पूजन नौ दिन की साधना को पूर्ण कर उसका संपूर्ण फल देता है।",
    ritualsEn: [
      "Mahagauri pooja with white flowers and coconut bhog",
      "Sandhi pooja with 108 lamps at the Ashtami-Navami joint",
      "Kanya poojan — wash the feet, tilak, bhojan and dakshina",
      "Havan with black sesame, ghee and red hibiscus",
      "Read the Devi Mahatmya chapters on Shumbha-Nishumbha",
    ],
    ritualsHi: [
      "श्वेत पुष्प एवं नारियल भोग से महागौरी पूजन",
      "अष्टमी-नवमी संधिकाल में 108 दीपों से संधि पूजा",
      "कन्या पूजन — चरण प्रक्षालन, तिलक, भोजन एवं दक्षिणा",
      "काले तिल, घृत एवं लाल गुड़हल से हवन",
      "देवी माहात्म्य के शुंभ-निशुंभ अध्यायों का पाठ",
    ],
    imageUrl: fimg("durga-ashtami"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "maha-navami": {
    nameEn: "Maha Navami",
    nameHi: "महानवमी",
    type: "FESTIVAL",
    deityEn: "Siddhidatri Durga",
    deityHi: "सिद्धिदात्री दुर्गा",
    descriptionEn:
      "On the ninth day the Mother is worshipped as Siddhidatri, giver of the eight siddhis, and the Navratri sadhana is sealed with purnahuti in the havan kund. Ayudha pooja honours the tools of one's craft — instruments, machines, vehicles and books are cleaned and garlanded.",
    descriptionHi:
      "नवमी को माँ सिद्धिदात्री रूप में पूजी जाती हैं, जो अष्ट सिद्धियों की दात्री हैं, और हवन कुंड में पूर्णाहुति के साथ नवरात्रि साधना पूर्ण होती है। आयुध पूजा में अपनी आजीविका के उपकरण — यंत्र, मशीन, वाहन और पुस्तकें — स्वच्छ कर माला पहनाई जाती हैं।",
    significanceEn:
      "Navami purnahuti is said to carry the merit of the whole nine days to the deity. New work, new tools and new vehicles started today are believed to prosper without obstruction.",
    significanceHi:
      "नवमी की पूर्णाहुति समस्त नौ दिनों का पुण्य देवी तक पहुँचाती है। आज आरंभ किया गया नया कार्य, नए उपकरण एवं नया वाहन निर्विघ्न फलते-फूलते माने जाते हैं।",
    ritualsEn: [
      "Siddhidatri pooja with navrang flowers and kheer bhog",
      "Purnahuti in the havan with coconut, ghee and samagri",
      "Ayudha pooja of tools, vehicles and account books",
      "Kanya poojan if not performed on Ashtami",
      "Feed the poor and donate red chunri to a Devi temple",
    ],
    ritualsHi: [
      "नवरंग पुष्प एवं खीर भोग से सिद्धिदात्री पूजन",
      "नारियल, घृत एवं सामग्री से हवन में पूर्णाहुति",
      "उपकरण, वाहन एवं बहीखातों की आयुध पूजा",
      "अष्टमी को न किया हो तो आज कन्या पूजन",
      "अन्नदान एवं देवी मंदिर में लाल चुनरी अर्पण",
    ],
    imageUrl: fimg("maha-navami"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  dussehra: {
    nameEn: "Dussehra (Vijayadashami)",
    nameHi: "दशहरा (विजयादशमी)",
    type: "FESTIVAL",
    deityEn: "Lord Rama & Goddess Durga",
    deityHi: "भगवान श्रीराम एवं माँ दुर्गा",
    descriptionEn:
      "Vijayadashami remembers two victories on one day — Rama's over Ravana at Lanka and Durga's over Mahishasura. Effigies burn at dusk in every maidan, Shami leaves are exchanged as gold, and the Mother's idols are taken to the river. It is one of the three-and-a-half muhurats of the year when no separate auspicious time need be sought.",
    descriptionHi:
      "विजयादशमी एक ही दिन दो विजयों का स्मरण है — लंका में राम की रावण पर और माँ दुर्गा की महिषासुर पर। संध्या को हर मैदान में पुतले जलते हैं, शमी पत्र स्वर्ण मानकर बाँटे जाते हैं, और माँ की प्रतिमाएँ नदी को सौंपी जाती हैं। यह वर्ष के साढ़े तीन अबूझ मुहूर्तों में से एक है, जब पृथक मुहूर्त देखने की आवश्यकता नहीं।",
    significanceEn:
      "Any undertaking begun on Vijayadashami is held to end in vijaya — victory. Children are given their first letters, new shops open, weapons and tools are consecrated, and journeys are begun in the aparahna hour.",
    significanceHi:
      "विजयादशमी को आरंभ किया गया कोई भी कार्य विजय में परिणत होता है। बच्चों का विद्यारंभ, नई दुकान का शुभारंभ, शस्त्र-उपकरण की प्रतिष्ठा और यात्रा का आरंभ अपराह्न काल में किया जाता है।",
    ritualsEn: [
      "Aparahna pooja of Aparajita Devi and the Shami tree",
      "Shastra / Ayudha pooja of tools and vehicles",
      "Ravan dahan at dusk with Ram naam sankirtan",
      "Exchange Shami leaves and touch elders' feet",
      "Vidyarambh for children and start of new ventures",
    ],
    ritualsHi: [
      "अपराह्न में अपराजिता देवी एवं शमी वृक्ष का पूजन",
      "उपकरणों एवं वाहनों की शस्त्र / आयुध पूजा",
      "संध्या को राम नाम संकीर्तन सहित रावण दहन",
      "शमी पत्र का आदान-प्रदान एवं बड़ों के चरण स्पर्श",
      "बालकों का विद्यारंभ एवं नए उपक्रमों का शुभारंभ",
    ],
    imageUrl: fimg("dussehra"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "sharad-purnima": {
    nameEn: "Sharad Purnima (Kojagara)",
    nameHi: "शरद पूर्णिमा (कोजागरी)",
    type: "PURNIMA",
    deityEn: "Goddess Lakshmi & Lord Krishna",
    deityHi: "माँ लक्ष्मी एवं भगवान श्रीकृष्ण",
    descriptionEn:
      "On Sharad Purnima the moon is said to shine with all sixteen kalas and its rays to carry amrit. Kheer is set under the open sky through the night and eaten at dawn as medicine. This is also Kojagara — Lakshmi walks the earth asking ko jagarti, who is awake, and blesses the household still keeping vigil.",
    descriptionHi:
      "शरद पूर्णिमा को चंद्रमा सोलह कलाओं से पूर्ण होता है और उसकी किरणों में अमृत बरसता है। खीर रातभर खुले आकाश के नीचे रखी जाती है और प्रातः औषधि रूप में ग्रहण की जाती है। यही कोजागरी भी है — लक्ष्मी पृथ्वी पर विचरती हैं और पूछती हैं 'को जागर्ति', और जागते हुए गृह को वरदान देती हैं।",
    significanceEn:
      "The amrit-laden moonlight is prescribed in Ayurveda for asthma, eye disorders and skin ailments. Keeping the Kojagara vigil with Lakshmi pooja is believed to draw wealth for the year ahead — and this is the night of Krishna's Maha Raas in Vrindavan.",
    significanceHi:
      "अमृतमय चंद्रिका आयुर्वेद में दमा, नेत्र रोग एवं त्वचा विकारों हेतु बताई गई है। लक्ष्मी पूजन सहित कोजागरी जागरण आगामी वर्ष का धन आकर्षित करता है — और यही वृंदावन में श्रीकृष्ण की महारास की रात्रि है।",
    ritualsEn: [
      "Place kheer in a silver vessel under moonlight all night",
      "Lakshmi pooja at moonrise with white lotus and kaudi",
      "Night vigil with Shri Suktam and Kanakdhara Stotra",
      "Raas-leela kirtan and jhoola seva of Radha-Krishna",
      "Eat the moon-soaked kheer as prasad at sunrise",
    ],
    ritualsHi: [
      "चाँदी के पात्र में खीर रातभर चंद्रिका में रखना",
      "चंद्रोदय पर श्वेत कमल एवं कौड़ी से लक्ष्मी पूजन",
      "श्री सूक्त एवं कनकधारा स्तोत्र सहित रात्रि जागरण",
      "रास-लीला कीर्तन एवं राधा-कृष्ण की झूला सेवा",
      "सूर्योदय पर चंद्र-सिक्त खीर का प्रसाद ग्रहण",
    ],
    imageUrl: fimg("sharad-purnima"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "karwa-chauth": {
    nameEn: "Karwa Chauth",
    nameHi: "करवा चौथ",
    type: "VRAT",
    deityEn: "Goddess Parvati & Chandra Dev",
    deityHi: "माँ पार्वती एवं चंद्र देव",
    descriptionEn:
      "Married women keep a nirjala fast from sargi at dawn until the moon is sighted through a sieve at night. The karwa — an earthen pot of water — is exchanged in the evening sabha while the Karwa Chauth katha is read. The fast is broken only after arghya to the moon and the first sip of water from the husband's hand.",
    descriptionHi:
      "सुहागिनें भोर की सरगी से लेकर रात्रि में छलनी से चंद्र दर्शन तक निर्जला व्रत रखती हैं। संध्या की सभा में करवा — जल भरा मिट्टी का पात्र — बदला जाता है और करवा चौथ की कथा सुनी जाती है। चंद्रमा को अर्घ्य देने और पति के हाथों जल का पहला घूँट लेने के बाद ही व्रत खुलता है।",
    significanceEn:
      "The vrat is kept for the long life and wellbeing of the husband, and increasingly by husbands in return. It is counted among the strongest saubhagya vrats of the year.",
    significanceHi:
      "यह व्रत पति की दीर्घायु एवं कुशलता हेतु रखा जाता है, और अब कई पति भी प्रत्युत्तर में रखते हैं। यह वर्ष के सबसे प्रबल सौभाग्य व्रतों में गिना जाता है।",
    ritualsEn: [
      "Sargi eaten before sunrise, sent by the mother-in-law",
      "Nirjala vrat through the day with Gauri-Ganesh pooja",
      "Evening sabha, karwa exchange and the vrat katha",
      "Arghya to the moon seen through a sieve",
      "Break the fast with water from the husband's hand",
    ],
    ritualsHi: [
      "सूर्योदय से पूर्व सास द्वारा भेजी सरगी का सेवन",
      "दिनभर निर्जला व्रत एवं गौरी-गणेश पूजन",
      "संध्या सभा, करवा फेरी एवं व्रत कथा श्रवण",
      "छलनी से चंद्र दर्शन कर अर्घ्य",
      "पति के हाथों जल ग्रहण कर व्रत पारण",
    ],
    imageUrl: fimg("karwa-chauth"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "ahoi-ashtami": {
    nameEn: "Ahoi Ashtami",
    nameHi: "अहोई अष्टमी",
    type: "VRAT",
    deityEn: "Ahoi Mata",
    deityHi: "अहोई माता",
    descriptionEn:
      "Four days after Karwa Chauth, mothers fast for the long life and prosperity of their children. Ahoi Mata is drawn on the wall in geru with seven or eight faces, and the fast is broken after sighting the stars — or in some families the moon, which rises very late.",
    descriptionHi:
      "करवा चौथ के चार दिन बाद माताएँ अपनी संतान की दीर्घायु एवं उन्नति हेतु व्रत रखती हैं। दीवार पर गेरू से सात या आठ मुख वाली अहोई माता बनाई जाती हैं, और तारों के दर्शन के बाद व्रत खोला जाता है — कुछ परिवारों में चंद्रोदय के बाद, जो बहुत देर से होता है।",
    significanceEn:
      "The vrat is the classical remedy prescribed for santan badha, repeated illness in children and for mothers who have lost a child. Silver ahoi beads are added to the chain each year.",
    significanceHi:
      "यह व्रत संतान बाधा, बालकों की बार-बार अस्वस्थता तथा संतान वियोग सह चुकी माताओं हेतु शास्त्रोक्त उपाय है। प्रतिवर्ष चाँदी की अहोई माला में एक मनका जोड़ा जाता है।",
    ritualsEn: [
      "Draw Ahoi Mata and the sei with her cubs on the wall",
      "Fast without food and water through the day",
      "Evening pooja with the silver ahoi and a water karwa",
      "Listen to the Ahoi Ashtami katha of the seven sons",
      "Break the fast after arghya to the stars",
    ],
    ritualsHi: [
      "दीवार पर अहोई माता एवं स्याहु-सेई का चित्रांकन",
      "दिनभर अन्न-जल रहित व्रत",
      "संध्या पूजन में चाँदी की अहोई एवं जल का करवा",
      "सात पुत्रों वाली अहोई अष्टमी कथा का श्रवण",
      "तारों को अर्घ्य देकर पारण",
    ],
    imageUrl: fimg("ahoi-ashtami"),
    major: false,
    remindDaysBefore: [3, 1, 0],
  },

  dhanteras: {
    nameEn: "Dhanteras (Dhanvantari Trayodashi)",
    nameHi: "धनतेरस (धन्वंतरि त्रयोदशी)",
    type: "FESTIVAL",
    deityEn: "Lord Dhanvantari, Kuber & Lakshmi",
    deityHi: "भगवान धन्वंतरि, कुबेर एवं लक्ष्मी",
    descriptionEn:
      "Dhanteras opens the five days of Diwali. Dhanvantari, physician of the gods, rose from the churning of the ocean on this tithi holding the pot of amrit, so it is a day for health as much as wealth. Metal, especially silver and brass, is bought before pradosh, and the first lamp of the season — the Yama deep — is lit facing south at dusk.",
    descriptionHi:
      "धनतेरस दीपावली के पाँच दिनों का शुभारंभ है। देवताओं के वैद्य धन्वंतरि इसी तिथि को समुद्र मंथन से अमृत कलश लेकर प्रकट हुए थे, इसलिए यह धन के साथ आरोग्य का भी दिन है। प्रदोष से पूर्व धातु, विशेषकर चाँदी और पीतल, क्रय की जाती है, और संध्या को दक्षिण दिशा में मौसम का पहला दीप — यम दीप — जलाया जाता है।",
    significanceEn:
      "Purchases made in the Dhanteras muhurat are believed to multiply thirteenfold. The Yama deepam is lit to protect the household from untimely death through the year.",
    significanceHi:
      "धनतेरस मुहूर्त में की गई खरीद तेरह गुना बढ़ती मानी जाती है। यम दीपम वर्षभर गृह को अकाल मृत्यु से रक्षित रखने हेतु प्रज्वलित किया जाता है।",
    ritualsEn: [
      "Buy metal, coins or utensils in the Dhanteras muhurat",
      "Dhanvantari pooja with turmeric and yellow flowers",
      "Kuber and Lakshmi pooja at the safe or cash box",
      "Yama deep — a four-wick lamp facing south at dusk",
      "Rangoli and Lakshmi charan at the threshold",
    ],
    ritualsHi: [
      "धनतेरस मुहूर्त में धातु, सिक्के अथवा बर्तन का क्रय",
      "हल्दी एवं पीत पुष्प से धन्वंतरि पूजन",
      "तिजोरी अथवा गल्ले पर कुबेर एवं लक्ष्मी पूजन",
      "संध्या को दक्षिणमुखी चार बत्ती का यम दीप",
      "देहरी पर रंगोली एवं लक्ष्मी चरण",
    ],
    imageUrl: fimg("dhanteras"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "naraka-chaturdashi": {
    nameEn: "Naraka Chaturdashi (Choti Diwali)",
    nameHi: "नरक चतुर्दशी (छोटी दिवाली)",
    type: "FESTIVAL",
    deityEn: "Lord Krishna & Yamraj",
    deityHi: "भगवान श्रीकृष्ण एवं यमराज",
    descriptionEn:
      "On this tithi Krishna and Satyabhama slew Narakasura and freed sixteen thousand captives, so the day begins before sunrise with abhyanga snan — an oil bath with ubtan and apamarga leaves. Lamps are lit in the evening and the house is readied for Lakshmi's arrival the next night. In the south this, not Amavasya, is the main Deepavali.",
    descriptionHi:
      "इसी तिथि को श्रीकृष्ण और सत्यभामा ने नरकासुर का वध कर सोलह सहस्र बंदिनियों को मुक्त किया था, इसलिए दिन का आरंभ सूर्योदय से पूर्व अभ्यंग स्नान से होता है — उबटन और अपामार्ग पत्र सहित तैल स्नान। संध्या को दीप जलाए जाते हैं और अगली रात्रि लक्ष्मी के स्वागत हेतु घर सज्जित होता है। दक्षिण भारत में अमावस्या नहीं, यही मुख्य दीपावली है।",
    significanceEn:
      "The pre-dawn abhyanga snan on this day is said to wash away the fear of naraka. Lamps lit tonight guard the corners of the house that Lakshmi will visit tomorrow.",
    significanceHi:
      "इस दिन का प्रातःकालीन अभ्यंग स्नान नरक भय का नाश करता है। आज जलाए दीप उन कोनों की रक्षा करते हैं जहाँ कल लक्ष्मी पधारेंगी।",
    ritualsEn: [
      "Abhyanga snan before sunrise with til oil and ubtan",
      "Tarpan to Yamraj and a lamp for ancestors",
      "Hanuman pooja with sindoor and chameli oil",
      "Fourteen lamps lit around the house at dusk",
      "Krishna pooja and the Narakasura vadh katha",
    ],
    ritualsHi: [
      "सूर्योदय से पूर्व तिल तेल एवं उबटन से अभ्यंग स्नान",
      "यमराज को तर्पण एवं पितरों हेतु दीपदान",
      "सिंदूर एवं चमेली तेल से हनुमान पूजन",
      "संध्या को घर के चारों ओर चौदह दीप",
      "श्रीकृष्ण पूजन एवं नरकासुर वध कथा",
    ],
    imageUrl: fimg("naraka-chaturdashi"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  diwali: {
    nameEn: "Diwali (Lakshmi Pooja)",
    nameHi: "दीपावली (लक्ष्मी पूजा)",
    type: "FESTIVAL",
    deityEn: "Goddess Lakshmi, Ganesha & Kuber",
    deityHi: "माँ लक्ष्मी, गणेश एवं कुबेर",
    descriptionEn:
      "Diwali is the darkest night of the year turned into the brightest. Ayodhya lit rows of lamps for Rama's return after fourteen years, and Lakshmi chose this amavasya to walk into homes that are clean, lit and awake. The pooja is done in the pradosh and sthir lagna hours with Ganesha at her right, new account books opened and the first lamp placed at the threshold.",
    descriptionHi:
      "दीपावली वर्ष की सबसे अँधेरी रात को सबसे उजली बना देती है। चौदह वर्ष बाद राम के लौटने पर अयोध्या ने दीपों की पंक्तियाँ सजाई थीं, और लक्ष्मी ने इसी अमावस्या को उन घरों में प्रवेश चुना जो स्वच्छ, प्रकाशित और जाग्रत हों। पूजा प्रदोष एवं स्थिर लग्न में होती है, दाहिने गणेश विराजते हैं, नई बहियाँ खुलती हैं और पहला दीप देहरी पर रखा जाता है।",
    significanceEn:
      "Lakshmi pooja on this night sets the tone for the financial year — traders begin new ledgers with Shubh-Labh and swastik. Deep daan, Kuber pooja and the Shri Suktam are held to secure both incoming wealth and its retention.",
    significanceHi:
      "इस रात्रि का लक्ष्मी पूजन आर्थिक वर्ष की दिशा तय करता है — व्यापारी शुभ-लाभ एवं स्वस्तिक अंकित कर नई बही आरंभ करते हैं। दीपदान, कुबेर पूजन तथा श्री सूक्त धन के आगमन और उसकी स्थिरता दोनों को सुरक्षित करते हैं।",
    ritualsEn: [
      "Clean the house completely and draw rangoli at the door",
      "Lakshmi-Ganesh-Kuber pooja in the pradosh sthir lagna",
      "Shri Suktam, Kanakdhara Stotra and Lakshmi aarti",
      "Chopda pujan — new ledgers marked Shubh-Labh",
      "Deep daan: rows of lamps at the threshold, tulsi and terrace",
    ],
    ritualsHi: [
      "संपूर्ण गृह शुद्धि एवं द्वार पर रंगोली",
      "प्रदोष स्थिर लग्न में लक्ष्मी-गणेश-कुबेर पूजन",
      "श्री सूक्त, कनकधारा स्तोत्र एवं लक्ष्मी आरती",
      "चोपड़ा पूजन — नई बहियों पर शुभ-लाभ अंकन",
      "दीपदान — देहरी, तुलसी एवं छत पर दीप पंक्तियाँ",
    ],
    imageUrl: fimg("diwali"),
    major: true,
    remindDaysBefore: [15, 7, 3, 1, 0],
  },

  "govardhan-puja": {
    nameEn: "Govardhan Puja (Annakut)",
    nameHi: "गोवर्धन पूजा (अन्नकूट)",
    type: "FESTIVAL",
    deityEn: "Lord Krishna & Govardhan",
    deityHi: "भगवान श्रीकृष्ण एवं गोवर्धन",
    descriptionEn:
      "The day after Diwali, Braj remembers the seven days Krishna held Govardhan hill on his little finger to shelter the cowherds from Indra's rain. A hill of cow dung is shaped in the courtyard, decorated with flowers and grass, and a mountain of food — the annakut — is offered and then shared. Cows and bullocks are bathed, painted and garlanded.",
    descriptionHi:
      "दीपावली के अगले दिन ब्रज उन सात दिनों का स्मरण करता है जब श्रीकृष्ण ने कनिष्ठा पर गोवर्धन उठाकर ग्वालों को इंद्र की वर्षा से बचाया था। आँगन में गोबर का पर्वत बनाकर फूलों और घास से सजाया जाता है, और अन्न का पर्वत — अन्नकूट — अर्पित कर बाँटा जाता है। गौ एवं बैल स्नान कराकर रंगे और माला पहनाए जाते हैं।",
    significanceEn:
      "Govardhan pooja teaches that nature and the cow, not thunder, sustain life. The annakut is offered for abundance of grain in the year ahead and for the protection of the family herd and livelihood.",
    significanceHi:
      "गोवर्धन पूजा सिखाती है कि जीवन का आधार वज्र नहीं, प्रकृति और गौमाता हैं। अन्नकूट आगामी वर्ष में अन्न की प्रचुरता तथा परिवार के पशुधन व आजीविका की रक्षा हेतु अर्पित होता है।",
    ritualsEn: [
      "Shape Govardhan from cow dung and decorate with flowers",
      "Parikrama of the hill with lamps and kirtan",
      "Annakut — 56 or 108 dishes offered to Krishna",
      "Gau pooja: bathe, tilak and feed the cows first",
      "Distribute the annakut prasad to the whole neighbourhood",
    ],
    ritualsHi: [
      "गोबर से गोवर्धन की रचना एवं पुष्प सज्जा",
      "दीप एवं कीर्तन सहित गोवर्धन परिक्रमा",
      "अन्नकूट — श्रीकृष्ण को 56 अथवा 108 व्यंजन अर्पण",
      "गौ पूजन — स्नान, तिलक एवं प्रथम ग्रास",
      "समस्त मोहल्ले में अन्नकूट प्रसाद वितरण",
    ],
    imageUrl: fimg("govardhan-puja"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "bhai-dooj": {
    nameEn: "Bhai Dooj (Yama Dwitiya)",
    nameHi: "भाई दूज (यम द्वितीया)",
    type: "FESTIVAL",
    deityEn: "Yamraj & Yamuna",
    deityHi: "यमराज एवं यमुना",
    descriptionEn:
      "Yamuna received her brother Yamraj on this dwitiya, fed him with her own hands and asked that whoever eats at his sister's home today be spared untimely death. Sisters apply tilak of roli, rice and curd, perform aarti and feed their brothers; brothers give gifts and a promise of protection.",
    descriptionHi:
      "इसी द्वितीया को यमुना ने अपने भाई यमराज का स्वागत किया, अपने हाथों भोजन कराया और वर माँगा कि जो आज बहन के घर भोजन करे, वह अकाल मृत्यु से बचे। बहनें रोली, अक्षत और दही का तिलक लगाकर आरती करती हैं और भाइयों को भोजन कराती हैं; भाई उपहार और रक्षा का वचन देते हैं।",
    significanceEn:
      "A bath in the Yamuna with one's sister today is held to free both from the fear of Yama. The tilak is a shield of the sister's prayer worn by the brother through the year.",
    significanceHi:
      "आज बहन के साथ यमुना स्नान दोनों को यम भय से मुक्त करता है। तिलक बहन की प्रार्थना का वह कवच है जिसे भाई वर्षभर धारण करता है।",
    ritualsEn: [
      "Sister draws a chowk and seats the brother facing east",
      "Tilak of roli, akshat, curd and a garland of makhana",
      "Aarti with a lamp and the offering of dry coconut",
      "Brother eats a meal cooked by the sister's hand",
      "Yamraj-Yamuna pooja and deep daan for long life",
    ],
    ritualsHi: [
      "बहन चौक पूरकर भाई को पूर्वाभिमुख बिठाती है",
      "रोली, अक्षत, दही का तिलक एवं मखाने की माला",
      "दीप से आरती तथा सूखे नारियल का अर्पण",
      "बहन के हाथ का बना भोजन भाई द्वारा ग्रहण",
      "दीर्घायु हेतु यमराज-यमुना पूजन एवं दीपदान",
    ],
    imageUrl: fimg("bhai-dooj"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "chhath-puja": {
    nameEn: "Chhath Puja",
    nameHi: "छठ पूजा",
    type: "FESTIVAL",
    deityEn: "Surya Dev & Chhathi Maiya",
    deityHi: "सूर्य देव एवं छठी मैया",
    descriptionEn:
      "Chhath is the only festival where the setting sun is worshipped before the rising one. Over four days — Nahay Khay, Kharna, Sandhya Arghya and Usha Arghya — vratis keep a thirty-six hour nirjala fast, stand waist-deep in the river at dusk and again at dawn, and offer thekua, sugarcane and seasonal fruit in bamboo soop. No priest stands between the devotee and the sun.",
    descriptionHi:
      "छठ एकमात्र पर्व है जिसमें उगते से पहले डूबते सूर्य की उपासना होती है। चार दिनों — नहाय खाय, खरना, संध्या अर्घ्य और उषा अर्घ्य — में व्रती छत्तीस घंटे का निर्जला व्रत रखते हैं, संध्या और फिर भोर में कमर तक जल में खड़े होते हैं, और बाँस के सूप में ठेकुआ, ईख तथा ऋतु फल अर्पित करते हैं। भक्त और सूर्य के बीच कोई पुरोहित नहीं होता।",
    significanceEn:
      "Chhathi Maiya, sister of Surya, is invoked for children, health and household prosperity. The vrat is famed for its purity and discipline — the prasad is cooked on a mud stove with mango wood and touched by no one who has not bathed.",
    significanceHi:
      "सूर्य की बहन छठी मैया संतान, आरोग्य एवं गृह समृद्धि हेतु आराधी जाती हैं। यह व्रत अपनी शुचिता एवं अनुशासन के लिए प्रसिद्ध है — प्रसाद आम की लकड़ी से मिट्टी के चूल्हे पर बनता है और बिना स्नान किए कोई उसे स्पर्श नहीं करता।",
    ritualsEn: [
      "Nahay Khay — river bath and sattvik kaddu-bhat meal",
      "Kharna — day-long fast broken with gud kheer at dusk",
      "Sandhya Arghya — arghya to the setting sun in the river",
      "Night jagran with Chhath geet and the daura vigil",
      "Usha Arghya at sunrise, then parana and prasad daan",
    ],
    ritualsHi: [
      "नहाय खाय — नदी स्नान एवं सात्विक कद्दू-भात",
      "खरना — दिनभर व्रत, संध्या को गुड़ की खीर से पारण",
      "संध्या अर्घ्य — नदी में अस्ताचलगामी सूर्य को अर्घ्य",
      "छठ गीत एवं दउरा जागरण सहित रात्रि जागरण",
      "उषा अर्घ्य, तत्पश्चात पारण एवं प्रसाद वितरण",
    ],
    imageUrl: fimg("chhath-puja"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "dev-uthani-ekadashi": {
    nameEn: "Dev Uthani Ekadashi (Prabodhini)",
    nameHi: "देवउठनी एकादशी (प्रबोधिनी)",
    type: "EKADASHI",
    deityEn: "Lord Vishnu",
    deityHi: "भगवान विष्णु",
    descriptionEn:
      "After four months of yoga nidra on Sheshnag, Vishnu wakes on this ekadashi and the wedding season opens across Bharat. Households wake him with conch, bell and the singing of Uthho Deva, Baitho Deva. Every muhurat suspended since Devshayani returns from today.",
    descriptionHi:
      "शेषनाग पर चार मास की योग निद्रा के बाद इसी एकादशी को विष्णु जागते हैं और समस्त भारत में विवाह का काल आरंभ होता है। घरों में शंख, घंटी और 'उठो देव, बैठो देव' के गान से उन्हें जगाया जाता है। देवशयनी से रुके सभी मुहूर्त आज से लौट आते हैं।",
    significanceEn:
      "This is called the ekadashi that wakes the gods — chaturmas vrats are concluded, tulsi vivah begins the next day and marriages, griha pravesh and mundan resume. Fasting today is said to equal the merit of all other ekadashis.",
    significanceHi:
      "इसे देव जगाने वाली एकादशी कहा गया है — चातुर्मास व्रत पूर्ण होते हैं, अगले दिन तुलसी विवाह होता है और विवाह, गृह प्रवेश एवं मुंडन पुनः आरंभ होते हैं। आज का उपवास शेष सभी एकादशियों के समान पुण्य देता है।",
    ritualsEn: [
      "Draw Vishnu's feet in the courtyard with geru and rice flour",
      "Wake the Lord at dusk with conch, bell and kirtan",
      "Offer sugarcane, water chestnut and seasonal fruit",
      "Tulsi and Shaligram worshipped together with lamps",
      "Ekadashi vrat with no grain, broken at dwadashi parana",
    ],
    ritualsHi: [
      "आँगन में गेरू एवं चावल के आटे से विष्णु चरण",
      "संध्या को शंख, घंटी एवं कीर्तन से देव जागरण",
      "ईख, सिंघाड़ा एवं ऋतु फल का अर्पण",
      "तुलसी एवं शालिग्राम का दीपों सहित संयुक्त पूजन",
      "निराहार एकादशी व्रत, द्वादशी पारण पर समापन",
    ],
    imageUrl: fimg("dev-uthani-ekadashi"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "tulsi-vivah": {
    nameEn: "Tulsi Vivah",
    nameHi: "तुलसी विवाह",
    type: "FESTIVAL",
    deityEn: "Tulsi Mata & Shaligram",
    deityHi: "तुलसी माता एवं शालिग्राम",
    descriptionEn:
      "The tulsi in the courtyard is married to Shaligram, the stone form of Vishnu, with a full wedding — mandap of sugarcane, red chunri, mangal sutra, phere and a baraat of neighbours. The ceremony formally opens the marriage season and is performed by families who have no daughter to give away.",
    descriptionHi:
      "आँगन की तुलसी का विवाह विष्णु के शिला स्वरूप शालिग्राम से पूर्ण विधि से होता है — ईख का मंडप, लाल चुनरी, मंगलसूत्र, फेरे और पड़ोसियों की बारात। यह संस्कार औपचारिक रूप से विवाह काल का शुभारंभ करता है और वे परिवार भी करते हैं जिनके यहाँ कन्यादान का अवसर नहीं आया।",
    significanceEn:
      "Kanyadaan of tulsi is said to carry the merit of giving away a daughter. Performing tulsi vivah is the classical remedy for delayed marriage in the family and for domestic discord.",
    significanceHi:
      "तुलसी का कन्यादान कन्यादान के समान पुण्य देता है। तुलसी विवाह परिवार में विवाह विलंब एवं गृह क्लेश का शास्त्रोक्त उपाय है।",
    ritualsEn: [
      "Build a sugarcane mandap around the tulsi vrindavan",
      "Dress tulsi in a red chunri with bangles and bindi",
      "Shaligram brought in procession as the groom",
      "Mangalashtak, phere with a cotton thread and kanyadaan",
      "Distribute wedding prasad of gud, til and puri",
    ],
    ritualsHi: [
      "तुलसी वृंदावन के चारों ओर ईख का मंडप",
      "तुलसी को लाल चुनरी, चूड़ी एवं बिंदी से शृंगार",
      "वर रूप में शालिग्राम की बारात एवं आगमन",
      "मंगलाष्टक, सूत के धागे से फेरे एवं कन्यादान",
      "गुड़, तिल एवं पूरी का विवाह प्रसाद वितरण",
    ],
    imageUrl: fimg("tulsi-vivah"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "kartik-purnima": {
    nameEn: "Kartik Purnima (Dev Deepawali)",
    nameHi: "कार्तिक पूर्णिमा (देव दीपावली)",
    type: "PURNIMA",
    deityEn: "Lord Shiva & Lord Vishnu",
    deityHi: "भगवान शिव एवं भगवान विष्णु",
    descriptionEn:
      "Shiva destroyed Tripurasura on this purnima and the devas came down to Kashi to light lamps in thanksgiving — Dev Deepawali, the Diwali of the gods. Eighty-four ghats of Varanasi carry a million earthen lamps at dusk. It is also Guru Nanak Jayanti and the closing day of the Kartik month vrat.",
    descriptionHi:
      "इसी पूर्णिमा को शिव ने त्रिपुरासुर का संहार किया और देवगण काशी उतरकर दीप जलाकर कृतज्ञता प्रकट कर गए — देव दीपावली, देवताओं की दीपावली। संध्या को वाराणसी के चौरासी घाट लाखों मिट्टी के दीपों से जगमगाते हैं। यही गुरु नानक जयंती और कार्तिक मास व्रत का समापन दिवस भी है।",
    significanceEn:
      "A snan in the Ganga at Kashi, Prayag or Haridwar today is said to equal a hundred ashwamedha yajnas. Deep daan on flowing water is the signature punya of this night.",
    significanceHi:
      "आज काशी, प्रयाग अथवा हरिद्वार में गंगा स्नान सौ अश्वमेध यज्ञों के तुल्य कहा गया है। बहते जल पर दीपदान इस रात्रि का विशिष्ट पुण्य है।",
    ritualsEn: [
      "Ganga snan at brahma muhurat, ideally at Kashi",
      "Deep daan of lamps floated on the river at dusk",
      "Tripurari Shiva pooja with 365 wicks",
      "Satyanarayan katha and Kartik month vrat udyapan",
      "Daan of blanket, ghee and til to a Brahmin",
    ],
    ritualsHi: [
      "ब्रह्म मुहूर्त में गंगा स्नान, विशेषकर काशी में",
      "संध्या को नदी में दीपदान",
      "365 बत्तियों से त्रिपुरारि शिव पूजन",
      "सत्यनारायण कथा एवं कार्तिक व्रत उद्यापन",
      "ब्राह्मण को कंबल, घृत एवं तिल का दान",
    ],
    imageUrl: fimg("kartik-purnima"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "kalabhairav-jayanti": {
    nameEn: "Kaal Bhairav Jayanti",
    nameHi: "काल भैरव जयंती",
    type: "JAYANTI",
    deityEn: "Kaal Bhairav",
    deityHi: "काल भैरव",
    descriptionEn:
      "Kaal Bhairav, the terrible form Shiva assumed to humble Brahma's pride, appeared on this Margashirsha Krishna Ashtami. He is the kotwal of Kashi — no one may stay in the city without his leave — and the guardian of Ujjain. Worship is offered at midnight with black til, mustard oil and the feeding of dogs.",
    descriptionHi:
      "काल भैरव, वह उग्र स्वरूप जो शिव ने ब्रह्मा का अहंकार भंग करने हेतु धारण किया, इसी मार्गशीर्ष कृष्ण अष्टमी को प्रकट हुए। वे काशी के कोतवाल हैं — बिना उनकी अनुमति नगर में कोई नहीं रह सकता — और उज्जैन के रक्षक हैं। पूजा अर्धरात्रि में काले तिल, सरसों तेल एवं श्वान को भोजन कराकर होती है।",
    significanceEn:
      "Bhairav upasana is the classical remedy for enemies, court cases, black magic, chronic fear and the malefic effects of Rahu-Ketu and Shani. He is quick to please and quicker to protect.",
    significanceHi:
      "भैरव उपासना शत्रु बाधा, न्यायालयीन प्रकरण, अभिचार, दीर्घ भय तथा राहु-केतु व शनि के अनिष्ट का शास्त्रोक्त उपाय है। वे शीघ्र प्रसन्न होते हैं और उससे भी शीघ्र रक्षा करते हैं।",
    ritualsEn: [
      "Midnight pooja with black til, urad and mustard-oil lamp",
      "Offer a black thread, coconut and imarti at the shrine",
      "Feed black dogs — Bhairav's vahan — before eating",
      "Chant the Batuk Bhairav or Kaal Bhairav Ashtakam",
      "Light a chaumukhi lamp facing the south-west",
    ],
    ritualsHi: [
      "अर्धरात्रि में काले तिल, उड़द एवं सरसों तेल के दीप से पूजन",
      "मंदिर में काला धागा, नारियल एवं इमरती अर्पण",
      "भोजन से पूर्व काले श्वान — भैरव वाहन — को ग्रास",
      "बटुक भैरव अथवा काल भैरव अष्टकम का पाठ",
      "नैऋत्य दिशा में चौमुखी दीप प्रज्वलन",
    ],
    imageUrl: fimg("kalabhairav-jayanti"),
    major: false,
    remindDaysBefore: [3, 1, 0],
  },

  "gita-jayanti": {
    nameEn: "Gita Jayanti (Mokshada Ekadashi)",
    nameHi: "गीता जयंती (मोक्षदा एकादशी)",
    type: "JAYANTI",
    deityEn: "Lord Krishna",
    deityHi: "भगवान श्रीकृष्ण",
    descriptionEn:
      "On this Margashirsha Shukla Ekadashi, Krishna spoke the seven hundred verses of the Bhagavad Gita to Arjuna between the two armies at Kurukshetra. Kurukshetra holds a week-long mahotsav; households read the eighteenth chapter and place the book on a decorated seat. It is also Mokshada Ekadashi, kept for the liberation of ancestors.",
    descriptionHi:
      "इसी मार्गशीर्ष शुक्ल एकादशी को कुरुक्षेत्र में दोनों सेनाओं के बीच श्रीकृष्ण ने अर्जुन को भगवद्गीता के सात सौ श्लोक सुनाए थे। कुरुक्षेत्र में सप्ताह भर महोत्सव होता है; घरों में अठारहवाँ अध्याय पढ़ा जाता है और ग्रंथ सुसज्जित आसन पर स्थापित होता है। यही मोक्षदा एकादशी भी है, जो पितरों की मुक्ति हेतु रखी जाती है।",
    significanceEn:
      "Reading the Gita today is said to carry the merit of a full parayan. The Mokshada vrat is prescribed for ancestors stuck without gati, and its punya can be formally transferred to them.",
    significanceHi:
      "आज गीता पढ़ना संपूर्ण पारायण का पुण्य देता है। मोक्षदा व्रत उन पितरों हेतु बताया गया है जिन्हें गति नहीं मिली, और इसका पुण्य विधिवत उन्हें संकल्पित किया जा सकता है।",
    ritualsEn: [
      "Place the Gita on a chowki with sandal and yellow flowers",
      "Parayan of chapter 15 or the whole eighteenth chapter",
      "Ekadashi vrat without grain, with tulsi in every offering",
      "Sankalp of the vrat's punya to departed ancestors",
      "Donate a copy of the Gita and feed a Brahmin",
    ],
    ritualsHi: [
      "चौकी पर गीता स्थापित कर चंदन एवं पीत पुष्प अर्पण",
      "पंद्रहवें अथवा संपूर्ण अठारहवें अध्याय का पारायण",
      "निराहार एकादशी व्रत, प्रत्येक भोग में तुलसी दल",
      "व्रत का पुण्य दिवंगत पितरों को संकल्पित करना",
      "गीता ग्रंथ का दान एवं ब्राह्मण भोजन",
    ],
    imageUrl: fimg("gita-jayanti"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "makar-sankranti": {
    nameEn: "Makar Sankranti",
    nameHi: "मकर संक्रांति",
    type: "SANKRANTI",
    deityEn: "Surya Dev",
    deityHi: "सूर्य देव",
    descriptionEn:
      "The sun turns north into Makar rashi and uttarayan begins — the six bright months in which the gods are said to be awake. Til and gud sweets are exchanged with the words til-gul ghya, goad goad bola. Kites fill the sky over Gujarat, khichdi is cooked in the north, Pongal boils over in the south and lakhs bathe at Prayag and Gangasagar.",
    descriptionHi:
      "सूर्य उत्तरायण होकर मकर राशि में प्रवेश करते हैं और वह छह मास आरंभ होते हैं जिनमें देवता जाग्रत माने जाते हैं। तिल-गुड़ की मिठाई 'तिळ-गुळ घ्या, गोड़ गोड़ बोला' कहकर बाँटी जाती है। गुजरात का आकाश पतंगों से भर जाता है, उत्तर में खिचड़ी बनती है, दक्षिण में पोंगल उफनता है और प्रयाग व गंगासागर में लाखों स्नान करते हैं।",
    significanceEn:
      "Sankranti is the great day of daan — til, gud, khichdi, blanket and ghee given today are said to return multiplied. Surya arghya and Aditya Hridaya path on this morning strengthen the sun in the horoscope, and with it health, authority and the father's wellbeing.",
    significanceHi:
      "संक्रांति महादान का दिवस है — आज दिया गया तिल, गुड़, खिचड़ी, कंबल एवं घृत कई गुना लौटता है। इस प्रातः सूर्य अर्घ्य एवं आदित्य हृदय पाठ कुंडली में सूर्य को बल देता है, और उसके साथ आरोग्य, पद-प्रतिष्ठा तथा पिता की कुशलता को भी।",
    ritualsEn: [
      "Snan in a river at sunrise, ideally Ganga or Sangam",
      "Arghya to the sun with water, red flowers and roli",
      "Til-gud laddu exchanged and khichdi cooked with urad",
      "Daan of khichdi, blanket, til, ghee and black urad",
      "Aditya Hridaya Stotra and Gayatri japa at sunrise",
    ],
    ritualsHi: [
      "सूर्योदय पर नदी स्नान, विशेषकर गंगा अथवा संगम",
      "जल, लाल पुष्प एवं रोली से सूर्य को अर्घ्य",
      "तिल-गुड़ लड्डू वितरण एवं उड़द की खिचड़ी",
      "खिचड़ी, कंबल, तिल, घृत एवं काली उड़द का दान",
      "सूर्योदय पर आदित्य हृदय स्तोत्र एवं गायत्री जप",
    ],
    imageUrl: fimg("makar-sankranti"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "mauni-amavasya": {
    nameEn: "Mauni Amavasya",
    nameHi: "मौनी अमावस्या",
    type: "AMAVASYA",
    deityEn: "Lord Vishnu & Pitru Devta",
    deityHi: "भगवान विष्णु एवं पितृ देवता",
    descriptionEn:
      "The amavasya of Magha is kept in silence — mauna — because speech scatters what silence gathers. It is the greatest bathing day of the Magh Mela at Prayagraj, when the waters of the Sangam are believed to turn to nectar. Ancestors are offered tarpan and the day is spent in japa rather than conversation.",
    descriptionHi:
      "माघ की अमावस्या मौन रहकर की जाती है — क्योंकि वाणी वह बिखेर देती है जो मौन संचित करता है। यह प्रयागराज के माघ मेले का सबसे बड़ा स्नान पर्व है, जब संगम का जल अमृत हो जाता है। पितरों को तर्पण दिया जाता है और दिन वार्तालाप के बजाय जप में बीतता है।",
    significanceEn:
      "A silent snan and japa today is said to equal the merit of a month of tapas. It is also a strong day for pitru tarpan and for shani-related shanti karma.",
    significanceHi:
      "आज मौन स्नान एवं जप एक मास की तपस्या के समान फल देता है। यह पितृ तर्पण तथा शनि संबंधी शांति कर्म हेतु भी प्रबल दिवस है।",
    ritualsEn: [
      "Silent snan at sunrise, ideally at Prayagraj Sangam",
      "Til tarpan for ancestors facing south",
      "Maun vrat and japa of the Gayatri or Vishnu Sahasranam",
      "Deep daan and offering of til, blanket and food",
      "Peepal parikrama with water and a lamp at dusk",
    ],
    ritualsHi: [
      "सूर्योदय पर मौन स्नान, विशेषकर प्रयागराज संगम पर",
      "दक्षिणाभिमुख होकर पितरों हेतु तिल तर्पण",
      "मौन व्रत एवं गायत्री अथवा विष्णु सहस्रनाम जप",
      "दीपदान तथा तिल, कंबल एवं अन्न का दान",
      "संध्या को जल एवं दीप सहित पीपल परिक्रमा",
    ],
    imageUrl: fimg("mauni-amavasya"),
    major: false,
    remindDaysBefore: [3, 1, 0],
  },

  "vasant-panchami": {
    nameEn: "Vasant Panchami (Saraswati Puja)",
    nameHi: "वसंत पंचमी (सरस्वती पूजा)",
    type: "FESTIVAL",
    deityEn: "Goddess Saraswati",
    deityHi: "माँ सरस्वती",
    descriptionEn:
      "Spring arrives and with it Saraswati, seated on a white lotus with the veena. Yellow is worn, yellow flowers offered and yellow sweets distributed as the mustard fields turn gold. Children are given their first letters on a slate, and instruments, pens and books are placed at the Mother's feet.",
    descriptionHi:
      "वसंत आता है और उसके साथ श्वेत कमल पर वीणा लिए सरस्वती। पीत वस्त्र धारण किए जाते हैं, पीत पुष्प अर्पित होते हैं और पीली मिठाई बँटती है, जब सरसों के खेत सोने से भर जाते हैं। बालकों का स्लेट पर विद्यारंभ होता है, और वाद्य, लेखनी व पुस्तकें माँ के चरणों में रखी जाती हैं।",
    significanceEn:
      "Vasant Panchami is an abujh muhurat — a day needing no separate auspicious hour. Vidyarambh, aksharabhyasam, new learning, new music and new marriages all begin today under Saraswati's grace.",
    significanceHi:
      "वसंत पंचमी अबूझ मुहूर्त है — इस दिन पृथक शुभ समय देखने की आवश्यकता नहीं। विद्यारंभ, अक्षरारंभ, नई विद्या, नया संगीत और नए विवाह सब आज माँ सरस्वती की कृपा से आरंभ होते हैं।",
    ritualsEn: [
      "Saraswati pooja with yellow flowers, kesar and boondi",
      "Place books, pens and instruments before the Devi",
      "Vidyarambh — the child's first letters written in rice",
      "Chant Ya Kundendu Tushar Hara Dhavala",
      "Wear yellow and distribute kesari halwa or laddu",
    ],
    ritualsHi: [
      "पीत पुष्प, केसर एवं बूँदी से सरस्वती पूजन",
      "देवी के समक्ष पुस्तक, लेखनी एवं वाद्य स्थापन",
      "विद्यारंभ — अक्षत पर बालक का प्रथम अक्षर लेखन",
      "'या कुंदेंदु तुषार हार धवला' का पाठ",
      "पीत वस्त्र धारण एवं केसरिया हलवा या लड्डू वितरण",
    ],
    imageUrl: fimg("vasant-panchami"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "magha-purnima": {
    nameEn: "Magha Purnima",
    nameHi: "माघ पूर्णिमा",
    type: "PURNIMA",
    deityEn: "Lord Vishnu & Chandra Dev",
    deityHi: "भगवान विष्णु एवं चंद्र देव",
    descriptionEn:
      "Magha Purnima closes the month-long Magha snan at Prayag. The devas are believed to take human form and bathe at the Sangam on this day, so the water is treated as amrit. It is also the day of Ravidas Jayanti.",
    descriptionHi:
      "माघ पूर्णिमा प्रयाग के मासपर्यंत माघ स्नान का समापन करती है। मान्यता है कि इस दिन देवगण मनुष्य रूप धारण कर संगम में स्नान करते हैं, इसलिए जल अमृत माना जाता है। यही रविदास जयंती भी है।",
    significanceEn:
      "Snan, daan and til-tarpan today are said to grant release from debt and disease. Feeding the poor on Magha Purnima is a classical remedy for a weak Moon or Guru in the horoscope.",
    significanceHi:
      "आज स्नान, दान एवं तिल-तर्पण ऋण व रोग से मुक्ति देते हैं। माघ पूर्णिमा का अन्नदान कुंडली में निर्बल चंद्र अथवा गुरु का शास्त्रोक्त उपाय है।",
    ritualsEn: [
      "Snan at sunrise in a river or with Ganga jal at home",
      "Satyanarayan katha and Vishnu pooja with tulsi",
      "Til, blanket, ghee and grain daan to a Brahmin",
      "Feed the poor and offer food to a cow",
      "Chandra darshan and arghya of milk at moonrise",
    ],
    ritualsHi: [
      "सूर्योदय पर नदी स्नान अथवा घर में गंगाजल मिश्रित स्नान",
      "सत्यनारायण कथा एवं तुलसी सहित विष्णु पूजन",
      "ब्राह्मण को तिल, कंबल, घृत एवं अन्न दान",
      "अन्नदान एवं गौ ग्रास",
      "चंद्रोदय पर चंद्र दर्शन एवं दुग्ध अर्घ्य",
    ],
    imageUrl: fimg("magha-purnima"),
    major: false,
    remindDaysBefore: [3, 1, 0],
  },

  "maha-shivratri": {
    nameEn: "Maha Shivratri",
    nameHi: "महाशिवरात्रि",
    type: "FESTIVAL",
    deityEn: "Lord Shiva",
    deityHi: "भगवान शिव",
    descriptionEn:
      "The great night of Shiva — when the formless took the form of the lingam, and when Shiva and Parvati were wed. Devotees keep a night-long vigil in four prahars, bathing the lingam in milk, honey, curd, ghee and Ganga jal, and offering bel patra whose three leaves stand for the three eyes and three gunas. Kashi, Ujjain and all twelve jyotirlingas stay open through the night.",
    descriptionHi:
      "शिव की महारात्रि — जब निराकार ने लिंग रूप धारण किया, और जब शिव-पार्वती का विवाह हुआ। भक्त चार प्रहरों में रात्रि जागरण करते हैं, लिंग को दूध, मधु, दही, घृत एवं गंगाजल से स्नान कराते हैं, और बेलपत्र अर्पित करते हैं जिसके तीन दल तीन नेत्रों तथा तीन गुणों के प्रतीक हैं। काशी, उज्जैन और बारहों ज्योतिर्लिंग रातभर खुले रहते हैं।",
    significanceEn:
      "A single bel patra offered with faith tonight is said to equal a year of worship. Shivratri jaagran is prescribed for moksha, for the removal of grave illness, for unmarried girls seeking a good husband, and for anyone under a hard transit of Shani or Rahu.",
    significanceHi:
      "आज श्रद्धा से अर्पित एक बेलपत्र वर्षभर की उपासना के तुल्य कहा गया है। शिवरात्रि जागरण मोक्ष, गंभीर रोग निवृत्ति, कन्याओं हेतु सुयोग्य वर तथा शनि या राहु की कठिन दशा से गुजर रहे प्रत्येक जातक के लिए विहित है।",
    ritualsEn: [
      "Vrat from sunrise, broken after sunrise the next day",
      "Rudrabhishek in four prahars with panchamrit and jal",
      "Bel patra, dhatura, aak flower and bhang offered",
      "Continuous Om Namah Shivaya and Mahamrityunjay japa",
      "Night jagran with Shiv Tandav Stotra and Lingashtakam",
    ],
    ritualsHi: [
      "सूर्योदय से व्रत, अगले दिन सूर्योदय के बाद पारण",
      "चार प्रहरों में पंचामृत एवं जल से रुद्राभिषेक",
      "बेलपत्र, धतूरा, आक पुष्प एवं भांग अर्पण",
      "अखंड 'ॐ नमः शिवाय' एवं महामृत्युंजय जप",
      "शिव तांडव स्तोत्र एवं लिंगाष्टकम सहित रात्रि जागरण",
    ],
    imageUrl: fimg("maha-shivratri"),
    major: true,
    remindDaysBefore: [15, 7, 3, 1, 0],
  },

  "holika-dahan": {
    nameEn: "Holika Dahan",
    nameHi: "होलिका दहन",
    type: "FESTIVAL",
    deityEn: "Lord Narasimha & Prahlad",
    deityHi: "भगवान नृसिंह एवं प्रह्लाद",
    descriptionEn:
      "On the Phalguna Purnima evening, after Bhadra has passed, the pyre of Holika is lit at the crossroads. Holika, who could not burn, was consumed; Prahlad, who had only the name of Hari, walked out untouched. Families circle the fire, offer new barley and coconut, and carry home a spark for the year's first cooking.",
    descriptionHi:
      "फाल्गुन पूर्णिमा की संध्या को, भद्रा बीत जाने पर, चौराहे पर होलिका की चिता जलाई जाती है। होलिका, जो जल नहीं सकती थी, भस्म हो गई; प्रह्लाद, जिसके पास केवल हरि नाम था, अछूता निकल आया। परिवार अग्नि की परिक्रमा करते हैं, नई जौ एवं नारियल अर्पित करते हैं, और वर्ष के पहले भोजन हेतु एक चिंगारी घर ले जाते हैं।",
    significanceEn:
      "The fire is a public burning of what should not survive the year — ego, illness, enmity and fear. New grain roasted in it is eaten as prasad and is believed to protect the household's harvest and health.",
    significanceHi:
      "यह अग्नि उन सबका सार्वजनिक दहन है जो वर्ष पार नहीं करना चाहिए — अहंकार, रोग, वैर और भय। उसमें भूना नया अन्न प्रसाद रूप में खाया जाता है और गृह की फसल तथा आरोग्य की रक्षा करता माना जाता है।",
    ritualsEn: [
      "Set the pyre with wood, cow-dung cakes and a Holika effigy",
      "Light it only after Bhadra ends, in the pradosh muhurat",
      "Three or seven parikrama with a raw cotton thread",
      "Offer new wheat, gram, coconut and gulal to the fire",
      "Narasimha stotra and the Prahlad katha before dahan",
    ],
    ritualsHi: [
      "लकड़ी, उपले एवं होलिका पुतले से चिता की रचना",
      "भद्रा समाप्ति के पश्चात प्रदोष मुहूर्त में दहन",
      "कच्चे सूत के धागे से तीन अथवा सात परिक्रमा",
      "अग्नि में नया गेहूँ, चना, नारियल एवं गुलाल अर्पण",
      "दहन से पूर्व नृसिंह स्तोत्र एवं प्रह्लाद कथा",
    ],
    imageUrl: fimg("holika-dahan"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  holi: {
    nameEn: "Holi (Dhulandi)",
    nameHi: "होली (धुलंडी)",
    type: "FESTIVAL",
    deityEn: "Lord Krishna & Radha",
    deityHi: "भगवान श्रीकृष्ण एवं राधा",
    descriptionEn:
      "The morning after the fire, colour takes the streets. Krishna, dark of complexion, asked Yashoda why Radha was fair — and was told to go colour her as he pleased; Braj has been playing ever since. Gulal, water, thandai, gujiya and the fearless equality of a day when no one can tell rich from poor.",
    descriptionHi:
      "अग्नि के अगले प्रातः रंग गलियों पर छा जाते हैं। श्यामवर्ण कृष्ण ने यशोदा से पूछा था कि राधा गोरी क्यों है — और उत्तर मिला कि जाकर जैसा चाहो वैसा रंग दो; तब से ब्रज खेल रहा है। गुलाल, जल, ठंडाई, गुझिया और उस एक दिन की निर्भय समानता जब धनी-निर्धन में भेद नहीं दिखता।",
    significanceEn:
      "Holi is the festival of forgiveness — old quarrels are dissolved in colour and sweets are exchanged even with those one has not spoken to. It also marks the harvest of the rabi crop and the last full moon of the Hindu year.",
    significanceHi:
      "होली क्षमा का पर्व है — पुराने वैर रंगों में घुल जाते हैं और उनसे भी मिठाई बाँटी जाती है जिनसे बोलचाल बंद थी। यह रबी फसल की कटाई और हिंदू वर्ष की अंतिम पूर्णिमा का भी सूचक है।",
    ritualsEn: [
      "Offer gulal first at the Krishna or family shrine",
      "Apply colour to elders' feet and take their blessing",
      "Play with dry gulal and natural colours through the morning",
      "Thandai, gujiya, dahi bade and puran poli shared",
      "Evening milan — visit homes, embrace and end all quarrels",
    ],
    ritualsHi: [
      "सर्वप्रथम श्रीकृष्ण अथवा कुलदेवता को गुलाल अर्पण",
      "बड़ों के चरणों में रंग लगाकर आशीर्वाद ग्रहण",
      "प्रातःकाल सूखे गुलाल एवं प्राकृतिक रंगों से खेल",
      "ठंडाई, गुझिया, दही बड़े एवं पूरनपोली का सहभोज",
      "संध्या मिलन — घर-घर जाकर गले मिलना, वैर समाप्ति",
    ],
    imageUrl: fimg("holi"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "chaitra-navratri": {
    nameEn: "Chaitra Navratri (Gudi Padwa)",
    nameHi: "चैत्र नवरात्रि (गुड़ी पड़वा)",
    type: "FESTIVAL",
    deityEn: "Goddess Durga",
    deityHi: "माँ दुर्गा",
    descriptionEn:
      "The Hindu new year opens with nine nights of the Mother in spring. Brahma is said to have begun creation on this pratipada; Maharashtra raises the gudi, the Deccan cooks bevu-bella of neem and jaggery, and Sindhis celebrate Cheti Chand. Ghatasthapana, akhand jyoti and the nine forms follow as in Sharad Navratri, closing with Ram Navami.",
    descriptionHi:
      "हिंदू नववर्ष वसंत में माँ की नौ रात्रियों से आरंभ होता है। मान्यता है कि ब्रह्मा ने इसी प्रतिपदा को सृष्टि रचना आरंभ की थी; महाराष्ट्र गुड़ी खड़ी करता है, दक्कन नीम-गुड़ का बेवु-बेल्ल बनाता है, और सिंधी समाज चेटी चंड मनाता है। घटस्थापना, अखंड ज्योति एवं नवरूप शारदीय नवरात्रि की भाँति चलते हैं और राम नवमी पर समापन होता है।",
    significanceEn:
      "This is one of the three-and-a-half abujh muhurats — a whole day auspicious without calculation. New ventures, new samvat panchang, new account books and new homes all begin today.",
    significanceHi:
      "यह साढ़े तीन अबूझ मुहूर्तों में से एक है — बिना गणना के संपूर्ण दिन शुभ। नए उपक्रम, नया संवत्सर पंचांग, नई बहियाँ और नया गृह प्रवेश सब आज से आरंभ होते हैं।",
    ritualsEn: [
      "Ghatasthapana with jau, kalash and akhand jyoti",
      "Raise the gudi or a saffron flag over the doorway",
      "Eat neem with jaggery for health through the year",
      "Read the new samvat panchang and the year's phal",
      "Nine days of Devi pooja closing with Ram Navami",
    ],
    ritualsHi: [
      "जौ, कलश एवं अखंड ज्योति सहित घटस्थापना",
      "द्वार पर गुड़ी अथवा भगवा ध्वज की स्थापना",
      "वर्षभर आरोग्य हेतु नीम एवं गुड़ का सेवन",
      "नया संवत्सर पंचांग एवं वर्ष फल श्रवण",
      "नौ दिन देवी पूजन, राम नवमी पर समापन",
    ],
    imageUrl: fimg("chaitra-navratri"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "ram-navami": {
    nameEn: "Ram Navami",
    nameHi: "राम नवमी",
    type: "JAYANTI",
    deityEn: "Lord Rama",
    deityHi: "भगवान श्रीराम",
    descriptionEn:
      "At madhyahna on Chaitra Shukla Navami, Kaushalya's son was born in Ayodhya under Punarvasu nakshatra — maryada purushottam, the measure of dharma for every age since. Temples read the Balkand, cradles are rocked at noon, and Ayodhya's Saryu ghats overflow.",
    descriptionHi:
      "चैत्र शुक्ल नवमी के मध्याह्न में पुनर्वसु नक्षत्र में अयोध्या में कौशल्या नंदन का जन्म हुआ — मर्यादा पुरुषोत्तम, तब से हर युग के लिए धर्म का मानदंड। मंदिरों में बालकांड का पाठ होता है, दोपहर में पालने झूलते हैं, और अयोध्या के सरयू घाट भर जाते हैं।",
    significanceEn:
      "Rama's worship is prescribed for those seeking steadiness of character, harmony between father and son, and relief from public disgrace. Ram Raksha Stotra recited today is held to protect the reciter for the year.",
    significanceHi:
      "श्रीराम की उपासना चरित्र की स्थिरता, पिता-पुत्र सामंजस्य तथा लोकनिंदा से मुक्ति हेतु विहित है। आज पढ़ा गया राम रक्षा स्तोत्र वर्षभर पाठक की रक्षा करता है।",
    ritualsEn: [
      "Fast till madhyahna, the hour of the Lord's birth",
      "Ram janmotsav at noon with cradle, kirtan and conch",
      "Ramcharitmanas Balkand or Sundarkand path",
      "Ram Raksha Stotra and 108 Shri Ram Jai Ram japa",
      "Offer panakam, kheer and tulsi; distribute prasad",
    ],
    ritualsHi: [
      "प्रभु के जन्म काल मध्याह्न तक व्रत",
      "दोपहर में पालना, कीर्तन एवं शंख सहित राम जन्मोत्सव",
      "रामचरितमानस बालकांड अथवा सुंदरकांड पाठ",
      "राम रक्षा स्तोत्र एवं 108 'श्रीराम जय राम' जप",
      "पनकम, खीर एवं तुलसी अर्पण, प्रसाद वितरण",
    ],
    imageUrl: fimg("ram-navami"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "hanuman-jayanti": {
    nameEn: "Hanuman Jayanti",
    nameHi: "हनुमान जयंती",
    type: "JAYANTI",
    deityEn: "Lord Hanuman",
    deityHi: "श्री हनुमान जी",
    descriptionEn:
      "On the Chaitra Purnima sunrise, Anjani and Kesari's son was born with the strength of Vayu, and he remains the one deity believed to be still awake and walking the earth wherever the Ramayan is read. Sindoor mixed with chameli oil is offered, boondi laddu piled at his feet and the Chalisa sung forty times.",
    descriptionHi:
      "चैत्र पूर्णिमा के सूर्योदय पर अंजनी एवं केसरी के पुत्र का जन्म वायु के बल के साथ हुआ, और वे एकमात्र ऐसे देव माने जाते हैं जो आज भी जाग्रत हैं और जहाँ रामायण पढ़ी जाती है वहाँ उपस्थित रहते हैं। चमेली तेल में मिला सिंदूर अर्पित होता है, चरणों में बूँदी के लड्डू चढ़ते हैं और चालीसा चालीस बार गाई जाती है।",
    significanceEn:
      "Hanuman upasana is the swiftest protection from fear, enemies, evil influence and the harsh periods of Shani and Mangal. He is Sankat Mochan — the one who unties knots no one else can.",
    significanceHi:
      "हनुमान उपासना भय, शत्रु, अनिष्ट प्रभाव तथा शनि व मंगल की कठिन दशा से शीघ्रतम रक्षा है। वे संकट मोचन हैं — वह गाँठ खोलने वाले जिसे कोई और नहीं खोल सकता।",
    ritualsEn: [
      "Sunrise pooja with sindoor, chameli oil and janeu",
      "Hanuman Chalisa 40 times or Sundarkand path",
      "Offer boondi laddu, banana, betel leaf and gud-chana",
      "Bajrang Baan for protection from enemies and fear",
      "Feed monkeys and offer red cloth at the temple",
    ],
    ritualsHi: [
      "सूर्योदय पूजन — सिंदूर, चमेली तेल एवं जनेऊ अर्पण",
      "हनुमान चालीसा का 40 बार पाठ अथवा सुंदरकांड",
      "बूँदी लड्डू, केला, पान एवं गुड़-चना का भोग",
      "शत्रु एवं भय से रक्षा हेतु बजरंग बाण",
      "वानरों को भोजन एवं मंदिर में लाल वस्त्र अर्पण",
    ],
    imageUrl: fimg("hanuman-jayanti"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "akshaya-tritiya": {
    nameEn: "Akshaya Tritiya",
    nameHi: "अक्षय तृतीया",
    type: "FESTIVAL",
    deityEn: "Lord Vishnu & Goddess Lakshmi",
    deityHi: "भगवान विष्णु एवं माँ लक्ष्मी",
    descriptionEn:
      "Akshaya means that which never diminishes. Treta Yuga began on this tithi, Parashuram was born, Ganga descended, the Pandavas received the akshaya patra and Kubera received his wealth. Whatever is begun, given or bought today is believed to keep growing without end.",
    descriptionHi:
      "अक्षय अर्थात जो कभी क्षय न हो। इसी तिथि को त्रेता युग आरंभ हुआ, परशुराम का जन्म हुआ, गंगा अवतरित हुईं, पांडवों को अक्षय पात्र मिला और कुबेर को धन प्राप्त हुआ। आज जो आरंभ किया, दान किया अथवा क्रय किया जाए, वह निरंतर बढ़ता माना जाता है।",
    significanceEn:
      "One of the three-and-a-half abujh muhurats. Gold, property, new business, marriage and the sowing of seed all begin today, and daan given now is held to be inexhaustible in its return.",
    significanceHi:
      "साढ़े तीन अबूझ मुहूर्तों में से एक। स्वर्ण, संपत्ति, नया व्यवसाय, विवाह और बीज बुवाई सब आज आरंभ होते हैं, और अभी किया गया दान अक्षय फल देता है।",
    ritualsEn: [
      "Vishnu-Lakshmi pooja with tulsi, akshat and yellow flowers",
      "Buy gold, silver or start a new venture in the muhurat",
      "Daan of water pot, fan, sattu, curd and umbrella",
      "Feed the poor — annadaan is the day's highest punya",
      "Shri Suktam, Kanakdhara Stotra and Lakshmi japa",
    ],
    ritualsHi: [
      "तुलसी, अक्षत एवं पीत पुष्प से विष्णु-लक्ष्मी पूजन",
      "मुहूर्त में स्वर्ण, रजत क्रय अथवा नया उपक्रम आरंभ",
      "जलपात्र, पंखा, सत्तू, दही एवं छत्र का दान",
      "अन्नदान — आज का सर्वोच्च पुण्य",
      "श्री सूक्त, कनकधारा स्तोत्र एवं लक्ष्मी जप",
    ],
    imageUrl: fimg("akshaya-tritiya"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "buddha-purnima": {
    nameEn: "Buddha Purnima (Vaishakh Purnima)",
    nameHi: "बुद्ध पूर्णिमा (वैशाख पूर्णिमा)",
    type: "PURNIMA",
    deityEn: "Lord Buddha (Vishnu avatar)",
    deityHi: "भगवान बुद्ध (विष्णु अवतार)",
    descriptionEn:
      "Birth, enlightenment and mahaparinirvana of the Buddha all fall on this full moon of Vaishakh. In the Sanatan tradition he is counted among Vishnu's avatars. The day is spent in ahimsa, charity and the release of caged birds and fish.",
    descriptionHi:
      "वैशाख की इसी पूर्णिमा को बुद्ध का जन्म, ज्ञान प्राप्ति और महापरिनिर्वाण तीनों हुए। सनातन परंपरा में वे विष्णु के अवतारों में गिने जाते हैं। यह दिन अहिंसा, दान तथा पिंजरे के पक्षियों व मछलियों को मुक्त करने में बीतता है।",
    significanceEn:
      "Vaishakh Purnima snan and daan are said to carry immense merit; water pots, fans and sattu are given away as the summer peaks. Dharma-daan and abstaining from harm are the day's core practice.",
    significanceHi:
      "वैशाख पूर्णिमा का स्नान एवं दान अपार पुण्यदायी कहा गया है; ग्रीष्म के चरम पर जलपात्र, पंखे एवं सत्तू का दान होता है। धर्म-दान तथा हिंसा से विरति इस दिन की मूल साधना है।",
    ritualsEn: [
      "Snan at sunrise and a lamp lit before the Bodhi tree or tulsi",
      "Satyanarayan katha or Vishnu Sahasranam path",
      "Water-pot, fan, sattu and sandal daan",
      "Abstain from meat; observe ahimsa the whole day",
      "Feed the poor and release caged birds or fish",
    ],
    ritualsHi: [
      "सूर्योदय स्नान एवं बोधि वृक्ष या तुलसी के समक्ष दीप",
      "सत्यनारायण कथा अथवा विष्णु सहस्रनाम पाठ",
      "जलपात्र, पंखा, सत्तू एवं चंदन का दान",
      "मांसाहार त्याग, दिनभर अहिंसा का पालन",
      "अन्नदान एवं पिंजरे के पक्षी या मछलियों को मुक्ति",
    ],
    imageUrl: fimg("buddha-purnima"),
    major: false,
    remindDaysBefore: [3, 1, 0],
  },

  "shani-jayanti": {
    nameEn: "Shani Jayanti (Vat Savitri)",
    nameHi: "शनि जयंती (वट सावित्री)",
    type: "JAYANTI",
    deityEn: "Shani Dev",
    deityHi: "शनि देव",
    descriptionEn:
      "Shani, son of Surya and Chhaya, appeared on the Jyeshtha amavasya. The same day is Vat Savitri, when married women circle the banyan with cotton thread remembering Savitri who argued Satyavan back from Yama. Mustard oil, black til and iron are offered at Shani temples across the country.",
    descriptionHi:
      "सूर्य एवं छाया के पुत्र शनि ज्येष्ठ अमावस्या को प्रकट हुए। यही दिन वट सावित्री का भी है, जब सुहागिनें कच्चे सूत से वट वृक्ष की परिक्रमा करती हैं, उस सावित्री का स्मरण करते हुए जिसने सत्यवान को यम से वापस माँग लिया। देशभर के शनि मंदिरों में सरसों तेल, काला तिल एवं लोहा अर्पित होता है।",
    significanceEn:
      "This is the strongest day of the year for shanti of sade sati, dhaiya and Shani mahadasha. Shani is the giver of karma's exact fruit — worship today is prayed not for escape but for the strength to bear and to correct.",
    significanceHi:
      "साढ़ेसाती, ढैया एवं शनि महादशा की शांति हेतु यह वर्ष का सर्वाधिक प्रबल दिन है। शनि कर्म का यथार्थ फल देते हैं — आज की उपासना बचने के लिए नहीं, सहने और सुधारने का बल पाने हेतु की जाती है।",
    ritualsEn: [
      "Til-oil abhishek of Shani with black til and blue flowers",
      "Light a mustard-oil lamp under a peepal at dusk",
      "Feed crows, black dogs and the differently abled",
      "Daan of black urad, iron, mustard oil and black cloth",
      "Vat Savitri parikrama of the banyan with raw thread",
    ],
    ritualsHi: [
      "काले तिल एवं नील पुष्प सहित शनि का तैलाभिषेक",
      "संध्या को पीपल के नीचे सरसों तेल का दीप",
      "काक, श्वान एवं दिव्यांगजन को भोजन",
      "काली उड़द, लोहा, सरसों तेल एवं काले वस्त्र का दान",
      "कच्चे सूत से वट वृक्ष की वट सावित्री परिक्रमा",
    ],
    imageUrl: fimg("shani-jayanti"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "ganga-dussehra": {
    nameEn: "Ganga Dussehra",
    nameHi: "गंगा दशहरा",
    type: "FESTIVAL",
    deityEn: "Maa Ganga",
    deityHi: "माँ गंगा",
    descriptionEn:
      "On Jyeshtha Shukla Dashami, Ganga descended from Shiva's matted hair to the earth at Bhagirath's plea, to give moksha to the sixty thousand sons of Sagar. Haridwar, Rishikesh, Kashi and Prayag hold the great snan; ten of everything is offered — ten flowers, ten lamps, ten dips.",
    descriptionHi:
      "ज्येष्ठ शुक्ल दशमी को भगीरथ की प्रार्थना पर गंगा शिव की जटाओं से पृथ्वी पर उतरीं, सगर के साठ हजार पुत्रों को मोक्ष देने। हरिद्वार, ऋषिकेश, काशी और प्रयाग में महास्नान होता है; हर वस्तु दस अर्पित होती है — दस पुष्प, दस दीप, दस डुबकियाँ।",
    significanceEn:
      "A dip today is said to wash ten kinds of sin — three of body, four of speech and three of mind. Ganga jal collected on this day is kept in the home shrine through the year.",
    significanceHi:
      "आज की डुबकी दस प्रकार के पापों का शमन करती है — तीन कायिक, चार वाचिक एवं तीन मानसिक। आज संग्रहित गंगाजल वर्षभर घर के देवस्थान में रखा जाता है।",
    ritualsEn: [
      "Ten dips in the Ganga or a bath with Ganga jal at home",
      "Offer ten lamps, ten flowers and ten fruits to the river",
      "Chant the Ganga Stotram of Adi Shankaracharya",
      "Daan of water pot, fan, sattu, and sesame — ten of each",
      "Ganga aarti at dusk at the nearest ghat",
    ],
    ritualsHi: [
      "गंगा में दस डुबकियाँ अथवा घर में गंगाजल मिश्रित स्नान",
      "नदी को दस दीप, दस पुष्प एवं दस फल अर्पण",
      "आदि शंकराचार्य कृत गंगा स्तोत्रम का पाठ",
      "जलपात्र, पंखा, सत्तू एवं तिल का दस-दस दान",
      "संध्या को निकटतम घाट पर गंगा आरती",
    ],
    imageUrl: fimg("ganga-dussehra"),
    major: false,
    remindDaysBefore: [3, 1, 0],
  },

  "nirjala-ekadashi": {
    nameEn: "Nirjala Ekadashi (Bhimseni)",
    nameHi: "निर्जला एकादशी (भीमसेनी)",
    type: "EKADASHI",
    deityEn: "Lord Vishnu",
    deityHi: "भगवान विष्णु",
    descriptionEn:
      "The hardest ekadashi of the year, kept without food and without a drop of water through the peak of summer. Vyasa told Bhima, who could not fast on the other twenty-three, that this one alone would give him the merit of them all — hence Bhimseni Ekadashi.",
    descriptionHi:
      "वर्ष की सबसे कठिन एकादशी, ग्रीष्म के चरम में अन्न तो दूर, जल की एक बूँद भी नहीं। व्यास जी ने भीम से, जो शेष तेईस एकादशियों पर उपवास नहीं कर पाते थे, कहा कि केवल यही एक उन सबका फल दे देगी — इसीलिए भीमसेनी एकादशी।",
    significanceEn:
      "One nirjala vrat is said to equal all twenty-four ekadashis of the year. The day's daan — water pots, fans, sattu, sandal and slippers — is the classical antidote to the summer's heat given to others.",
    significanceHi:
      "एक निर्जला व्रत वर्ष की चौबीसों एकादशियों के तुल्य कहा गया है। इस दिन का दान — जलपात्र, पंखा, सत्तू, चंदन एवं खड़ाऊँ — दूसरों को ग्रीष्म ताप से राहत देने का शास्त्रोक्त उपाय है।",
    ritualsEn: [
      "Nirjala vrat from sunrise to the dwadashi parana",
      "Vishnu pooja with tulsi, sandal and yellow flowers",
      "Vishnu Sahasranam or Om Namo Bhagavate Vasudevaya japa",
      "Daan of water pot, fan, sattu, curd, mango and umbrella",
      "Set out water for birds and travellers through the day",
    ],
    ritualsHi: [
      "सूर्योदय से द्वादशी पारण तक निर्जला व्रत",
      "तुलसी, चंदन एवं पीत पुष्प से विष्णु पूजन",
      "विष्णु सहस्रनाम अथवा 'ॐ नमो भगवते वासुदेवाय' जप",
      "जलपात्र, पंखा, सत्तू, दही, आम एवं छत्र का दान",
      "दिनभर पक्षियों एवं राहगीरों हेतु जल की व्यवस्था",
    ],
    imageUrl: fimg("nirjala-ekadashi"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "jagannath-rath-yatra": {
    nameEn: "Jagannath Rath Yatra",
    nameHi: "जगन्नाथ रथ यात्रा",
    type: "FESTIVAL",
    deityEn: "Lord Jagannath, Balabhadra & Subhadra",
    deityHi: "भगवान जगन्नाथ, बलभद्र एवं सुभद्रा",
    descriptionEn:
      "Once a year the Lord of the Universe leaves his sanctum and comes out onto the road. Three enormous wooden chariots — Nandighosh, Taladhwaj and Darpadalan — are pulled by hand from the Puri temple to Gundicha, the aunt's house, and back nine days later. This is the one darshan for which no caste, faith or ticket is asked.",
    descriptionHi:
      "वर्ष में एक बार जगत के स्वामी गर्भगृह छोड़कर सड़क पर आते हैं। तीन विशाल काष्ठ रथ — नंदीघोष, तालध्वज एवं दर्पदलन — पुरी मंदिर से गुंडिचा, मौसी के घर, तक हाथों से खींचे जाते हैं और नौ दिन बाद लौटते हैं। यही वह दर्शन है जिसके लिए न जाति पूछी जाती है, न मत, न टिकट।",
    significanceEn:
      "Touching the rope of the chariot is said to end the cycle of rebirth. For those who cannot reach Puri, watching the yatra and offering poda pitha and khaja at home carries the same intention.",
    significanceHi:
      "रथ की रस्सी का स्पर्श जन्म-मरण का चक्र समाप्त करता कहा गया है। जो पुरी नहीं पहुँच सकते, उनके लिए यात्रा दर्शन तथा घर पर पोड़ा पीठा व खाजा का भोग वही भाव रखता है।",
    ritualsEn: [
      "Darshan of the three deities on the chariots",
      "Chherapahara — sweeping the chariot floor in humility",
      "Offer khaja, poda pitha and coconut at home",
      "Jagannath Ashtakam and Hare Krishna kirtan",
      "Pull or touch the rath rope if present at Puri",
    ],
    ritualsHi: [
      "रथ पर विराजित तीनों विग्रहों का दर्शन",
      "छेरा पहँरा — विनम्रता से रथ मंच का मार्जन",
      "घर पर खाजा, पोड़ा पीठा एवं नारियल का भोग",
      "जगन्नाथ अष्टकम एवं हरे कृष्ण कीर्तन",
      "पुरी में उपस्थित हों तो रथ रस्सी का स्पर्श अथवा कर्षण",
    ],
    imageUrl: fimg("jagannath-rath-yatra"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "devshayani-ekadashi": {
    nameEn: "Devshayani Ekadashi",
    nameHi: "देवशयनी एकादशी",
    type: "EKADASHI",
    deityEn: "Lord Vishnu",
    deityHi: "भगवान विष्णु",
    descriptionEn:
      "Vishnu lies down on Sheshnag in the ocean of milk for four months and Chaturmas begins. All marriages, griha pravesh, mundan and new ventures are suspended until Dev Uthani. What replaces them is vrat, path, katha and the deliberate giving up of one food for four months.",
    descriptionHi:
      "विष्णु क्षीरसागर में शेषनाग पर चार मास के लिए शयन करते हैं और चातुर्मास आरंभ होता है। विवाह, गृह प्रवेश, मुंडन एवं नए उपक्रम देवउठनी तक स्थगित रहते हैं। उनके स्थान पर व्रत, पाठ, कथा तथा चार मास के लिए किसी एक भोज्य पदार्थ का संकल्पित त्याग आता है।",
    significanceEn:
      "Chaturmas is the year's tapas season — Shravan, Bhadrapada, Ashwin and Kartik. A vow taken today and kept for four months is believed to bear disproportionate fruit.",
    significanceHi:
      "चातुर्मास वर्ष का तप काल है — श्रावण, भाद्रपद, आश्विन एवं कार्तिक। आज लिया गया और चार मास निभाया गया संकल्प असाधारण फल देता है।",
    ritualsEn: [
      "Ekadashi vrat without grain, tulsi in every offering",
      "Lay Vishnu to rest on a decorated bed with a lullaby",
      "Take the chaturmas sankalp — give up one food or habit",
      "Vishnu Sahasranam and Shri Hari stotra path",
      "Daan of grain, cloth and an umbrella to a Brahmin",
    ],
    ritualsHi: [
      "निराहार एकादशी व्रत, प्रत्येक भोग में तुलसी दल",
      "सुसज्जित शय्या पर विष्णु शयन एवं लोरी गान",
      "चातुर्मास संकल्प — एक भोज्य अथवा आदत का त्याग",
      "विष्णु सहस्रनाम एवं श्री हरि स्तोत्र पाठ",
      "ब्राह्मण को अन्न, वस्त्र एवं छत्र का दान",
    ],
    imageUrl: fimg("devshayani-ekadashi"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "guru-purnima": {
    nameEn: "Guru Purnima (Vyas Purnima)",
    nameHi: "गुरु पूर्णिमा (व्यास पूर्णिमा)",
    type: "PURNIMA",
    deityEn: "Ved Vyas & the Guru",
    deityHi: "वेद व्यास एवं गुरु",
    descriptionEn:
      "The full moon of Ashadha honours Ved Vyas, who divided the Vedas and gave the world the Mahabharata and the Puranas. Every disciple goes to the feet of a teacher today — spiritual, academic or of a craft — with flowers, fruit and dakshina. Where the guru is no longer alive, his padukas receive the worship.",
    descriptionHi:
      "आषाढ़ की पूर्णिमा वेद व्यास को समर्पित है, जिन्होंने वेदों का विभाजन किया और संसार को महाभारत तथा पुराण दिए। आज हर शिष्य अपने गुरु के चरणों में जाता है — आध्यात्मिक, विद्यागत अथवा शिल्प का — पुष्प, फल और दक्षिणा लेकर। जहाँ गुरु देहधारी नहीं रहे, वहाँ उनकी पादुकाएँ पूजी जाती हैं।",
    significanceEn:
      "Guru diksha taken today is said to be many times more potent. The day also opens Chaturmas for sadhus, who halt their wandering and stay in one place for four months to teach.",
    significanceHi:
      "आज ली गई गुरु दीक्षा कई गुना अधिक प्रभावी कही गई है। यही दिन साधुओं के चातुर्मास का आरंभ भी है, जब वे भ्रमण रोककर चार मास एक स्थान पर रहकर उपदेश देते हैं।",
    ritualsEn: [
      "Guru pooja or paduka pooja with flowers and fruit",
      "Guru Gita path and Guru Brahma Guru Vishnu chant",
      "Offer dakshina, cloth and a meal to the teacher",
      "Vyas pooja at the family or lineage shrine",
      "Take a new vow of study or sadhana for the year",
    ],
    ritualsHi: [
      "पुष्प एवं फल सहित गुरु पूजन अथवा पादुका पूजन",
      "गुरु गीता पाठ एवं 'गुरुर्ब्रह्मा गुरुर्विष्णु' का जप",
      "गुरु को दक्षिणा, वस्त्र एवं भोजन अर्पण",
      "कुल अथवा परंपरा के स्थान पर व्यास पूजन",
      "वर्षभर हेतु नए अध्ययन या साधना का संकल्प",
    ],
    imageUrl: fimg("guru-purnima"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "shravan-start": {
    nameEn: "Shravan Month Begins",
    nameHi: "श्रावण मास आरंभ",
    type: "SPECIAL",
    deityEn: "Lord Shiva",
    deityHi: "भगवान शिव",
    descriptionEn:
      "Shravan is Shiva's own month. The samudra manthan happened now and Shiva drank the halahal to save creation, so the whole month is spent cooling him with water, milk and bel patra. Kanwariyas walk barefoot from the Ganga with sealed pots; every Monday is a Shravan Somvar vrat.",
    descriptionHi:
      "श्रावण शिव का अपना मास है। समुद्र मंथन इसी काल में हुआ और शिव ने सृष्टि की रक्षा हेतु हलाहल पिया, इसलिए पूरा मास उन्हें जल, दूध और बेलपत्र से शीतल करने में बीतता है। कांवड़िए गंगा से सीलबंद कलश लेकर नंगे पाँव चलते हैं; प्रत्येक सोमवार श्रावण सोमवार व्रत होता है।",
    significanceEn:
      "Rudrabhishek in Shravan is held to be many times more fruitful than at any other time. Unmarried girls keep the Somvar vrat for a husband like Shiva; the married keep it for their husband's life.",
    significanceHi:
      "श्रावण का रुद्राभिषेक अन्य किसी काल की तुलना में कई गुना फलदायी माना गया है। कुँवारी कन्याएँ शिव जैसे वर हेतु सोमवार व्रत रखती हैं; सुहागिनें पति की आयु हेतु।",
    ritualsEn: [
      "Jalabhishek of the shivling every morning with Ganga jal",
      "Bel patra, dhatura, aak and white flowers offered daily",
      "Shravan Somvar vrat with one meal after evening pooja",
      "Rudrabhishek or Mahamrityunjay jaap at a jyotirlinga",
      "Om Namah Shivaya japa and Shiv Chalisa each day",
    ],
    ritualsHi: [
      "प्रतिदिन प्रातः गंगाजल से शिवलिंग का जलाभिषेक",
      "प्रतिदिन बेलपत्र, धतूरा, आक एवं श्वेत पुष्प अर्पण",
      "श्रावण सोमवार व्रत, संध्या पूजन के बाद एक भुक्त",
      "ज्योतिर्लिंग पर रुद्राभिषेक अथवा महामृत्युंजय जाप",
      "प्रतिदिन 'ॐ नमः शिवाय' जप एवं शिव चालीसा",
    ],
    imageUrl: fimg("shravan-start"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },

  "hariyali-teej": {
    nameEn: "Hariyali Teej",
    nameHi: "हरियाली तीज",
    type: "VRAT",
    deityEn: "Goddess Parvati & Lord Shiva",
    deityHi: "माता पार्वती एवं भगवान शिव",
    descriptionEn:
      "The monsoon has turned everything green and Parvati is reunited with Shiva after a hundred births of penance. Women wear green, apply mehendi, swing on jhoolas hung from neem trees and sing kajri. Newly married daughters receive sindhara from their parents' home.",
    descriptionHi:
      "वर्षा ने सब कुछ हरा कर दिया है और सौ जन्मों की तपस्या के बाद पार्वती को शिव पुनः प्राप्त हुए। स्त्रियाँ हरे वस्त्र पहनती हैं, मेहँदी रचाती हैं, नीम की डाल पर पड़े झूलों पर झूलती हैं और कजरी गाती हैं। नवविवाहिता बेटियों को मायके से सिंधारा आता है।",
    significanceEn:
      "The vrat is kept for marital happiness and for the reunion of separated couples. Parvati's constancy is its model — she is said to have taken this very form of tapasya to win Shiva.",
    significanceHi:
      "यह व्रत दांपत्य सुख तथा वियुक्त दंपतियों के पुनर्मिलन हेतु रखा जाता है। पार्वती की निष्ठा इसका आदर्श है — कहा जाता है कि उन्होंने शिव को पाने हेतु यही तप किया था।",
    ritualsEn: [
      "Nirjala or phalahar vrat through the day",
      "Shiva-Parvati pooja with green bangles and mehendi",
      "Jhoola seva — swing decorated with flowers and leaves",
      "Sing kajri and listen to the Hariyali Teej katha",
      "Sindhara of ghewar, bangles and clothes exchanged",
    ],
    ritualsHi: [
      "दिनभर निर्जला अथवा फलाहार व्रत",
      "हरी चूड़ियों एवं मेहँदी सहित शिव-पार्वती पूजन",
      "झूला सेवा — पुष्प एवं पत्तों से सज्जित हिंडोला",
      "कजरी गान एवं हरियाली तीज कथा श्रवण",
      "घेवर, चूड़ी एवं वस्त्रों का सिंधारा आदान-प्रदान",
    ],
    imageUrl: fimg("hariyali-teej"),
    major: false,
    remindDaysBefore: [3, 1, 0],
  },

  "nag-panchami": {
    nameEn: "Nag Panchami",
    nameHi: "नाग पंचमी",
    type: "FESTIVAL",
    deityEn: "Nag Devta & Lord Shiva",
    deityHi: "नाग देवता एवं भगवान शिव",
    descriptionEn:
      "The serpents who hold the earth, guard the treasures and rest on Vishnu and Shiva are worshipped on Shravan Shukla Panchami. Milk and lawa are offered at anthills and to images of Ananta, Vasuki, Takshak and the eight great nagas. No field is ploughed and no earth dug on this day.",
    descriptionHi:
      "जो नाग पृथ्वी को धारण करते हैं, निधियों की रक्षा करते हैं और विष्णु व शिव पर विराजते हैं, उनकी पूजा श्रावण शुक्ल पंचमी को होती है। बाँबी पर तथा अनंत, वासुकि, तक्षक एवं अष्ट नागों के चित्रों को दूध और लावा अर्पित किया जाता है। इस दिन न खेत जोता जाता है, न भूमि खोदी जाती है।",
    significanceEn:
      "Nag pooja on this day is the classical remedy for kaal sarp dosh, sarp shrap, skin disease and childlessness. Trimbakeshwar, Ujjain's Nagchandreshwar and the Naga temples of Karnataka draw huge crowds.",
    significanceHi:
      "इस दिन नाग पूजन काल सर्प दोष, सर्प शाप, चर्म रोग एवं संतानहीनता का शास्त्रोक्त उपाय है। त्र्यंबकेश्वर, उज्जैन के नागचंद्रेश्वर तथा कर्नाटक के नाग मंदिरों में विशाल भीड़ उमड़ती है।",
    ritualsEn: [
      "Draw nagas on the wall with cow dung or geru",
      "Offer raw milk, lawa, durva and white flowers",
      "Do not dig the earth, plough or cut anything today",
      "Chant the Navnag Stotra and Ananta's twelve names",
      "Kaal sarp shanti or nag pratishtha at a nag temple",
    ],
    ritualsHi: [
      "गोबर अथवा गेरू से दीवार पर नाग चित्रांकन",
      "कच्चा दूध, लावा, दूर्वा एवं श्वेत पुष्प अर्पण",
      "आज भूमि खनन, हल चलाना एवं काटना वर्जित",
      "नवनाग स्तोत्र एवं अनंत के द्वादश नामों का जप",
      "नाग मंदिर में काल सर्प शांति अथवा नाग प्रतिष्ठा",
    ],
    imageUrl: fimg("nag-panchami"),
    major: true,
    remindDaysBefore: [3, 1, 0],
  },

  "raksha-bandhan": {
    nameEn: "Raksha Bandhan",
    nameHi: "रक्षाबंधन",
    type: "FESTIVAL",
    deityEn: "Lord Vishnu & the bond of protection",
    deityHi: "भगवान विष्णु एवं रक्षा सूत्र",
    descriptionEn:
      "A sister ties a thread on her brother's wrist and he owes her protection for life — the same thread Draupadi tore from her sari for Krishna's bleeding finger and Indrani tied on Indra before the war with the asuras. The rakhi is tied in the aparahna after Bhadra passes, with tilak, aarti and sweets.",
    descriptionHi:
      "बहन भाई की कलाई पर धागा बाँधती है और वह आजीवन उसकी रक्षा का ऋणी हो जाता है — वही धागा जो द्रौपदी ने कृष्ण की रक्तस्रावी अँगुली हेतु अपनी साड़ी से फाड़ा था और इंद्राणी ने असुर युद्ध से पूर्व इंद्र को बाँधा था। राखी भद्रा बीतने पर अपराह्न में तिलक, आरती एवं मिष्ठान्न सहित बाँधी जाती है।",
    significanceEn:
      "The same purnima is Shravani Upakarma, when the sacred thread is changed, and Gayatri Jayanti. The raksha sutra is worn until Janmashtami or until it falls of its own accord.",
    significanceHi:
      "यही पूर्णिमा श्रावणी उपाकर्म भी है, जब यज्ञोपवीत बदला जाता है, और गायत्री जयंती भी। रक्षा सूत्र जन्माष्टमी तक अथवा स्वतः गिरने तक धारण किया जाता है।",
    ritualsEn: [
      "Tie the rakhi in the aparahna muhurat, after Bhadra",
      "Tilak of roli and akshat, aarti and sweets first",
      "Brother's vow of protection and a gift to the sister",
      "Shravani Upakarma — change of the janeu with mantra",
      "Tie a raksha sutra at the family shrine as well",
    ],
    ritualsHi: [
      "भद्रा के पश्चात अपराह्न मुहूर्त में राखी बंधन",
      "पहले रोली-अक्षत का तिलक, आरती एवं मिष्ठान्न",
      "भाई का रक्षा वचन एवं बहन को उपहार",
      "श्रावणी उपाकर्म — मंत्रोच्चार सहित यज्ञोपवीत परिवर्तन",
      "गृह देवस्थान पर भी रक्षा सूत्र बंधन",
    ],
    imageUrl: fimg("raksha-bandhan"),
    major: true,
    remindDaysBefore: [7, 3, 1, 0],
  },
};

type Occurrence = { family: string; date: string; endDate?: string };

/** Every major occurrence between 2026-09-01 and 2027-12-31 (verified against drikpanchang, New Delhi). */
const OCCURRENCES: Occurrence[] = [
  // ── 2026 ──
  { family: "krishna-janmashtami", date: "2026-09-04" },
  { family: "hartalika-teej", date: "2026-09-14" },
  { family: "ganesh-chaturthi", date: "2026-09-14", endDate: "2026-09-25" },
  { family: "radha-ashtami", date: "2026-09-19" },
  { family: "anant-chaturdashi", date: "2026-09-25" },
  { family: "pitru-paksha", date: "2026-09-27", endDate: "2026-10-10" },
  { family: "sarva-pitru-amavasya", date: "2026-10-10" },
  { family: "sharad-navratri", date: "2026-10-11", endDate: "2026-10-20" },
  { family: "durga-ashtami", date: "2026-10-19" },
  { family: "maha-navami", date: "2026-10-19" },
  { family: "dussehra", date: "2026-10-20" },
  { family: "sharad-purnima", date: "2026-10-25" },
  { family: "karwa-chauth", date: "2026-10-29" },
  { family: "ahoi-ashtami", date: "2026-11-01" },
  { family: "dhanteras", date: "2026-11-06" },
  { family: "naraka-chaturdashi", date: "2026-11-08" },
  { family: "diwali", date: "2026-11-08" },
  { family: "govardhan-puja", date: "2026-11-10" },
  { family: "bhai-dooj", date: "2026-11-11" },
  { family: "chhath-puja", date: "2026-11-13", endDate: "2026-11-16" },
  { family: "dev-uthani-ekadashi", date: "2026-11-20" },
  { family: "tulsi-vivah", date: "2026-11-21" },
  { family: "kartik-purnima", date: "2026-11-24" },
  { family: "kalabhairav-jayanti", date: "2026-12-01" },
  { family: "gita-jayanti", date: "2026-12-20" },
  // ── 2027 ──
  { family: "makar-sankranti", date: "2027-01-15" },
  { family: "mauni-amavasya", date: "2027-02-06" },
  { family: "vasant-panchami", date: "2027-02-11" },
  { family: "magha-purnima", date: "2027-02-20" },
  { family: "maha-shivratri", date: "2027-03-06" },
  { family: "holika-dahan", date: "2027-03-21" },
  { family: "holi", date: "2027-03-22" },
  { family: "chaitra-navratri", date: "2027-04-07", endDate: "2027-04-15" },
  { family: "ram-navami", date: "2027-04-15" },
  { family: "hanuman-jayanti", date: "2027-04-20" },
  { family: "akshaya-tritiya", date: "2027-05-09" },
  { family: "buddha-purnima", date: "2027-05-20" },
  { family: "shani-jayanti", date: "2027-06-04" },
  { family: "ganga-dussehra", date: "2027-06-13" },
  { family: "nirjala-ekadashi", date: "2027-06-14" },
  { family: "jagannath-rath-yatra", date: "2027-07-05" },
  { family: "devshayani-ekadashi", date: "2027-07-14" },
  { family: "guru-purnima", date: "2027-07-18" },
  { family: "shravan-start", date: "2027-07-19", endDate: "2027-08-17" },
  { family: "hariyali-teej", date: "2027-08-04" },
  { family: "nag-panchami", date: "2027-08-06" },
  { family: "raksha-bandhan", date: "2027-08-17" },
  { family: "krishna-janmashtami", date: "2027-08-25" },
  { family: "hartalika-teej", date: "2027-09-03" },
  { family: "ganesh-chaturthi", date: "2027-09-04", endDate: "2027-09-14" },
  { family: "radha-ashtami", date: "2027-09-08" },
  { family: "anant-chaturdashi", date: "2027-09-14" },
  { family: "pitru-paksha", date: "2027-09-16", endDate: "2027-09-29" },
  { family: "sarva-pitru-amavasya", date: "2027-09-29" },
  { family: "sharad-navratri", date: "2027-09-30", endDate: "2027-10-09" },
  { family: "durga-ashtami", date: "2027-10-07" },
  { family: "maha-navami", date: "2027-10-08" },
  { family: "dussehra", date: "2027-10-09" },
  { family: "sharad-purnima", date: "2027-10-14" },
  { family: "karwa-chauth", date: "2027-10-18" },
  { family: "ahoi-ashtami", date: "2027-10-22" },
  { family: "dhanteras", date: "2027-10-27" },
  { family: "naraka-chaturdashi", date: "2027-10-28" },
  { family: "diwali", date: "2027-10-29" },
  { family: "govardhan-puja", date: "2027-10-30" },
  { family: "bhai-dooj", date: "2027-10-31" },
  { family: "chhath-puja", date: "2027-11-02", endDate: "2027-11-05" },
  { family: "dev-uthani-ekadashi", date: "2027-11-10" },
  { family: "tulsi-vivah", date: "2027-11-11" },
  { family: "kartik-purnima", date: "2027-11-14" },
  { family: "kalabhairav-jayanti", date: "2027-11-20" },
  { family: "gita-jayanti", date: "2027-12-09" },
];

export const MAJOR_FESTIVALS: FestivalSeed[] = OCCURRENCES.map(({ family, date, endDate }) => {
  const tpl = FESTIVAL_TEMPLATES[family];
  if (!tpl) throw new Error(`Unknown festival template: ${family}`);
  const year = date.slice(0, 4);
  return { ...tpl, slug: `${family}-${year}`, date, endDate: endDate ?? null };
});

/** Art keys used by scripts/generate-art.ts for the major festivals. */
export const FESTIVAL_ART_KEYS = Object.keys(FESTIVAL_TEMPLATES);

// ───────────────────────── computed recurring observances ─────────────────────────

/**
 * Traditional Ekadashi names, keyed by `${purnimantaMonth}-${paksha}`.
 * North-Indian panchangs name the krishna-paksha ekadashi after the purnimanta
 * month, which is why Rama Ekadashi is "Kartik Krishna" though the amanta month
 * is still Ashwin.
 */
const EKADASHI_NAMES: Record<string, { en: string; hi: string }> = {
  "Chaitra-krishna": { en: "Papmochani Ekadashi", hi: "पापमोचनी एकादशी" },
  "Chaitra-shukla": { en: "Kamada Ekadashi", hi: "कामदा एकादशी" },
  "Vaishakha-krishna": { en: "Varuthini Ekadashi", hi: "वरूथिनी एकादशी" },
  "Vaishakha-shukla": { en: "Mohini Ekadashi", hi: "मोहिनी एकादशी" },
  "Jyeshtha-krishna": { en: "Apara Ekadashi", hi: "अपरा एकादशी" },
  "Jyeshtha-shukla": { en: "Nirjala Ekadashi", hi: "निर्जला एकादशी" },
  "Ashadha-krishna": { en: "Yogini Ekadashi", hi: "योगिनी एकादशी" },
  "Ashadha-shukla": { en: "Devshayani Ekadashi", hi: "देवशयनी एकादशी" },
  "Shravana-krishna": { en: "Kamika Ekadashi", hi: "कामिका एकादशी" },
  "Shravana-shukla": { en: "Shravana Putrada Ekadashi", hi: "श्रावण पुत्रदा एकादशी" },
  "Bhadrapada-krishna": { en: "Aja Ekadashi", hi: "अजा एकादशी" },
  "Bhadrapada-shukla": { en: "Parivartini Ekadashi", hi: "परिवर्तिनी एकादशी" },
  "Ashwin-krishna": { en: "Indira Ekadashi", hi: "इंदिरा एकादशी" },
  "Ashwin-shukla": { en: "Papankusha Ekadashi", hi: "पापांकुशा एकादशी" },
  "Kartik-krishna": { en: "Rama Ekadashi", hi: "रमा एकादशी" },
  "Kartik-shukla": { en: "Devutthana Ekadashi", hi: "देवउठनी एकादशी" },
  "Margashirsha-krishna": { en: "Utpanna Ekadashi", hi: "उत्पन्ना एकादशी" },
  "Margashirsha-shukla": { en: "Mokshada Ekadashi", hi: "मोक्षदा एकादशी" },
  "Paush-krishna": { en: "Saphala Ekadashi", hi: "सफला एकादशी" },
  "Paush-shukla": { en: "Paush Putrada Ekadashi", hi: "पौष पुत्रदा एकादशी" },
  "Magha-krishna": { en: "Shattila Ekadashi", hi: "षटतिला एकादशी" },
  "Magha-shukla": { en: "Jaya Ekadashi", hi: "जया एकादशी" },
  "Phalguna-krishna": { en: "Vijaya Ekadashi", hi: "विजया एकादशी" },
  "Phalguna-shukla": { en: "Amalaki Ekadashi", hi: "आमलकी एकादशी" },
};

const MASA_HI: Record<string, string> = {
  Chaitra: "चैत्र",
  Vaishakha: "वैशाख",
  Jyeshtha: "ज्येष्ठ",
  Ashadha: "आषाढ़",
  Shravana: "श्रावण",
  Bhadrapada: "भाद्रपद",
  Ashwin: "आश्विन",
  Kartik: "कार्तिक",
  Margashirsha: "मार्गशीर्ष",
  Paush: "पौष",
  Magha: "माघ",
  Phalguna: "फाल्गुन",
};

const WEEKDAY_PRADOSH: Record<number, { en: string; hi: string }> = {
  0: { en: "Ravi Pradosh", hi: "रवि प्रदोष" },
  1: { en: "Som Pradosh", hi: "सोम प्रदोष" },
  2: { en: "Bhaum Pradosh", hi: "भौम प्रदोष" },
  3: { en: "Budh Pradosh", hi: "बुध प्रदोष" },
  4: { en: "Guru Pradosh", hi: "गुरु प्रदोष" },
  5: { en: "Shukra Pradosh", hi: "शुक्र प्रदोष" },
  6: { en: "Shani Pradosh", hi: "शनि प्रदोष" },
};

const OBSERVANCE_ART: Record<string, string> = {
  EKADASHI: "/images/festivals/ekadashi.svg",
  PURNIMA: "/images/festivals/purnima.svg",
  AMAVASYA: "/images/festivals/amavasya.svg",
  PRADOSH: "/images/festivals/pradosh.svg",
  SANKASHTI: "/images/festivals/sankashti.svg",
  VINAYAKA: "/images/festivals/sankashti.svg",
  SHIVRATRI: "/images/festivals/shivratri.svg",
};

/** Art keys that recurring observances share. */
export const OBSERVANCE_ART_KEYS = ["ekadashi", "purnima", "amavasya", "pradosh", "sankashti", "shivratri"];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Compute every Ekadashi, Purnima, Amavasya, Pradosh, Chaturthi and Masik
 * Shivratri between two dates using the tithi prevailing at sunrise. Consecutive
 * days carrying the same tithi are collapsed onto the first of them.
 */
export function generateRecurringObservances(from: string, to: string): FestivalSeed[] {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const start = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);

  const out: FestivalSeed[] = [];
  const seen = new Set<string>();
  let prevTithi = -1;

  for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const p = getPanchang(new Date(d));
    const idx = p.tithi.index; // 0..29
    const tn = idx % 15; // 0-based tithi within paksha
    const paksha = p.tithi.paksha;
    const masa = p.masa.purnimanta.en;
    const masaHi = MASA_HI[masa] ?? p.masa.purnimanta.hi;
    const key = dateKey(d);
    const sameAsYesterday = idx === prevTithi;
    prevTithi = idx;
    if (sameAsYesterday) continue;

    const push = (f: Omit<FestivalSeed, "imageUrl"> & { art: string }) => {
      if (seen.has(f.slug)) return;
      seen.add(f.slug);
      const { art, ...rest } = f;
      out.push({ ...rest, imageUrl: OBSERVANCE_ART[art] ?? OBSERVANCE_ART.EKADASHI });
    };

    if (tn === 10) {
      const name = EKADASHI_NAMES[`${masa}-${paksha}`] ?? { en: "Ekadashi", hi: "एकादशी" };
      push({
        slug: `ekadashi-${key}`,
        nameEn: name.en,
        nameHi: name.hi,
        type: "EKADASHI",
        date: key,
        endDate: null,
        deityEn: "Lord Vishnu",
        deityHi: "भगवान विष्णु",
        descriptionEn: `${name.en} falls in the ${paksha === "shukla" ? "bright" : "dark"} fortnight of ${masa}. Ekadashi is Vishnu's own tithi — grain is set aside for the day, tulsi is offered in every bhog and the fast is broken at the dwadashi parana.`,
        descriptionHi: `${name.hi} ${masaHi} मास के ${paksha === "shukla" ? "शुक्ल" : "कृष्ण"} पक्ष में आती है। एकादशी विष्णु की तिथि है — इस दिन अन्न त्याग होता है, प्रत्येक भोग में तुलसी दल अर्पित होता है और द्वादशी पारण पर व्रत खुलता है।`,
        significanceEn: "Fasting on ekadashi is said to burn accumulated karma and steady the mind; the merit is often sankalped to departed ancestors.",
        significanceHi: "एकादशी व्रत संचित कर्म का क्षय कर मन को स्थिर करता है; इसका पुण्य प्रायः दिवंगत पितरों को संकल्पित किया जाता है।",
        ritualsEn: [
          "No grain, no rice, no beans from sunrise",
          "Vishnu pooja with tulsi dal, sandal and yellow flowers",
          "Vishnu Sahasranam or Om Namo Bhagavate Vasudevaya japa",
          "Night jagran with Hari kirtan where possible",
          "Parana on dwadashi within the prescribed window",
        ],
        ritualsHi: [
          "सूर्योदय से अन्न, चावल एवं दाल का त्याग",
          "तुलसी दल, चंदन एवं पीत पुष्प से विष्णु पूजन",
          "विष्णु सहस्रनाम अथवा 'ॐ नमो भगवते वासुदेवाय' जप",
          "यथासंभव हरि कीर्तन सहित रात्रि जागरण",
          "द्वादशी को निर्धारित काल में पारण",
        ],
        major: false,
        remindDaysBefore: [1, 0],
        art: "EKADASHI",
      });
    }

    if (idx === 14) {
      push({
        slug: `purnima-${key}`,
        nameEn: `${masa} Purnima`,
        nameHi: `${masaHi} पूर्णिमा`,
        type: "PURNIMA",
        date: key,
        endDate: null,
        deityEn: "Lord Vishnu & Chandra Dev",
        deityHi: "भगवान विष्णु एवं चंद्र देव",
        descriptionEn: `The full moon of ${masa}. Purnima is kept for snan, daan and the Satyanarayan katha, and the moon is offered arghya of milk and water at moonrise.`,
        descriptionHi: `${masaHi} मास की पूर्णिमा। पूर्णिमा स्नान, दान एवं सत्यनारायण कथा के लिए रखी जाती है, और चंद्रोदय पर चंद्रमा को दूध-जल का अर्घ्य दिया जाता है।`,
        significanceEn: "Purnima strengthens a weak Moon in the horoscope and is the classical day for Satyanarayan pooja and for daan of white things.",
        significanceHi: "पूर्णिमा कुंडली में निर्बल चंद्र को बल देती है और सत्यनारायण पूजा तथा श्वेत वस्तुओं के दान का शास्त्रोक्त दिवस है।",
        ritualsEn: [
          "Snan at sunrise with Ganga jal mixed in the water",
          "Satyanarayan katha with panchamrit and sheera prasad",
          "Fast till moonrise, then arghya of milk to Chandra",
          "Daan of rice, milk, sugar, white cloth and silver",
          "Lamp under a peepal or at the tulsi at dusk",
        ],
        ritualsHi: [
          "जल में गंगाजल मिलाकर सूर्योदय स्नान",
          "पंचामृत एवं सिरा प्रसाद सहित सत्यनारायण कथा",
          "चंद्रोदय तक व्रत, फिर चंद्रमा को दुग्ध अर्घ्य",
          "चावल, दूध, शक्कर, श्वेत वस्त्र एवं रजत का दान",
          "संध्या को पीपल अथवा तुलसी के समक्ष दीप",
        ],
        major: false,
        remindDaysBefore: [1, 0],
        art: "PURNIMA",
      });
    }

    if (idx === 29) {
      push({
        slug: `amavasya-${key}`,
        nameEn: `${masa} Amavasya`,
        nameHi: `${masaHi} अमावस्या`,
        type: "AMAVASYA",
        date: key,
        endDate: null,
        deityEn: "Pitru Devta & Lord Shiva",
        deityHi: "पितृ देवता एवं भगवान शिव",
        descriptionEn: `The new moon of ${masa}. Amavasya belongs to the ancestors — tarpan of water and black sesame is offered facing south, and a lamp is lit under a peepal at dusk.`,
        descriptionHi: `${masaHi} मास की अमावस्या। अमावस्या पितरों की तिथि है — दक्षिणाभिमुख होकर जल एवं काले तिल से तर्पण दिया जाता है, और संध्या को पीपल के नीचे दीप जलाया जाता है।`,
        significanceEn: "Amavasya is the strongest monthly window for pitru tarpan, for shani shanti and for quiet japa. Saturday amavasya (Shani Amavasya) is especially powerful.",
        significanceHi: "अमावस्या पितृ तर्पण, शनि शांति एवं मौन जप हेतु मास का सर्वाधिक प्रबल अवसर है। शनिवार की अमावस्या (शनि अमावस्या) विशेष प्रभावी है।",
        ritualsEn: [
          "Til tarpan for ancestors facing south at sunrise",
          "Mustard-oil lamp under a peepal after sunset",
          "Feed a cow, a crow and a dog before eating",
          "Daan of black til, urad, iron and mustard oil",
          "Avoid new beginnings; keep the day for japa and daan",
        ],
        ritualsHi: [
          "सूर्योदय पर दक्षिणाभिमुख होकर तिल तर्पण",
          "सूर्यास्त के बाद पीपल के नीचे सरसों तेल का दीप",
          "भोजन से पूर्व गौ, काक एवं श्वान को ग्रास",
          "काले तिल, उड़द, लोहा एवं सरसों तेल का दान",
          "नए कार्य का आरंभ वर्जित; दिन जप एवं दान हेतु",
        ],
        major: false,
        remindDaysBefore: [1, 0],
        art: "AMAVASYA",
      });
    }

    if (tn === 12) {
      const w = WEEKDAY_PRADOSH[p.weekday.index];
      push({
        slug: `pradosh-${key}`,
        nameEn: `${w.en} Vrat`,
        nameHi: `${w.hi} व्रत`,
        type: "PRADOSH",
        date: key,
        endDate: null,
        deityEn: "Lord Shiva",
        deityHi: "भगवान शिव",
        descriptionEn: `Trayodashi of the ${paksha === "shukla" ? "bright" : "dark"} fortnight of ${masa}. In the pradosh hour — the ninety minutes around sunset — Shiva is said to dance on Kailash between Nandi's horns, and worship offered then reaches him at once.`,
        descriptionHi: `${masaHi} मास के ${paksha === "shukla" ? "शुक्ल" : "कृष्ण"} पक्ष की त्रयोदशी। प्रदोष काल में — सूर्यास्त के आसपास के डेढ़ घंटे में — शिव कैलाश पर नंदी के सींगों के बीच नृत्य करते हैं, और उस समय की गई पूजा तत्काल उन तक पहुँचती है।`,
        significanceEn: `${w.en} carries its own fruit — Som Pradosh for a wish, Bhaum for health and debt, Shani for progeny and Shani shanti. The vrat removes accumulated dosh and grants peace of mind.`,
        significanceHi: `${w.hi} का अपना विशेष फल है — सोम प्रदोष मनोकामना हेतु, भौम आरोग्य एवं ऋण मुक्ति हेतु, शनि संतान एवं शनि शांति हेतु। यह व्रत संचित दोष हरकर मानसिक शांति देता है।`,
        ritualsEn: [
          "Fast through the day; pooja in the pradosh kaal at sunset",
          "Jalabhishek of the shivling with milk, curd and Ganga jal",
          "Bel patra, white flowers, dhatura and akshat offered",
          "Pradosh Vrat katha and Shiv Chalisa or Rudrashtakam",
          "Break the fast after the evening aarti",
        ],
        ritualsHi: [
          "दिनभर व्रत; सूर्यास्त के प्रदोष काल में पूजन",
          "दूध, दही एवं गंगाजल से शिवलिंग का जलाभिषेक",
          "बेलपत्र, श्वेत पुष्प, धतूरा एवं अक्षत अर्पण",
          "प्रदोष व्रत कथा एवं शिव चालीसा अथवा रुद्राष्टकम",
          "संध्या आरती के पश्चात पारण",
        ],
        major: false,
        remindDaysBefore: [1, 0],
        art: "PRADOSH",
      });
    }

    if (tn === 3) {
      const isSankashti = paksha === "krishna";
      push({
        slug: `${isSankashti ? "sankashti" : "vinayaka"}-chaturthi-${key}`,
        nameEn: isSankashti ? "Sankashti Chaturthi" : "Vinayaka Chaturthi",
        nameHi: isSankashti ? "संकष्टी चतुर्थी" : "विनायक चतुर्थी",
        type: "VRAT",
        date: key,
        endDate: null,
        deityEn: "Lord Ganesha",
        deityHi: "भगवान श्रीगणेश",
        descriptionEn: isSankashti
          ? `Sankashti Chaturthi of ${masa}. The vrat is kept through the day and broken only after sighting the moon, when Ganesha is offered durva, modak and til laddu to take away the sankat — the crisis — that the devotee names.`
          : `Vinayaka Chaturthi of ${masa}. Kept in the bright fortnight, the fast is broken at madhyahna after Ganesh pooja with durva and modak, and is prescribed before starting anything new.`,
        descriptionHi: isSankashti
          ? `${masaHi} की संकष्टी चतुर्थी। दिनभर व्रत रहता है और चंद्र दर्शन के बाद ही पारण होता है, जब गणेश को दूर्वा, मोदक एवं तिल के लड्डू अर्पित कर उस संकट के निवारण की प्रार्थना की जाती है जिसका भक्त नाम लेता है।`
          : `${masaHi} की विनायक चतुर्थी। शुक्ल पक्ष में रखी जाने वाली यह चतुर्थी मध्याह्न में दूर्वा एवं मोदक सहित गणेश पूजन के बाद पारण की जाती है, और किसी भी नए कार्य के आरंभ से पूर्व विहित है।`,
        significanceEn: isSankashti
          ? "Sankashti is the monthly vrat for the removal of a specific obstacle — a stalled case, a stuck payment, an illness that will not lift."
          : "Vinayaka Chaturthi is kept for buddhi, siddhi and a clean start; Ganesha is invoked first in every ritual of the year.",
        significanceHi: isSankashti
          ? "संकष्टी किसी विशिष्ट बाधा के निवारण हेतु मासिक व्रत है — अटका मुकदमा, रुका भुगतान, न जाने वाला रोग।"
          : "विनायक चतुर्थी बुद्धि, सिद्धि एवं शुभ आरंभ हेतु रखी जाती है; वर्ष के प्रत्येक अनुष्ठान में गणेश का आवाहन सर्वप्रथम होता है।",
        ritualsEn: [
          "Ganesh pooja with 21 durva blades and red hibiscus",
          "Offer modak, til laddu and a coconut",
          "Sankatnashan Ganesh Stotra and Ganesh Atharvashirsha",
          isSankashti ? "Arghya to the moon before breaking the fast" : "Parana at madhyahna after aarti",
          "Feed a cow and donate green gram or jaggery",
        ],
        ritualsHi: [
          "21 दूर्वा दल एवं लाल गुड़हल से गणेश पूजन",
          "मोदक, तिल के लड्डू एवं नारियल का भोग",
          "संकटनाशन गणेश स्तोत्र एवं गणेश अथर्वशीर्ष",
          isSankashti ? "पारण से पूर्व चंद्रमा को अर्घ्य" : "आरती के पश्चात मध्याह्न में पारण",
          "गौ ग्रास एवं मूँग अथवा गुड़ का दान",
        ],
        major: false,
        remindDaysBefore: [1, 0],
        art: isSankashti ? "SANKASHTI" : "VINAYAKA",
      });
    }

    if (idx === 28) {
      push({
        slug: `masik-shivratri-${key}`,
        nameEn: "Masik Shivratri",
        nameHi: "मासिक शिवरात्रि",
        type: "VRAT",
        date: key,
        endDate: null,
        deityEn: "Lord Shiva",
        deityHi: "भगवान शिव",
        descriptionEn: `Krishna Chaturdashi of ${masa} — the monthly Shivratri. Each month carries a smaller echo of Maha Shivratri: a night vigil, abhishek of the lingam and the offering of bel patra in the nishita hour.`,
        descriptionHi: `${masaHi} की कृष्ण चतुर्दशी — मासिक शिवरात्रि। प्रत्येक मास महाशिवरात्रि की एक लघु प्रतिध्वनि लाता है: रात्रि जागरण, लिंग अभिषेक और निशीथ काल में बेलपत्र अर्पण।`,
        significanceEn: "The monthly vrat is kept by those who cannot fast the whole of Shravan, and by unmarried girls seeking a good husband.",
        significanceHi: "यह मासिक व्रत वे रखते हैं जो संपूर्ण श्रावण उपवास नहीं कर सकते, तथा सुयोग्य वर की कामना करने वाली कन्याएँ भी।",
        ritualsEn: [
          "Fast through the day, pooja in the nishita kaal at midnight",
          "Abhishek with milk, curd, honey, ghee and Ganga jal",
          "Bel patra, dhatura, aak flower and bhasma offered",
          "Om Namah Shivaya japa and Shiv Tandav Stotra",
          "Parana at sunrise after the morning aarti",
        ],
        ritualsHi: [
          "दिनभर व्रत, अर्धरात्रि के निशीथ काल में पूजन",
          "दूध, दही, मधु, घृत एवं गंगाजल से अभिषेक",
          "बेलपत्र, धतूरा, आक पुष्प एवं भस्म अर्पण",
          "'ॐ नमः शिवाय' जप एवं शिव तांडव स्तोत्र",
          "प्रातः आरती के पश्चात सूर्योदय पर पारण",
        ],
        major: false,
        remindDaysBefore: [1, 0],
        art: "SHIVRATRI",
      });
    }
  }

  return out;
}
