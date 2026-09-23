/**
 * Temples in the launch city, Bahadurgarh (Jhajjar district, Haryana).
 *
 * Sources (checked Sep 2026):
 * - ISKCON Bahadurgarh: address, deities, campus and festivals from templesinindiainfo.com,
 *   Tripadvisor and the Audiala city guide.
 * - Pracheen Shri Shyam Mandir (near Sarai Mod), the old Shiv Mandir in Line Par, Durga Mata
 *   Mandir and Hanuman Shiv Mandir: named in public listings and on the temples' own pages.
 * - Barahi village temples: OpenStreetMap, which gives their exact coordinates.
 *
 * Only what those sources support is written here. History and darshan timings are left empty
 * for the temple committees to supply (Admin → Temples); coordinates are empty where no reliable
 * source had them, and the map link then searches by the temple's name instead.
 */
import type { TempleSeed } from "./temples";

export const LOCAL_TEMPLES: TempleSeed[] = [
  {
    slug: "iskcon-bahadurgarh",
    nameEn: "ISKCON Bahadurgarh — Sri Sri Radha Madan Gopal Mandir",
    nameHi: "इस्कॉन बहादुरगढ़ — श्री श्री राधा मदन गोपाल मंदिर",
    deityEn: "Sri Sri Radha Madan Gopal (Krishna)",
    deityHi: "श्री श्री राधा मदन गोपाल (श्रीकृष्ण)",
    city: "Bahadurgarh",
    state: "Haryana",
    descriptionEn:
      "The ISKCON temple of Bahadurgarh stands on Nahara Nahari Road near Bamnoli Mod, Line Par, and is dedicated to Sri Sri Radha Madan Gopal. Lord Jagannath, Baladev and Subhadra are also worshipped here. The campus of about three acres has gardens, a guest house, a brahmachari ashram and a goshala. The day begins with mangala aarti at 4:30 am, and Janmashtami and Radhashtami are the biggest celebrations of the year.",
    descriptionHi:
      "बहादुरगढ़ का इस्कॉन मंदिर लाइन पार में बामनौली मोड़ के पास नाहरा-नाहरी रोड पर स्थित है और श्री श्री राधा मदन गोपाल को समर्पित है। यहाँ भगवान जगन्नाथ, बलदेव एवं सुभद्रा की भी पूजा होती है। लगभग तीन एकड़ के परिसर में उद्यान, अतिथि गृह, ब्रह्मचारी आश्रम और गौशाला हैं। दिन की शुरुआत प्रातः 4:30 बजे मंगला आरती से होती है, और जन्माष्टमी एवं राधाष्टमी वर्ष के सबसे बड़े उत्सव हैं।",
    historyEn: null,
    historyHi: null,
    timings: null,
    latitude: null,
    longitude: null,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "shri-shyam-mandir-bahadurgarh",
    nameEn: "Pracheen Shri Shyam Mandir",
    nameHi: "प्राचीन श्री श्याम मंदिर",
    deityEn: "Shri Khatu Shyam Ji",
    deityHi: "श्री खाटू श्याम जी",
    city: "Bahadurgarh",
    state: "Haryana",
    descriptionEn:
      "An old temple of Shri Shyam Baba near Sarai Mod in Bahadurgarh. Khatu Shyam Ji is worshipped as Barbarik, the grandson of Bhima, who offered his head to Shri Krishna before the Mahabharata war and was blessed to be worshipped by Krishna's own name, Shyam, in Kaliyug. Ekadashi is a special day for Shyam devotees, who offer a nishan (flag) and bhog to Baba.",
    descriptionHi:
      "बहादुरगढ़ में सराय मोड़ के पास स्थित श्री श्याम बाबा का प्राचीन मंदिर। खाटू श्याम जी की पूजा भीम के पौत्र बर्बरीक के रूप में होती है, जिन्होंने महाभारत युद्ध से पहले श्रीकृष्ण को अपना शीश दान किया और कलियुग में श्रीकृष्ण के ही नाम ‘श्याम’ से पूजे जाने का वरदान पाया। श्याम भक्तों के लिए एकादशी विशेष दिन है, जब बाबा को निशान और भोग अर्पित किया जाता है।",
    historyEn: null,
    historyHi: null,
    timings: null,
    latitude: null,
    longitude: null,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "pracheen-shiv-mandir-line-par",
    nameEn: "Pracheen Shiv Mandir, Line Par",
    nameHi: "प्राचीन शिव मंदिर, लाइन पार",
    deityEn: "Lord Shiva",
    deityHi: "भगवान शिव",
    city: "Bahadurgarh",
    state: "Haryana",
    descriptionEn:
      "An old Shiva temple in the Line Par area of Bahadurgarh. Mondays, and the whole month of Shravan, are the traditional times for Shiva worship, when devotees offer water, milk and bel patra on the Shivling and join the evening aarti.",
    descriptionHi:
      "बहादुरगढ़ के लाइन पार क्षेत्र में स्थित भगवान शिव का प्राचीन मंदिर। सोमवार और पूरा श्रावण मास शिव पूजा के पारंपरिक दिन हैं, जब भक्त शिवलिंग पर जल, दूध और बेलपत्र अर्पित करते हैं और संध्या आरती में शामिल होते हैं।",
    historyEn: null,
    historyHi: null,
    timings: null,
    latitude: null,
    longitude: null,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "durga-mata-mandir-bahadurgarh",
    nameEn: "Durga Mata Mandir",
    nameHi: "दुर्गा माता मंदिर",
    deityEn: "Maa Durga",
    deityHi: "माँ दुर्गा",
    city: "Bahadurgarh",
    state: "Haryana",
    descriptionEn:
      "A temple of Maa Durga in Bahadurgarh. The two Navratris, in Chaitra and Ashwin, are its most important festivals, and Tuesdays and Fridays are traditionally dedicated to the Devi, when devotees offer a chunari, shringar and bhog.",
    descriptionHi:
      "बहादुरगढ़ में माँ दुर्गा का मंदिर। चैत्र और आश्विन की दोनों नवरात्रि यहाँ के सबसे महत्वपूर्ण पर्व हैं, और मंगलवार व शुक्रवार पारंपरिक रूप से देवी को समर्पित हैं, जब भक्त चुनरी, श्रृंगार और भोग अर्पित करते हैं।",
    historyEn: null,
    historyHi: null,
    timings: null,
    latitude: null,
    longitude: null,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "hanuman-shiv-mandir-bahadurgarh",
    nameEn: "Hanuman Shiv Mandir",
    nameHi: "हनुमान शिव मंदिर",
    deityEn: "Hanuman Ji and Lord Shiva",
    deityHi: "हनुमान जी एवं भगवान शिव",
    city: "Bahadurgarh",
    state: "Haryana",
    descriptionEn:
      "A temple in Bahadurgarh where Hanuman Ji and Lord Shiva are worshipped together. Tuesdays and Saturdays are traditionally Hanuman Ji's days, for the Hanuman Chalisa, Sundarkand path and the offering of chola and sindoor; Mondays are for Shiva.",
    descriptionHi:
      "बहादुरगढ़ का मंदिर जहाँ हनुमान जी और भगवान शिव की एक साथ पूजा होती है। मंगलवार और शनिवार पारंपरिक रूप से हनुमान जी के दिन हैं, जब हनुमान चालीसा, सुंदरकांड पाठ और चोला-सिंदूर अर्पण होता है; सोमवार शिव जी का दिन है।",
    historyEn: null,
    historyHi: null,
    timings: null,
    latitude: null,
    longitude: null,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "shiv-mandir-tapovan-barahi",
    nameEn: "Shiv Mandir Tapovan, Barahi",
    nameHi: "शिव मंदिर तपोवन, बराही",
    deityEn: "Lord Shiva",
    deityHi: "भगवान शिव",
    city: "Bahadurgarh",
    state: "Haryana",
    descriptionEn: "A Shiva temple in Barahi village, north-west of Bahadurgarh (PIN 124525), with the village's Balaji and Mata temples a short walk away.",
    descriptionHi: "बहादुरगढ़ के उत्तर-पश्चिम में बराही गाँव (पिन 124525) का शिव मंदिर, जिसके पास ही गाँव के बालाजी और माता मंदिर हैं।",
    historyEn: null,
    historyHi: null,
    timings: null,
    latitude: 28.73805,
    longitude: 76.8929,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "balaji-mandir-barahi",
    nameEn: "Balaji Mandir (Akhada), Barahi",
    nameHi: "बालाजी मंदिर (अखाड़ा), बराही",
    deityEn: "Balaji (Hanuman Ji)",
    deityHi: "बालाजी (हनुमान जी)",
    city: "Bahadurgarh",
    state: "Haryana",
    descriptionEn: "The Balaji (Hanuman Ji) temple of Barahi village near Bahadurgarh, beside the village akhada. Tuesdays and Saturdays are Balaji's days.",
    descriptionHi: "बहादुरगढ़ के पास बराही गाँव का बालाजी (हनुमान जी) मंदिर, गाँव के अखाड़े के पास। मंगलवार और शनिवार बालाजी के दिन हैं।",
    historyEn: null,
    historyHi: null,
    timings: null,
    latitude: 28.73843,
    longitude: 76.89464,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "mata-mandir-barahi",
    nameEn: "Mata Mandir, Barahi",
    nameHi: "माता मंदिर, बराही",
    deityEn: "Mata Rani (the Devi)",
    deityHi: "माता रानी (देवी)",
    city: "Bahadurgarh",
    state: "Haryana",
    descriptionEn: "The Devi temple of Barahi village near Bahadurgarh, busiest during the two Navratris.",
    descriptionHi: "बहादुरगढ़ के पास बराही गाँव का देवी मंदिर, जहाँ दोनों नवरात्रि में सबसे अधिक भक्त आते हैं।",
    historyEn: null,
    historyHi: null,
    timings: null,
    latitude: 28.73796,
    longitude: 76.89591,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "dada-buda-mandir-barahi",
    nameEn: "Dada Buda Mandir, Barahi",
    nameHi: "दादा बूढ़ा मंदिर, बराही",
    deityEn: "Dada Buda (village deity)",
    deityHi: "दादा बूढ़ा (ग्राम देवता)",
    city: "Bahadurgarh",
    state: "Haryana",
    descriptionEn:
      "A shrine of Dada Buda near Barahi village. In Haryana's villages Dada Buda is revered as a protector of the village, and families come to him on happy occasions such as weddings and the birth of a child.",
    descriptionHi:
      "बराही गाँव के पास दादा बूढ़ा का स्थान। हरियाणा के गाँवों में दादा बूढ़ा को गाँव के रक्षक के रूप में पूजा जाता है, और परिवार विवाह व संतान जन्म जैसे शुभ अवसरों पर उनके दर्शन को आते हैं।",
    historyEn: null,
    historyHi: null,
    timings: null,
    latitude: 28.73213,
    longitude: 76.90224,
    liveDarshanUrl: null,
    featured: false,
  },
];
