/**
 * Temples the platform performs poojas and chadhava at.
 *
 * Latitude/longitude are the real shrine coordinates (used for the temple map and
 * for temple-local panchang). `liveDarshanUrl` is intentionally `null` for every
 * temple: the platform does not own or license any live feed, so an admin must paste
 * the official stream URL per temple from the admin console (Admin → Temples → Live
 * darshan URL). See docs/IMAGES.md.
 */

export type TempleSeed = {
  slug: string;
  nameEn: string;
  nameHi: string;
  deityEn: string;
  deityHi: string;
  city: string;
  state: string;
  descriptionEn: string;
  descriptionHi: string;
  historyEn: string | null;
  historyHi: string | null;
  timings: string | null;
  latitude: number | null;
  longitude: number | null;
  liveDarshanUrl: string | null;
  featured: boolean;
};

import { LOCAL_TEMPLES } from "./local-temples";

const NATIONAL_TEMPLES: TempleSeed[] = [
  {
    slug: "kashi-vishwanath",
    nameEn: "Kashi Vishwanath Temple",
    nameHi: "काशी विश्वनाथ मंदिर",
    deityEn: "Lord Shiva",
    deityHi: "भगवान शिव",
    city: "Varanasi",
    state: "Uttar Pradesh",
    descriptionEn:
      "Kashi Vishwanath stands on the western bank of the Ganga in the oldest living city on earth, enshrining one of the twelve Jyotirlingas. Devotees believe that Lord Shiva himself whispers the taraka mantra into the ear of anyone who leaves this body in Kashi. The golden spire above the sanctum, gifted by Maharani Ahilyabai Holkar's successors, is visible from the ghats at first light. Rudrabhishek performed here with Ganga jal is held to be among the most fruitful of all Shiva worship.",
    descriptionHi:
      "काशी विश्वनाथ पृथ्वी की सबसे प्राचीन जीवित नगरी में गंगा के पश्चिमी तट पर स्थित है और यहाँ बारह ज्योतिर्लिंगों में से एक विराजमान हैं। मान्यता है कि काशी में देह त्यागने वाले के कान में स्वयं महादेव तारक मंत्र सुनाते हैं। गर्भगृह के ऊपर का स्वर्ण शिखर प्रातःकाल घाटों से दमकता दिखाई देता है। यहाँ गंगाजल से किया गया रुद्राभिषेक समस्त शिव उपासना में सर्वाधिक फलदायी माना जाता है।",
    historyEn:
      "The shrine is referenced in the Skanda Purana and has been rebuilt several times, most notably by Rani Ahilyabai Holkar of Indore in 1780. Maharaja Ranjit Singh donated the gold that plates the two shikharas in 1835. The surrounding Vishwanath Dham corridor, opened in 2021, reconnected the temple to the Ganga ghats.",
    historyHi:
      "इस मंदिर का उल्लेख स्कंद पुराण में मिलता है और इसका कई बार पुनर्निर्माण हुआ, जिनमें सबसे प्रसिद्ध 1780 में इंदौर की रानी अहिल्याबाई होल्कर द्वारा कराया गया निर्माण है। 1835 में महाराजा रणजीत सिंह ने दोनों शिखरों पर चढ़े स्वर्ण का दान किया। 2021 में खुले विश्वनाथ धाम कॉरिडोर ने मंदिर को पुनः गंगा घाटों से जोड़ दिया।",
    timings: "03:00-11:00, 12:00-19:00, 20:30-23:00",
    latitude: 25.3109,
    longitude: 83.0107,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "mahakaleshwar",
    nameEn: "Mahakaleshwar Jyotirlinga",
    nameHi: "महाकालेश्वर ज्योतिर्लिंग",
    deityEn: "Lord Mahakal (Shiva)",
    deityHi: "भगवान महाकाल (शिव)",
    city: "Ujjain",
    state: "Madhya Pradesh",
    descriptionEn:
      "Mahakaleshwar is the only Jyotirlinga that faces south, which is why it is called Dakshinamukhi and revered as the lord of time and death itself. The Bhasma Aarti performed before dawn, in which the lingam is bathed in sacred ash, is unique to this temple in all of Bharat. Ujjain is the navel of the earth in traditional cosmology and the point from which Hindu time-keeping was once measured. A Mahamrityunjaya jaap offered at Mahakal is the classical remedy prescribed for grave illness and untimely fear.",
    descriptionHi:
      "महाकालेश्वर एकमात्र दक्षिणमुखी ज्योतिर्लिंग है, इसीलिए इन्हें दक्षिणामुखी कहा जाता है और काल एवं मृत्यु के स्वामी के रूप में पूजा जाता है। ब्रह्म मुहूर्त में होने वाली भस्म आरती, जिसमें लिंग को पवित्र भस्म से स्नान कराया जाता है, समस्त भारत में केवल यहीं होती है। पारंपरिक भूगोल में उज्जैन को पृथ्वी की नाभि कहा गया है और यहीं से कभी काल गणना होती थी। महाकाल के सान्निध्य में किया गया महामृत्युंजय जाप गंभीर रोग एवं अकाल भय का शास्त्रोक्त उपाय माना गया है।",
    historyEn:
      "The temple finds mention in the Puranas and in Kalidasa's Meghaduta, which describes the evening aarti at Mahakal. It was destroyed by Iltutmish in 1234 CE and rebuilt in its present form by the Maratha general Ranoji Shinde in the 18th century. The Mahakal Lok corridor was inaugurated in 2022.",
    historyHi:
      "मंदिर का उल्लेख पुराणों तथा कालिदास के मेघदूत में मिलता है, जिसमें महाकाल की संध्या आरती का वर्णन है। 1234 ई. में इल्तुतमिश ने इसे ध्वस्त किया और 18वीं शताब्दी में मराठा सेनापति राणोजी शिंदे ने वर्तमान स्वरूप में इसका पुनर्निर्माण कराया। महाकाल लोक कॉरिडोर का लोकार्पण 2022 में हुआ।",
    timings: "03:00-23:00 (Bhasma Aarti 04:00)",
    latitude: 23.1828,
    longitude: 75.7681,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "kaal-bhairav-ujjain",
    nameEn: "Kaal Bhairav Temple",
    nameHi: "काल भैरव मंदिर",
    deityEn: "Kaal Bhairav",
    deityHi: "काल भैरव",
    city: "Ujjain",
    state: "Madhya Pradesh",
    descriptionEn:
      "Kaal Bhairav is the kotwal, the guardian magistrate of Ujjain, and no pilgrimage to Mahakal is considered complete without his darshan. The deity is famously offered liquor, which visibly disappears from the shallow dish held to his lips — a phenomenon witnessed by devotees every single day. Bhairav upasana is the traditional recourse for those troubled by enemies, court cases, black magic and sudden obstacles. The temple sits beside the Shipra on the ancient Bhairavgarh mound.",
    descriptionHi:
      "काल भैरव उज्जयिनी के कोतवाल हैं और महाकाल की यात्रा उनके दर्शन के बिना पूर्ण नहीं मानी जाती। यहाँ भगवान को मदिरा का भोग लगाया जाता है, जो उनके होंठों से लगी उथली तश्तरी से प्रत्यक्ष रूप से लुप्त हो जाती है — इसे श्रद्धालु प्रतिदिन देखते हैं। शत्रु बाधा, न्यायालयीन प्रकरण, अभिचार एवं आकस्मिक विघ्नों से पीड़ित जनों के लिए भैरव उपासना पारंपरिक उपाय है। मंदिर शिप्रा तट पर प्राचीन भैरवगढ़ टीले पर स्थित है।",
    historyEn:
      "The present structure dates to the Maratha period but rests on a far older Kapalika shrine described in the Skanda Purana's Avanti Khanda. Fragments of Paramara-era sculpture and painted Malwa murals survive within the mandapa. Sindhia rulers of Gwalior endowed the temple's daily rituals.",
    historyHi:
      "वर्तमान संरचना मराठा काल की है, किंतु यह स्कंद पुराण के अवंति खंड में वर्णित उससे कहीं प्राचीन कापालिक स्थल पर बनी है। मंडप में परमार कालीन शिल्प एवं मालवा शैली के भित्ति चित्रों के अवशेष आज भी विद्यमान हैं। ग्वालियर के सिंधिया शासकों ने मंदिर की नित्य पूजा के लिए व्यवस्था दी थी।",
    timings: "05:00-13:00, 15:00-21:00",
    latitude: 23.2064,
    longitude: 75.7614,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "mangalnath",
    nameEn: "Mangalnath Temple",
    nameHi: "मंगलनाथ मंदिर",
    deityEn: "Mangal (Mars) as Shiva",
    deityHi: "मंगल देव (शिव रूप)",
    city: "Ujjain",
    state: "Madhya Pradesh",
    descriptionEn:
      "Mangalnath is held in the Matsya Purana to be the birthplace of the planet Mangal (Mars), which makes it the definitive place on earth for Mangal Dosh and Manglik remedies. Bhaat pooja performed here on a Tuesday is the classical prescription for delayed marriage, marital discord and blood-related ailments. The temple crowns a bluff above the Shipra where Ujjain's ancient observatory once tracked the Tropic of Cancer. Red cloth, masoor dal and red flowers are the offerings that please Mangal.",
    descriptionHi:
      "मत्स्य पुराण के अनुसार मंगलनाथ मंगल ग्रह की जन्मस्थली है, इसीलिए मांगलिक दोष एवं मंगल दोष के निवारण हेतु पृथ्वी पर यह सर्वश्रेष्ठ स्थान माना गया है। मंगलवार को यहाँ की गई भात पूजा विवाह में विलंब, दांपत्य कलह एवं रक्त संबंधी रोगों का शास्त्रोक्त उपाय है। मंदिर शिप्रा के ऊपर उस टीले पर है जहाँ प्राचीन उज्जयिनी वेधशाला कर्क रेखा का अवलोकन करती थी। लाल वस्त्र, मसूर दाल एवं लाल पुष्प मंगल देव को प्रिय हैं।",
    historyEn:
      "Ujjain's role as the prime meridian of Indian astronomy made Mangalnath a natural centre for graha shanti. The current temple was restored during the Sindhia period after centuries of neglect. Its terrace still commands the view used by Jai Singh II's astronomers at the nearby Vedh Shala.",
    historyHi:
      "भारतीय खगोल शास्त्र में उज्जैन के मध्य रेखा होने के कारण मंगलनाथ स्वाभाविक रूप से ग्रह शांति का केंद्र बना। शताब्दियों की उपेक्षा के बाद सिंधिया काल में वर्तमान मंदिर का जीर्णोद्धार हुआ। इसकी छत से वही दृश्य दिखता है जिसका उपयोग निकटवर्ती वेधशाला में सवाई जयसिंह के खगोलज्ञ करते थे।",
    timings: "05:30-12:30, 16:00-21:00",
    latitude: 23.2003,
    longitude: 75.748,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "trimbakeshwar",
    nameEn: "Trimbakeshwar Jyotirlinga",
    nameHi: "त्र्यंबकेश्वर ज्योतिर्लिंग",
    deityEn: "Lord Shiva (Trimbakeshwar)",
    deityHi: "भगवान त्र्यंबकेश्वर",
    city: "Nashik",
    state: "Maharashtra",
    descriptionEn:
      "At the foot of Brahmagiri hill, where the Godavari rises, Trimbakeshwar enshrines a Jyotirlinga with three tiny faces representing Brahma, Vishnu and Mahesh. It is the only place in India authorised by tradition to perform the complete Kaal Sarp Dosh Nivaran and Narayan Nagbali rites. Pilgrims first bathe at Kushavarta Kund, the sacred tank from which the Godavari formally emerges. The temple's black basalt spire, raised by Peshwa Balaji Bajirao, is one of the finest examples of Nagara work in the Deccan.",
    descriptionHi:
      "ब्रह्मगिरि पर्वत की तलहटी में, जहाँ गोदावरी का उद्गम है, त्र्यंबकेश्वर में वह ज्योतिर्लिंग विराजमान है जिसमें ब्रह्मा, विष्णु एवं महेश के तीन सूक्ष्म मुख दिखाई देते हैं। सम्पूर्ण काल सर्प दोष निवारण तथा नारायण नागबलि विधि हेतु परंपरा से अधिकृत यह भारत का एकमात्र स्थान है। श्रद्धालु सर्वप्रथम कुशावर्त कुंड में स्नान करते हैं, जहाँ से गोदावरी विधिवत प्रकट होती हैं। पेशवा बालाजी बाजीराव द्वारा निर्मित काले बेसाल्ट का शिखर दक्कन की श्रेष्ठतम नागर शैली में गिना जाता है।",
    historyEn:
      "Peshwa Balaji Bajirao rebuilt the temple between 1755 and 1786 at a cost recorded in the Peshwa daftar. The Nashik Kumbh Mela's shahi snan procession begins from Trimbakeshwar every twelve years. The linga's silver crown, the Trimbak Raja mukut, is said to contain a diamond from the Peshwa treasury.",
    historyHi:
      "पेशवा बालाजी बाजीराव ने 1755 से 1786 के बीच मंदिर का पुनर्निर्माण कराया, जिसका व्यय पेशवा दफ्तर में अंकित है। प्रत्येक बारह वर्ष में नासिक कुंभ की शाही स्नान यात्रा त्र्यंबकेश्वर से ही आरंभ होती है। लिंग के रजत मुकुट, त्र्यंबक राजा मुकुट, में पेशवा कोष का एक हीरा जड़ा बताया जाता है।",
    timings: "05:30-21:00",
    latitude: 19.9327,
    longitude: 73.53,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "somnath",
    nameEn: "Somnath Jyotirlinga",
    nameHi: "सोमनाथ ज्योतिर्लिंग",
    deityEn: "Lord Somnath (Shiva)",
    deityHi: "भगवान सोमनाथ (शिव)",
    city: "Prabhas Patan",
    state: "Gujarat",
    descriptionEn:
      "Somnath is the first among the twelve Jyotirlingas and stands on the Arabian Sea shore where the Hiran, Kapila and Saraswati rivers meet the ocean. The Moon god Soma is said to have installed the linga here to be freed from Daksha's curse, which is why the shrine grants relief from chandra dosh and mental unrest. An arrow pillar on the temple's sea wall declares that there is no land between this point and Antarctica. The evening aarti with the surf breaking below is among the most stirring sights in Saurashtra.",
    descriptionHi:
      "सोमनाथ बारह ज्योतिर्लिंगों में प्रथम हैं और अरब सागर के उस तट पर विराजते हैं जहाँ हिरण, कपिला एवं सरस्वती नदियाँ सागर से मिलती हैं। कहा जाता है कि दक्ष के शाप से मुक्ति हेतु चंद्रदेव सोम ने यहाँ लिंग की स्थापना की, इसी से यह स्थान चंद्र दोष एवं मानसिक अशांति से मुक्ति देता है। मंदिर की सागर दीवार पर लगा बाण स्तंभ घोषित करता है कि यहाँ से अंटार्कटिका तक कोई भूखंड नहीं है। नीचे टकराती लहरों के बीच होने वाली संध्या आरती सौराष्ट्र के सबसे भावपूर्ण दृश्यों में है।",
    historyEn:
      "The shrine was plundered and rebuilt at least six times, the most infamous raid being that of Mahmud of Ghazni in 1026 CE. The present temple in Chaulukya style was completed in 1951 at the initiative of Sardar Vallabhbhai Patel, with the linga installed by President Rajendra Prasad. Its shikhara rises 155 feet above the shore.",
    historyHi:
      "मंदिर कम से कम छह बार लूटा और पुनर्निर्मित हुआ, जिनमें 1026 ई. में महमूद गजनवी का आक्रमण सर्वाधिक कुख्यात है। चालुक्य शैली का वर्तमान मंदिर सरदार वल्लभभाई पटेल की प्रेरणा से 1951 में पूर्ण हुआ और राष्ट्रपति राजेंद्र प्रसाद ने लिंग की प्रतिष्ठा की। इसका शिखर तट से 155 फुट ऊँचा है।",
    timings: "06:00-21:00 (Aarti 07:00, 12:00, 19:00)",
    latitude: 20.888,
    longitude: 70.4011,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "siddhivinayak",
    nameEn: "Shree Siddhivinayak Temple",
    nameHi: "श्री सिद्धिविनायक मंदिर",
    deityEn: "Lord Ganesha",
    deityHi: "भगवान गणेश",
    city: "Mumbai",
    state: "Maharashtra",
    descriptionEn:
      "Siddhivinayak at Prabhadevi is the most visited Ganesha shrine in the country, drawing lakhs every Tuesday for the Angarki and Sankashti darshan. The murti is carved from a single black stone with the trunk turned to the right, the rare and powerful siddha-peeth form. Devotees walk the pradakshina marg twenty-one times while offering durva grass and modaks. Mumbai's traders, students and film industry alike begin new ventures only after a Siddhivinayak sankalp.",
    descriptionHi:
      "प्रभादेवी स्थित सिद्धिविनायक देश का सर्वाधिक दर्शनीय गणेश मंदिर है, जहाँ प्रत्येक मंगलवार अंगारकी एवं संकष्टी दर्शन हेतु लाखों श्रद्धालु आते हैं। मूर्ति एक ही काले पाषाण से बनी है और सूँड दाहिनी ओर मुड़ी है — यही दुर्लभ एवं शक्तिशाली सिद्धपीठ स्वरूप है। भक्त दूर्वा एवं मोदक अर्पित करते हुए प्रदक्षिणा मार्ग की इक्कीस परिक्रमा करते हैं। मुंबई के व्यापारी, विद्यार्थी और फिल्म जगत सभी नया कार्य सिद्धिविनायक के संकल्प के बाद ही आरंभ करते हैं।",
    historyEn:
      "The original small structure was built in 1801 by Laxman Vithu and Deubai Patil, a childless couple who wished that no other woman remain without children. The temple was greatly expanded in 1990 into the six-storey shikhara seen today. Its gold-plated dome and inner sanctum doors depicting the ashtavinayak were added in the 1990s.",
    historyHi:
      "मूल छोटा मंदिर 1801 में लक्ष्मण विठू एवं देउबाई पाटील नामक निःसंतान दंपति ने इस कामना से बनवाया था कि कोई अन्य स्त्री संतानहीन न रहे। 1990 में मंदिर का व्यापक विस्तार कर आज दिखने वाला छह मंजिला शिखर बनाया गया। स्वर्ण मंडित गुंबद एवं अष्टविनायक अंकित गर्भगृह द्वार 1990 के दशक में जोड़े गए।",
    timings: "05:30-21:50 (Tue 03:15-22:00)",
    latitude: 19.0169,
    longitude: 72.8302,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "shirdi-sai",
    nameEn: "Shri Saibaba Samadhi Mandir",
    nameHi: "श्री साईबाबा समाधि मंदिर",
    deityEn: "Sai Baba of Shirdi",
    deityHi: "शिरडी के साईं बाबा",
    city: "Shirdi",
    state: "Maharashtra",
    descriptionEn:
      "Shirdi is where the fakir who taught Sabka Malik Ek lived, begged, healed and finally took samadhi in 1918. The white marble murti above the samadhi, sculpted by Balaji Vasant Talim, is dressed afresh for each of the day's four aartis. Devotees still take udi, the sacred ash from the Dhuni that Baba lit and that has never been allowed to go out. Thursday is Baba's day, when the palki procession circles the village after Shej aarti.",
    descriptionHi:
      "शिरडी वह स्थान है जहाँ 'सबका मालिक एक' का उपदेश देने वाले फकीर ने निवास किया, भिक्षा माँगी, रोगियों को स्वस्थ किया और 1918 में समाधि ली। समाधि के ऊपर बालाजी वसंत तालीम द्वारा गढ़ी श्वेत संगमरमर की मूर्ति दिन की चारों आरतियों के लिए नए वस्त्र धारण करती है। भक्त आज भी उस धूनी की पवित्र ऊदी लेते हैं जिसे बाबा ने प्रज्वलित किया था और जो कभी बुझने नहीं दी गई। गुरुवार बाबा का दिन है, जब शेज आरती के पश्चात पालकी गाँव की परिक्रमा करती है।",
    historyEn:
      "Sai Baba arrived in Shirdi around 1858 and lived in the dilapidated Dwarkamai mosque for six decades. The samadhi mandir was originally a wada built by the Nagpur millionaire Gopalrao Buti, and Baba asked to be laid to rest there. The Shri Saibaba Sansthan Trust, formed in 1922, now runs the temple, prasadalaya and hospitals.",
    historyHi:
      "साईं बाबा लगभग 1858 में शिरडी आए और छह दशक तक जीर्ण द्वारकामाई मस्जिद में रहे। समाधि मंदिर मूलतः नागपुर के धनाढ्य गोपालराव बूटी द्वारा बनवाया वाडा था और बाबा ने वहीं विश्राम की इच्छा प्रकट की थी। 1922 में गठित श्री साईबाबा संस्थान ट्रस्ट आज मंदिर, प्रसादालय एवं चिकित्सालय संचालित करता है।",
    timings: "04:00-23:15 (Kakad Aarti 04:30, Shej Aarti 22:30)",
    latitude: 19.7663,
    longitude: 74.4764,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "banke-bihari",
    nameEn: "Shri Banke Bihari Temple",
    nameHi: "श्री बांके बिहारी मंदिर",
    deityEn: "Lord Krishna (Banke Bihari)",
    deityHi: "श्री बांके बिहारी जी",
    city: "Vrindavan",
    state: "Uttar Pradesh",
    descriptionEn:
      "Banke Bihari is the presiding heart of Vrindavan, a self-manifested murti in tribhanga pose that Swami Haridas received from Nidhivan. The curtain before the sanctum is drawn every few minutes because the gaze of Bihariji is said to be so captivating that a devotee could lose all worldly awareness. No bell or conch is sounded here — Thakurji is treated as a beloved child who must not be startled. Chappan bhog, gopi chandan and peda are the offerings closest to him.",
    descriptionHi:
      "बांके बिहारी वृंदावन के प्राण हैं — निधिवन में स्वामी हरिदास को प्राप्त त्रिभंग मुद्रा की स्वयं प्रकट मूर्ति। गर्भगृह के आगे का पर्दा हर कुछ क्षण में गिराया जाता है, क्योंकि कहा जाता है कि बिहारी जी की दृष्टि इतनी मोहक है कि भक्त की सुध-बुध ही खो जाए। यहाँ न घंटा बजता है न शंख — ठाकुर जी को प्रिय बालक माना जाता है जिन्हें चौंकाना नहीं चाहिए। छप्पन भोग, गोपी चंदन एवं पेड़ा उन्हें सर्वाधिक प्रिय हैं।",
    historyEn:
      "Swami Haridas, guru of Tansen, is said to have brought the murti forth in Nidhivan in the 16th century. The present temple in Rajasthani style was completed in 1864 by the Goswami family who still serve as sevayats. Its only public shringar of the deity's feet happens once a year on Akshaya Tritiya.",
    historyHi:
      "तानसेन के गुरु स्वामी हरिदास ने 16वीं शताब्दी में निधिवन में इस विग्रह को प्रकट किया, ऐसी मान्यता है। राजस्थानी शैली का वर्तमान मंदिर 1864 में उन गोस्वामी परिवार द्वारा पूर्ण हुआ जो आज भी सेवायत हैं। ठाकुर जी के चरण दर्शन वर्ष में केवल एक बार अक्षय तृतीया पर होते हैं।",
    timings: "07:45-12:00, 17:30-21:30 (winter), 08:45-12:00, 18:30-22:00 (summer)",
    latitude: 27.5766,
    longitude: 77.6994,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "khatu-shyam",
    nameEn: "Khatu Shyam Ji Temple",
    nameHi: "खाटू श्याम जी मंदिर",
    deityEn: "Khatu Shyam (Barbarik)",
    deityHi: "खाटू श्याम जी (बर्बरीक)",
    city: "Khatu, Sikar",
    state: "Rajasthan",
    descriptionEn:
      "Khatu Shyam is Barbarik, the grandson of Bhima, whose severed head watched the entire Mahabharata war and to whom Krishna granted his own name and the boon of being worshipped in Kaliyuga. Devotees call him Haare ka Sahara, the refuge of the defeated, and come with nishan flags carried on foot from Ringas. The Phalgun Mela draws millions who sing Shyam bhajans through the night. Itra, kesar and blue-purple flowers are the beloved offerings.",
    descriptionHi:
      "खाटू श्याम भीम के पौत्र बर्बरीक हैं, जिनके कटे शीश ने सम्पूर्ण महाभारत युद्ध देखा और जिन्हें श्रीकृष्ण ने अपना नाम तथा कलियुग में पूजित होने का वरदान दिया। भक्त उन्हें 'हारे का सहारा' कहते हैं और रींगस से पैदल निशान ध्वज लेकर आते हैं। फाल्गुन मेले में लाखों श्रद्धालु रातभर श्याम भजन गाते हैं। इत्र, केसर एवं नीले-बैंगनी पुष्प उन्हें अत्यंत प्रिय हैं।",
    historyEn:
      "The head is believed to have been discovered buried at Khatu and installed after a cow was seen spontaneously offering milk at the spot. The temple was rebuilt in 1720 by Diwan Abhay Singh on the order of Marwar ruler Maharaja Ajit Singh. The present marble sanctum with its silver gateway dates from the twentieth century.",
    historyHi:
      "मान्यता है कि शीश खाटू में भूमिगत मिला और वहाँ एक गाय द्वारा स्वतः दुग्ध अर्पित करते देखे जाने के बाद उसकी स्थापना हुई। मारवाड़ नरेश महाराजा अजीत सिंह के आदेश पर दीवान अभय सिंह ने 1720 में मंदिर का पुनर्निर्माण कराया। रजत द्वार युक्त वर्तमान संगमरमर गर्भगृह बीसवीं शताब्दी का है।",
    timings: "04:30-13:00, 16:00-22:00",
    latitude: 27.6236,
    longitude: 75.4022,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "salasar-balaji",
    nameEn: "Salasar Balaji Temple",
    nameHi: "सालासर बालाजी मंदिर",
    deityEn: "Hanuman (Salasar Balaji)",
    deityHi: "श्री सालासर बालाजी (हनुमान)",
    city: "Salasar, Churu",
    state: "Rajasthan",
    descriptionEn:
      "Salasar Balaji is the rare Hanuman who appears with a beard and moustache, a form that emerged from the ground before a Jat farmer of Asota in 1754. Devotees tie a coconut wrapped in red thread to the temple's jaali as a written vow, returning to untie it when the wish is granted. Churma made of ghee, wheat and gur is the accepted bhog and is distributed all day. Saturdays, Tuesdays and the Chaitra and Ashwin Purnima melas fill the town completely.",
    descriptionHi:
      "सालासर बालाजी वह दुर्लभ हनुमान स्वरूप हैं जो दाढ़ी-मूँछ सहित प्रकट होते हैं; यह विग्रह 1754 में आसोटा के एक जाट किसान को भूमि से प्राप्त हुआ था। भक्त लाल धागे में लिपटा नारियल मंदिर की जाली पर बाँधकर मनौती करते हैं और मनोकामना पूर्ण होने पर उसे खोलने लौटते हैं। घी, गेहूँ एवं गुड़ का चूरमा यहाँ का स्वीकृत भोग है जो दिनभर वितरित होता है। शनिवार, मंगलवार तथा चैत्र एवं आश्विन पूर्णिमा के मेलों में पूरा कस्बा भर जाता है।",
    historyEn:
      "The murti was unearthed at Asota village and, following a dream instruction, brought by bullock cart to Salasar where the cart halted on its own. Thakur Salam Singh of Sikar granted the land, and Muslim artisans Noora and Dau built the original shrine, a fact still honoured by the trust. The sanctum was later plated in silver and gold by devotee families of Rajasthan and Gujarat.",
    historyHi:
      "विग्रह आसोटा गाँव में भूमि से निकला और स्वप्नादेश के अनुसार बैलगाड़ी से सालासर लाया गया, जहाँ गाड़ी स्वयं रुक गई। सीकर के ठाकुर सालम सिंह ने भूमि दी तथा मुस्लिम कारीगर नूरा एवं दाऊ ने मूल मंदिर बनाया — इस तथ्य का ट्रस्ट आज भी सम्मान करता है। बाद में राजस्थान एवं गुजरात के भक्त परिवारों ने गर्भगृह पर रजत एवं स्वर्ण मंडन कराया।",
    timings: "04:00-22:00",
    latitude: 27.7178,
    longitude: 74.7186,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "mehandipur-balaji",
    nameEn: "Shri Mehandipur Balaji",
    nameHi: "श्री मेहंदीपुर बालाजी",
    deityEn: "Hanuman (Balaji)",
    deityHi: "श्री बालाजी (हनुमान)",
    city: "Mehandipur, Dausa",
    state: "Rajasthan",
    descriptionEn:
      "Mehandipur Balaji is the foremost centre in India for relief from pret badha, upari hawa and black magic, where three deities — Balaji, Pretraj Sarkar and Bhairav — preside together. The self-manifested Hanuman image on the rock face has a stream of water that has flowed continuously from its chest for centuries. Sawamani, an offering of laddoos weighed against the devotee's vow, is the traditional thanksgiving here. Arzi with roti and boondi laddoo is offered before any request is placed.",
    descriptionHi:
      "मेहंदीपुर बालाजी प्रेत बाधा, ऊपरी हवा एवं अभिचार से मुक्ति हेतु भारत का प्रमुख केंद्र है, जहाँ तीन देव — बालाजी, प्रेतराज सरकार एवं भैरव — एक साथ विराजते हैं। चट्टान पर स्वयं प्रकट हनुमान विग्रह के वक्षस्थल से शताब्दियों से निरंतर जलधारा बहती है। सवामणी, अर्थात भक्त की मनौती के भार बराबर लड्डू का अर्पण, यहाँ की पारंपरिक कृतज्ञता है। कोई भी प्रार्थना रखने से पूर्व रोटी एवं बूँदी लड्डू की अर्जी लगाई जाती है।",
    historyEn:
      "The shrine's recorded worship begins about a thousand years ago in the Aravalli foothills of the Dausa district. The lineage of mahants traces to Shri Ganeshpuri, whose descendants still conduct the darkhast rituals. Unlike most temples, no prasad from here is carried home and devotees are asked not to look back when leaving.",
    historyHi:
      "दौसा जिले की अरावली तलहटी में इस स्थान की पूजा का लिखित उल्लेख लगभग एक सहस्र वर्ष पुराना है। महंत परंपरा श्री गणेशपुरी से जुड़ी है, जिनके वंशज आज भी दरख्वास्त विधि कराते हैं। अन्य मंदिरों के विपरीत यहाँ का प्रसाद घर नहीं ले जाया जाता और लौटते समय पीछे मुड़कर देखने की मनाही है।",
    timings: "06:00-20:00",
    latitude: 26.9962,
    longitude: 76.7752,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "kamakhya",
    nameEn: "Maa Kamakhya Devalaya",
    nameHi: "माँ कामाख्या देवालय",
    deityEn: "Maa Kamakhya (Shakti)",
    deityHi: "माँ कामाख्या (शक्ति)",
    city: "Guwahati",
    state: "Assam",
    descriptionEn:
      "On Nilachal hill above the Brahmaputra stands Kamakhya, the most powerful of the fifty-one Shakti Peethas, where the yoni of Sati is said to have fallen. There is no image in the sanctum — devotees worship a natural cleft in the rock kept moist by an underground spring. The Ambubachi Mela each June marks the Devi's annual cycle, when the temple closes for three days and reopens to enormous crowds. Kamakhya is the classical seat for Dus Mahavidya sadhana and for Durga Saptashati path.",
    descriptionHi:
      "ब्रह्मपुत्र के ऊपर नीलाचल पर्वत पर कामाख्या विराजती हैं — इक्यावन शक्तिपीठों में सर्वाधिक प्रबल, जहाँ सती की योनि गिरी मानी जाती है। गर्भगृह में कोई प्रतिमा नहीं है; भक्त उस प्राकृतिक शिला-दरार की उपासना करते हैं जिसे भूमिगत जलस्रोत सदा आर्द्र रखता है। प्रतिवर्ष जून में अंबुबाची मेला देवी के वार्षिक चक्र का प्रतीक है, जब मंदिर तीन दिन बंद रहकर विशाल जनसमूह के लिए पुनः खुलता है। कामाख्या दस महाविद्या साधना एवं दुर्गा सप्तशती पाठ का शास्त्रीय पीठ है।",
    historyEn:
      "The Kalika Purana and the Yogini Tantra both centre their geography on Kamakhya. The temple was rebuilt in 1565 by Chilarai, general of the Koch king Naranarayan, after an earlier destruction, giving it the distinctive beehive-shaped Nilachal shikhara. Ahom kings later endowed it with land and the silver doors of the sanctum.",
    historyHi:
      "कालिका पुराण एवं योगिनी तंत्र दोनों की भौगोलिक धुरी कामाख्या ही है। पूर्व विध्वंस के बाद 1565 में कोच नरेश नरनारायण के सेनापति चिलाराय ने मंदिर का पुनर्निर्माण कराया, जिससे इसे विशिष्ट मधुमक्खी-छत्ते सदृश नीलाचल शिखर मिला। बाद में आहोम राजाओं ने इसे भूमि एवं गर्भगृह के रजत द्वार अर्पित किए।",
    timings: "05:30-13:00, 14:30-17:30",
    latitude: 26.1664,
    longitude: 91.7058,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "vaishno-devi",
    nameEn: "Shri Mata Vaishno Devi Bhawan",
    nameHi: "श्री माता वैष्णो देवी भवन",
    deityEn: "Mata Vaishno Devi",
    deityHi: "माता वैष्णो देवी",
    city: "Katra",
    state: "Jammu & Kashmir",
    descriptionEn:
      "Mata Vaishno Devi is worshipped in the Trikuta hills as three natural rock pindis — Mahakali, Mahalakshmi and Mahasaraswati — inside a cave the Devi is said to have entered while fleeing Bhairon Nath. The thirteen-kilometre climb from Katra, echoing with Jai Mata Di, is itself considered part of the darshan. Devotees complete the yatra only after visiting the Bhairon temple above the Bhawan. Red chunri, silver chhatra and dry-fruit prasad are the customary offerings.",
    descriptionHi:
      "माता वैष्णो देवी त्रिकूट पर्वत की उस गुफा में तीन प्राकृतिक पिंडियों — महाकाली, महालक्ष्मी एवं महासरस्वती — के रूप में पूजित हैं, जिसमें भैरोंनाथ से बचते हुए देवी प्रविष्ट हुई थीं। कटरा से तेरह किलोमीटर की चढ़ाई, जो 'जय माता दी' से गूँजती है, स्वयं दर्शन का ही अंग मानी जाती है। भवन से ऊपर भैरों मंदिर के दर्शन के बाद ही यात्रा पूर्ण मानी जाती है। लाल चुनरी, चाँदी का छत्र एवं मेवा प्रसाद यहाँ के प्रचलित अर्पण हैं।",
    historyEn:
      "The cave shrine's worship is traced to Pandit Shridhar of Hansali, to whom the Devi appeared as a young girl. The Shri Mata Vaishno Devi Shrine Board was constituted in 1986 and built the current track, the new cave passage and the Bhawan complex. Over a crore pilgrims now register at Katra each year.",
    historyHi:
      "गुफा की पूजा परंपरा हंसाली के पंडित श्रीधर से जुड़ी है, जिन्हें देवी कन्या रूप में दर्शन देती हैं। श्री माता वैष्णो देवी श्राइन बोर्ड की स्थापना 1986 में हुई, जिसने वर्तमान मार्ग, नई गुफा एवं भवन परिसर बनवाया। आज प्रतिवर्ष एक करोड़ से अधिक यात्री कटरा में पंजीकरण कराते हैं।",
    timings: "Open 24 hours (Atka Aarti 06:00 & 19:00)",
    latitude: 33.0308,
    longitude: 74.9497,
    liveDarshanUrl: null,
    featured: true,
  },
  {
    slug: "vishnupad-gaya",
    nameEn: "Vishnupad Temple",
    nameHi: "विष्णुपद मंदिर",
    deityEn: "Lord Vishnu",
    deityHi: "भगवान विष्णु",
    city: "Gaya",
    state: "Bihar",
    descriptionEn:
      "Vishnupad in Gaya enshrines a forty-centimetre footprint of Lord Vishnu pressed into solid basalt when he subdued the asura Gayasura. Gaya is the one place where Pind Daan alone can grant moksha to ancestors up to seven generations, which is why lakhs arrive during Pitru Paksha. Along the Falgu river, the sixteen vedis of the Gaya shraddh circuit are performed in a fixed order under a Gayawal pandit. Tripindi Shraddh here is the classical remedy for persistent Pitru Dosh.",
    descriptionHi:
      "गया के विष्णुपद मंदिर में भगवान विष्णु का चालीस सेंटीमीटर का वह चरण चिह्न है जो गयासुर के दमन के समय ठोस बेसाल्ट पर अंकित हुआ। गया वही एकमात्र स्थान है जहाँ केवल पिंडदान से सात पीढ़ियों तक के पितरों को मोक्ष मिल सकता है, इसीलिए पितृ पक्ष में लाखों लोग आते हैं। फल्गु नदी के किनारे गया श्राद्ध की सोलह वेदियों पर गयावाल पंडित के निर्देशन में निश्चित क्रम से कर्म होता है। यहाँ की त्रिपिंडी श्राद्ध विधि निरंतर पितृ दोष का शास्त्रोक्त उपाय है।",
    historyEn:
      "The present octagonal temple of grey granite was built in 1787 by Maharani Ahilyabai Holkar of Indore. The Ramayana records Sita performing pind daan for Dasharatha on the Falgu bank here. An immense akshayavat tree nearby is where the final pind of the circuit is offered.",
    historyHi:
      "धूसर ग्रेनाइट का वर्तमान अष्टकोणीय मंदिर 1787 में इंदौर की महारानी अहिल्याबाई होल्कर ने बनवाया था। रामायण में उल्लेख है कि सीता ने यहीं फल्गु तट पर दशरथ का पिंडदान किया। निकट स्थित विशाल अक्षयवट वृक्ष के नीचे यात्रा का अंतिम पिंड अर्पित किया जाता है।",
    timings: "06:00-19:30",
    latitude: 24.7477,
    longitude: 85.01,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "sankat-mochan",
    nameEn: "Sankat Mochan Hanuman Temple",
    nameHi: "संकट मोचन हनुमान मंदिर",
    deityEn: "Hanuman ji",
    deityHi: "श्री हनुमान जी",
    city: "Varanasi",
    state: "Uttar Pradesh",
    descriptionEn:
      "Sankat Mochan is the temple Goswami Tulsidas founded at the spot where Hanuman ji granted him darshan while he was composing the Ramcharitmanas. Its name means remover of troubles, and Tuesdays and Saturdays see queues of devotees carrying besan laddoo and sindoor mixed in chameli oil. Sunderkand path recited within these walls is regarded as especially potent against Shani peeda and chronic fear. The grove of trees and resident monkeys give the courtyard the air of a small forest ashram.",
    descriptionHi:
      "संकट मोचन मंदिर की स्थापना गोस्वामी तुलसीदास ने उसी स्थल पर की जहाँ रामचरितमानस की रचना के समय हनुमान जी ने उन्हें दर्शन दिए। नाम का अर्थ है संकट हरने वाले, और मंगलवार एवं शनिवार को बेसन लड्डू तथा चमेली तेल में मिला सिंदूर लेकर भक्तों की कतारें लगती हैं। इन्हीं परिसर में किया गया सुंदरकांड पाठ शनि पीड़ा एवं चिरकालिक भय के विरुद्ध विशेष प्रभावी माना जाता है। वृक्षों का झुरमुट एवं यहाँ रहने वाले वानर आँगन को छोटे वन-आश्रम का रूप देते हैं।",
    historyEn:
      "Tulsidas established the shrine in the early sixteenth century on the banks of the Assi stream. The present temple structure was rebuilt in the 1900s by Pandit Madan Mohan Malaviya, founder of Banaras Hindu University. The annual Sankat Mochan Sangeet Samaroh has drawn India's greatest classical musicians since 1923.",
    historyHi:
      "तुलसीदास ने सोलहवीं शताब्दी के आरंभ में अस्सी नाले के तट पर इस स्थान की स्थापना की। वर्तमान मंदिर संरचना का पुनर्निर्माण 1900 के दशक में काशी हिंदू विश्वविद्यालय के संस्थापक पंडित मदन मोहन मालवीय ने कराया। 1923 से चला आ रहा वार्षिक संकट मोचन संगीत समारोह भारत के श्रेष्ठतम शास्त्रीय संगीतज्ञों को यहाँ लाता रहा है।",
    timings: "05:00-12:00, 15:00-22:00",
    latitude: 25.2793,
    longitude: 82.9976,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "baglamukhi-datia",
    nameEn: "Maa Baglamukhi Peetambara Peeth",
    nameHi: "माँ बगलामुखी पीतांबरा पीठ",
    deityEn: "Maa Baglamukhi",
    deityHi: "माँ बगलामुखी",
    city: "Datia",
    state: "Madhya Pradesh",
    descriptionEn:
      "Peetambara Peeth at Datia is the foremost seat of Maa Baglamukhi, the eighth Mahavidya who stills the tongue and the will of adversaries. She is worshipped entirely in yellow — haldi, yellow cloth, yellow flowers and kesar bhog — and her upasana is sought for litigation, competitive examinations and slander. The famous Rashtra Raksha anushthan performed here in 1962 during the border conflict is still recounted across Bundelkhand. Behind the Baglamukhi shrine stands an ancient Vankhandeshwar Shiva temple of the Mahabharata era.",
    descriptionHi:
      "दतिया का पीतांबरा पीठ माँ बगलामुखी का प्रमुख सिद्धपीठ है — वे अष्टम महाविद्या हैं जो शत्रु की वाणी एवं संकल्प को स्तंभित करती हैं। उनकी उपासना पूर्णतः पीत वर्ण में होती है — हल्दी, पीत वस्त्र, पीले पुष्प एवं केसर भोग — और मुकदमे, प्रतियोगी परीक्षा तथा अपयश में उनकी शरण ली जाती है। 1962 के सीमा संघर्ष के समय यहाँ हुआ प्रसिद्ध राष्ट्र रक्षा अनुष्ठान आज भी सम्पूर्ण बुंदेलखंड में स्मरण किया जाता है। बगलामुखी मंदिर के पीछे महाभारत कालीन प्राचीन वनखंडेश्वर शिव मंदिर स्थित है।",
    historyEn:
      "The peeth was established in 1935 by Swami ji Maharaj, a renowned tantric siddha whose identity he never disclosed. He conducted the 1962 yajna at the request of the Government of India, and the Chinese ceasefire that followed cemented the peeth's fame. The trust he founded still performs the anushthans in the original sadhana kutir.",
    historyHi:
      "पीठ की स्थापना 1935 में स्वामी जी महाराज ने की, जो प्रसिद्ध तांत्रिक सिद्ध थे और जिन्होंने अपना परिचय कभी प्रकट नहीं किया। भारत सरकार के अनुरोध पर उन्होंने 1962 का यज्ञ कराया और उसके पश्चात हुए चीनी युद्धविराम ने पीठ की ख्याति स्थापित कर दी। उनके द्वारा स्थापित ट्रस्ट आज भी मूल साधना कुटीर में अनुष्ठान कराता है।",
    timings: "06:00-12:00, 16:00-20:30",
    latitude: 25.6703,
    longitude: 78.4603,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "shani-shingnapur",
    nameEn: "Shri Shanaishwar Devasthan",
    nameHi: "श्री शनैश्वर देवस्थान",
    deityEn: "Lord Shani",
    deityHi: "शनि देव",
    city: "Shingnapur, Ahmednagar",
    state: "Maharashtra",
    descriptionEn:
      "Shani Shingnapur is the swayambhu Shani, a five-and-a-half-foot black stone standing in the open with no roof, no door and no walls above it. The village is famous for having no locks on its homes, in the faith that Shani Dev himself guards them. Til oil abhishek offered on a Saturday is the accepted remedy for Sade Sati, Dhaiya and Shani Mahadasha. Black cloth, urad dal and blue flowers complete the traditional offering.",
    descriptionHi:
      "शनि शिंगणापुर में स्वयंभू शनि विराजते हैं — साढ़े पाँच फुट का काला पाषाण जो खुले में स्थित है, न ऊपर छत, न द्वार, न दीवार। यह गाँव इस विश्वास के कारण प्रसिद्ध है कि घरों पर ताले नहीं लगाए जाते क्योंकि स्वयं शनि देव उनकी रक्षा करते हैं। शनिवार को किया गया तिल तेल अभिषेक साढ़े साती, ढैया एवं शनि महादशा का स्वीकृत उपाय है। काला वस्त्र, उड़द दाल एवं नीले पुष्प इस अर्पण को पूर्ण करते हैं।",
    historyEn:
      "Village tradition holds that the stone surfaced in the Panasnala stream during a flood and spoke in a shepherd's dream, forbidding any roof over it. The temple was formally organised as a devasthan trust in the twentieth century and now serves lakhs on Shani Amavasya and Shani Jayanti. Amavasya falling on a Saturday, called Shani Amavasya, is the single busiest day of its calendar.",
    historyHi:
      "ग्राम परंपरा के अनुसार यह पाषाण बाढ़ के समय पानसनाला में प्रकट हुआ और एक चरवाहे के स्वप्न में बोलकर उसने अपने ऊपर छत बनाने से मना किया। बीसवीं शताब्दी में मंदिर को विधिवत देवस्थान ट्रस्ट का रूप दिया गया और आज शनि अमावस्या एवं शनि जयंती पर लाखों भक्त आते हैं। शनिवार को पड़ने वाली अमावस्या, जिसे शनि अमावस्या कहते हैं, यहाँ का सर्वाधिक व्यस्त दिवस है।",
    timings: "Open 24 hours (Abhishek 05:00-18:00)",
    latitude: 19.3676,
    longitude: 74.7364,
    liveDarshanUrl: null,
    featured: false,
  },
  {
    slug: "badrinath",
    nameEn: "Shri Badrinath Dham",
    nameHi: "श्री बद्रीनाथ धाम",
    deityEn: "Lord Badri Vishal (Vishnu)",
    deityHi: "भगवान बद्री विशाल (विष्णु)",
    city: "Badrinath, Chamoli",
    state: "Uttarakhand",
    descriptionEn:
      "Badrinath is the northern seat of the Char Dham, where a black saligram murti of Vishnu in padmasana sits between the Nar and Narayan peaks beside the Alaknanda. Adi Shankaracharya is said to have recovered the murti from the Narad Kund and re-established worship in the eighth century. Pilgrims bathe in the boiling Tapt Kund before darshan even in the deepest cold. The temple opens on Akshaya Tritiya and closes after Bhai Dooj, and the Akhand Jyoti burns alone through the winter.",
    descriptionHi:
      "बद्रीनाथ चार धाम का उत्तरी पीठ है, जहाँ नर एवं नारायण पर्वतों के बीच अलकनंदा तट पर पद्मासन में विष्णु की श्याम शालिग्राम मूर्ति विराजती है। मान्यता है कि आदि शंकराचार्य ने आठवीं शताब्दी में नारद कुंड से यह विग्रह निकालकर पूजा पुनः स्थापित की। कड़ाके की ठंड में भी भक्त दर्शन से पूर्व उष्ण तप्त कुंड में स्नान करते हैं। मंदिर अक्षय तृतीया पर खुलता है और भाई दूज के बाद बंद हो जाता है, तथा शीतकाल भर अखंड ज्योति अकेले जलती रहती है।",
    historyEn:
      "The Vishnu Purana and Mahabharata both name Badrikashram as the tapasya ground of Nar and Narayan. Shankaracharya's revival established the Rawal tradition of Namboodiri head priests from Kerala, which continues today. The brightly painted singh dwara facade was rebuilt by the kings of Garhwal after successive avalanches and the 1803 earthquake.",
    historyHi:
      "विष्णु पुराण एवं महाभारत दोनों बद्रिकाश्रम को नर-नारायण की तपस्थली बताते हैं। शंकराचार्य के पुनरुद्धार से केरल के नंबूदरी रावल मुख्य पुजारी की परंपरा आरंभ हुई जो आज भी चली आ रही है। हिमस्खलनों तथा 1803 के भूकंप के बाद गढ़वाल के राजाओं ने चटख रंगों वाले सिंह द्वार का पुनर्निर्माण कराया।",
    timings: "04:30-13:00, 16:00-21:00 (open Apr/May–Nov)",
    latitude: 30.7433,
    longitude: 79.4938,
    liveDarshanUrl: null,
    featured: true,
  },
];

/** Famous temples across India, then the launch city's own (./local-temples). */
export const TEMPLES: TempleSeed[] = [...NATIONAL_TEMPLES, ...LOCAL_TEMPLES];

export const TEMPLE_SLUGS = TEMPLES.map((t) => t.slug);
export type TempleSlug = (typeof TEMPLES)[number]["slug"];
