/**
 * The bhakti library — aarti, chalisa, mantra and stotra texts shown in the
 * "Path & Paath" section of the app and read aloud during live poojas.
 *
 * Everything here is plain TypeScript so it can be imported both by
 * `prisma/seed.ts` and by `scripts/generate-art.ts` without pulling in Prisma.
 *
 * Conventions
 * - Every text is a traditional, public-domain devotional composition
 *   (Tulsidas, Adi Shankara, puranic stotras, the standard aarti sangrah).
 * - `bodyHi` is pure Devanagari, line-broken exactly as it is traditionally
 *   printed, with `।` / `॥` danda marks and Devanagari section labels.
 * - `bodyEn` is an ASCII-friendly transliteration of the *same* lines,
 *   followed by a blank line and a short `Meaning:` note explaining what the
 *   text says and when a devotee recites it.
 * - Artwork is reused from the generated service and festival art —
 *   `/images/services/<serviceSlug>.svg` or `/images/festivals/<key>.svg`,
 *   both written by `scripts/generate-art.ts`. Admins can replace it with real
 *   photographs from the admin console — see docs/IMAGES.md.
 * - `tags` are lowercase-hyphen and used by search + the "recite on this day"
 *   filters (tuesday, saturday, monday, friday, navratri …).
 */
import type { ContentTypeName } from "./types";

export type ContentSeed = {
  slug: string;
  type: ContentTypeName;
  titleEn: string;
  titleHi: string;
  deityEn: string;
  deityHi: string;
  /** Full Devanagari text. */
  bodyHi: string;
  /** Roman transliteration of the same lines + a short `Meaning:` note. */
  bodyEn: string;
  tags: string[];
  featured: boolean;
  imageUrl: string;
};

const svc = (slug: string) => `/images/services/${slug}.svg`;
const fest = (key: string) => `/images/festivals/${key}.svg`;

export const CONTENT: ContentSeed[] = [
  // ───────────────────────────── AARTI ─────────────────────────────
  {
    slug: "aarti-om-jai-jagdish-hare",
    type: "AARTI",
    titleEn: "Om Jai Jagdish Hare",
    titleHi: "ॐ जय जगदीश हरे",
    deityEn: "Lord Vishnu",
    deityHi: "भगवान विष्णु",
    bodyHi: `॥ आरती ॥

ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे।
भक्त जनों के संकट, दास जनों के संकट, क्षण में दूर करे॥
ॐ जय जगदीश हरे॥

जो ध्यावे फल पावे, दुख बिनसे मन का।
स्वामी दुख बिनसे मन का॥
सुख सम्पति घर आवे, सुख सम्पति घर आवे, कष्ट मिटे तन का॥
ॐ जय जगदीश हरे॥

मात-पिता तुम मेरे, शरण गहूँ मैं किसकी।
स्वामी शरण गहूँ मैं किसकी॥
तुम बिन और न दूजा, तुम बिन और न दूजा, आस करूँ मैं जिसकी॥
ॐ जय जगदीश हरे॥

तुम पूरन परमात्मा, तुम अन्तरयामी।
स्वामी तुम अन्तरयामी॥
पारब्रह्म परमेश्वर, पारब्रह्म परमेश्वर, तुम सबके स्वामी॥
ॐ जय जगदीश हरे॥

तुम करुणा के सागर, तुम पालनकर्ता।
स्वामी तुम पालनकर्ता॥
मैं मूरख खल कामी, मैं सेवक तुम स्वामी, कृपा करो भर्ता॥
ॐ जय जगदीश हरे॥

तुम हो एक अगोचर, सबके प्राणपति।
स्वामी सबके प्राणपति॥
किस विधि मिलूँ दयामय, किस विधि मिलूँ दयामय, तुमको मैं कुमति॥
ॐ जय जगदीश हरे॥

दीनबन्धु दुखहर्ता, ठाकुर तुम मेरे।
स्वामी ठाकुर तुम मेरे॥
अपने हाथ उठाओ, अपने शरण लगाओ, द्वार पड़ा तेरे॥
ॐ जय जगदीश हरे॥

विषय विकार मिटाओ, पाप हरो देवा।
स्वामी पाप हरो देवा॥
श्रद्धा भक्ति बढ़ाओ, श्रद्धा भक्ति बढ़ाओ, सन्तन की सेवा॥
ॐ जय जगदीश हरे॥

श्री जगदीशजी की आरती, जो कोई नर गावे।
स्वामी जो कोई नर गावे॥
कहत शिवानन्द स्वामी, कहत शिवानन्द स्वामी, सुख सम्पति पावे॥
ॐ जय जगदीश हरे॥`,
    bodyEn: `Om Jai Jagdish Hare, Swami Jai Jagdish Hare.
Bhakt janon ke sankat, das janon ke sankat, kshan mein door kare.
Om Jai Jagdish Hare.

Jo dhyave phal pave, dukh binase man ka.
Swami dukh binase man ka.
Sukh sampati ghar aave, sukh sampati ghar aave, kasht mite tan ka.
Om Jai Jagdish Hare.

Mat-pita tum mere, sharan gahun main kiski.
Swami sharan gahun main kiski.
Tum bin aur na dooja, tum bin aur na dooja, aas karun main jiski.
Om Jai Jagdish Hare.

Tum puran paramatma, tum antaryami.
Swami tum antaryami.
Parbrahm parameshwar, parbrahm parameshwar, tum sabke swami.
Om Jai Jagdish Hare.

Tum karuna ke sagar, tum palankarta.
Swami tum palankarta.
Main murakh khal kami, main sevak tum swami, kripa karo bharta.
Om Jai Jagdish Hare.

Tum ho ek agochar, sabke pranpati.
Swami sabke pranpati.
Kis vidhi milun dayamay, kis vidhi milun dayamay, tumko main kumati.
Om Jai Jagdish Hare.

Deenbandhu dukhharta, thakur tum mere.
Swami thakur tum mere.
Apne haath uthao, apne sharan lagao, dwar pada tere.
Om Jai Jagdish Hare.

Vishay vikar mitao, paap haro deva.
Swami paap haro deva.
Shraddha bhakti badhao, shraddha bhakti badhao, santan ki seva.
Om Jai Jagdish Hare.

Shri Jagdishji ki aarti, jo koi nar gave.
Swami jo koi nar gave.
Kahat Shivanand swami, kahat Shivanand swami, sukh sampati pave.
Om Jai Jagdish Hare.

Meaning: This is the universal aarti of Hari, the Lord of the universe, sung at the close of almost every Hindu pooja in India. The devotee addresses Vishnu as father and mother, the only refuge, the ocean of compassion and the inner dweller of every heart, and asks that suffering of body and mind be removed "in an instant". The later verses are a confession — "I am foolish and full of desire, You are the master, please lift me by the hand" — and a prayer for shraddha, bhakti and the company of saints rather than for wealth. The closing verse, in the voice of Swami Shivanand, promises peace and prosperity to whoever sings it with faith. It is sung standing, with the lamp circled clockwise before the deity.`,
    tags: ["vishnu", "aarti", "daily", "prosperity", "peace"],
    featured: true,
    imageUrl: svc("satyanarayan-katha-online"),
  },
  {
    slug: "aarti-jai-ganesh-deva",
    type: "AARTI",
    titleEn: "Jai Ganesh Jai Ganesh Deva",
    titleHi: "जय गणेश जय गणेश देवा",
    deityEn: "Lord Ganesha",
    deityHi: "भगवान गणेश",
    bodyHi: `॥ आरती ॥

जय गणेश जय गणेश, जय गणेश देवा।
माता जाकी पार्वती, पिता महादेवा॥
जय गणेश जय गणेश, जय गणेश देवा॥

एकदन्त दयावन्त, चार भुजा धारी।
माथे सिन्दूर सोहे, मूसे की सवारी॥
जय गणेश जय गणेश, जय गणेश देवा॥

अन्धन को आँख देत, कोढ़िन को काया।
बाँझन को पुत्र देत, निर्धन को माया॥
जय गणेश जय गणेश, जय गणेश देवा॥

पान चढ़े फूल चढ़े, और चढ़े मेवा।
लड्डुअन का भोग लगे, सन्त करें सेवा॥
जय गणेश जय गणेश, जय गणेश देवा॥

दीनन की लाज राखो, शम्भु सुतवारी।
कामना को पूर्ण करो, जग बलिहारी॥
जय गणेश जय गणेश, जय गणेश देवा॥

जय गणेश जय गणेश, जय गणेश देवा।
माता जाकी पार्वती, पिता महादेवा॥`,
    bodyEn: `Jai Ganesh Jai Ganesh, Jai Ganesh Deva.
Mata jaki Parvati, pita Mahadeva.
Jai Ganesh Jai Ganesh, Jai Ganesh Deva.

Ekdant dayavant, chaar bhuja dhari.
Mathe sindoor sohe, moose ki sawari.
Jai Ganesh Jai Ganesh, Jai Ganesh Deva.

Andhan ko aankh det, kodhin ko kaya.
Baanjhan ko putra det, nirdhan ko maya.
Jai Ganesh Jai Ganesh, Jai Ganesh Deva.

Paan chadhe phool chadhe, aur chadhe mewa.
Ladduan ka bhog lage, sant karein seva.
Jai Ganesh Jai Ganesh, Jai Ganesh Deva.

Deenan ki laaj rakho, Shambhu sutwari.
Kamana ko poorn karo, jag balihari.
Jai Ganesh Jai Ganesh, Jai Ganesh Deva.

Jai Ganesh Jai Ganesh, Jai Ganesh Deva.
Mata jaki Parvati, pita Mahadeva.

Meaning: The aarti of Gajanan, son of Parvati and Mahadev, is sung first in every ritual because Ganesha is prathamem pujya — worshipped before all other devas. The verses describe him in the way a devotee actually sees the murti: one tusk, four arms, vermilion on the forehead, the little mouse for a vehicle. The central promise is that he gives sight to the blind, a healed body to the leper, a child to the childless and wealth to the poor, so no petition is too small to bring to him. The offerings named — betel leaf, flowers, dry fruit and above all modak laddus — are exactly what is placed on his thali. Sung daily, at Ganesh Chaturthi and at the start of any new venture, griha pravesh or vehicle pooja.`,
    tags: ["ganesha", "aarti", "daily", "new-beginnings", "obstacles"],
    featured: false,
    imageUrl: svc("ganesh-siddhi-pooja-siddhivinayak"),
  },
  {
    slug: "aarti-om-jai-shiv-omkara",
    type: "AARTI",
    titleEn: "Om Jai Shiv Omkara",
    titleHi: "ॐ जय शिव ओंकारा",
    deityEn: "Lord Shiva",
    deityHi: "भगवान शिव",
    bodyHi: `॥ आरती ॥

ॐ जय शिव ओंकारा, स्वामी जय शिव ओंकारा।
ब्रह्मा विष्णु सदाशिव, अर्द्धांगी धारा॥
ॐ जय शिव ओंकारा॥

एकानन चतुरानन पंचानन राजे।
हंसासन गरुड़ासन वृषवाहन साजे॥
ॐ जय शिव ओंकारा॥

दो भुज चार चतुर्भुज दसभुज ते सोहे।
तीनों रूप निरखता त्रिभुवन जन मोहे॥
ॐ जय शिव ओंकारा॥

अक्षमाला वनमाला मुण्डमाला धारी।
त्रिपुरारी कंसारी कर माला धारी॥
ॐ जय शिव ओंकारा॥

श्वेताम्बर पीताम्बर बाघम्बर अंगे।
सनकादिक गरुड़ादिक भूतादिक संगे॥
ॐ जय शिव ओंकारा॥

कर के मध्य कमण्डल चक्र त्रिशूलधारी।
सुखकारी दुखहारी जगपालनकारी॥
ॐ जय शिव ओंकारा॥

ब्रह्मा विष्णु सदाशिव जानत अविवेका।
प्रणवाक्षर के मध्ये ये तीनों एका॥
ॐ जय शिव ओंकारा॥

त्रिगुणस्वामी जी की आरती जो कोई नर गावे।
कहत शिवानन्द स्वामी मनवाञ्छित फल पावे॥
ॐ जय शिव ओंकारा॥`,
    bodyEn: `Om Jai Shiv Omkara, Swami Jai Shiv Omkara.
Brahma Vishnu Sadashiv, ardhangi dhara.
Om Jai Shiv Omkara.

Ekanan chaturanan panchanan raje.
Hansasan Garudasan vrishvahan saje.
Om Jai Shiv Omkara.

Do bhuj chaar chaturbhuj dasbhuj te sohe.
Teenon roop nirakhta tribhuvan jan mohe.
Om Jai Shiv Omkara.

Akshamala vanmala mundmala dhari.
Tripurari Kansari kar mala dhari.
Om Jai Shiv Omkara.

Shwetambar peetambar baghambar ange.
Sanakadik Garudadik bhootadik sange.
Om Jai Shiv Omkara.

Kar ke madhya kamandal chakra trishuldhari.
Sukhkari dukhhari jagpalankari.
Om Jai Shiv Omkara.

Brahma Vishnu Sadashiv janat aviveka.
Pranavakshar ke madhye ye teenon eka.
Om Jai Shiv Omkara.

Trigun swami ji ki aarti jo koi nar gave.
Kahat Shivanand swami manvanchhit phal pave.
Om Jai Shiv Omkara.

Meaning: This aarti worships Shiva as Omkara — the syllable Om itself — and sees Brahma, Vishnu and Sadashiv as three faces of one reality held together inside that single sound. Each verse pairs the three: one face, four faces and five faces; the swan, the eagle and the bull as vehicles; white, yellow and tiger-skin garments; the rudraksha, forest-flower and skull garlands. The seventh verse states the point plainly — those who see Brahma, Vishnu and Shiva as separate lack discernment, for in the pranava they are one. It is sung every Monday, through Shravan, on Mahashivratri and at the close of every Rudrabhishek.`,
    tags: ["shiva", "aarti", "monday", "shravan", "shivratri"],
    featured: false,
    imageUrl: svc("rudrabhishek-kashi-vishwanath"),
  },
  {
    slug: "aarti-ambe-tu-hai-jagdambe",
    type: "AARTI",
    titleEn: "Ambe Tu Hai Jagdambe Kali",
    titleHi: "अम्बे तू है जगदम्बे काली",
    deityEn: "Goddess Durga",
    deityHi: "माँ दुर्गा",
    bodyHi: `॥ आरती ॥

अम्बे तू है जगदम्बे काली, जय दुर्गे खप्पर वाली।
तेरे ही गुण गाएँ भारती, ओ मैया हम सब उतारें तेरी आरती॥

तेरे भक्त जनों पर माता, भीड़ पड़ी है भारी।
दानव दल पर टूट पड़ो माँ, करके सिंह सवारी॥
सौ-सौ सिंहों से तू बलशाली, है दस भुजाओं वाली।
दुखियों के दुखड़े निवारती, ओ मैया हम सब उतारें तेरी आरती॥

माँ बेटे का है इस जग में, बड़ा ही निर्मल नाता।
पूत कपूत सुने हैं पर ना, माता सुनी कुमाता॥
सब पे करुणा दरसाने वाली, अमृत बरसाने वाली।
दुखियों के दुखड़े निवारती, ओ मैया हम सब उतारें तेरी आरती॥

नहीं माँगते धन और दौलत, न चाँदी न सोना।
हम तो माँगें माँ तेरे मन में, इक छोटा सा कोना॥
सबकी बिगड़ी बनाने वाली, लाज बचाने वाली।
सतियों के सत को सँवारती, ओ मैया हम सब उतारें तेरी आरती॥

चरण शरण में खड़े तुम्हारी, लिए कटोरा भिक्षा।
जो माँगे वो ही देती हो, हो माता की दीक्षा॥
अम्बे तू है जगदम्बे काली, जय दुर्गे खप्पर वाली।
दुखियों के दुखड़े निवारती, ओ मैया हम सब उतारें तेरी आरती॥`,
    bodyEn: `Ambe tu hai Jagdambe Kali, Jai Durge khappar wali.
Tere hi gun gaayein Bharati, o maiya hum sab utaarein teri aarti.

Tere bhakt janon par mata, bheed padi hai bhari.
Danav dal par toot pado maa, karke sinh sawari.
Sau-sau sinhon se tu balshali, hai das bhujaon wali.
Dukhiyon ke dukhde nivarati, o maiya hum sab utaarein teri aarti.

Maa bete ka hai is jag mein, bada hi nirmal nata.
Poot kapoot sune hain par na, mata suni kumata.
Sab pe karuna darsane wali, amrit barsane wali.
Dukhiyon ke dukhde nivarati, o maiya hum sab utaarein teri aarti.

Nahin maangte dhan aur daulat, na chandi na sona.
Hum to maangein maa tere man mein, ik chhota sa kona.
Sabki bigdi banane wali, laaj bachane wali.
Satiyon ke sat ko sanwarati, o maiya hum sab utaarein teri aarti.

Charan sharan mein khade tumhari, liye katora bhiksha.
Jo maange wo hi deti ho, ho mata ki deeksha.
Ambe tu hai Jagdambe Kali, Jai Durge khappar wali.
Dukhiyon ke dukhde nivarati, o maiya hum sab utaarein teri aarti.

Meaning: The most-sung Devi aarti in north India, addressed to Amba, Kali and Durga as one Mother riding the lion with the skull-bowl in her hand. The first verse is a call for help — her devotees are besieged, and she is asked to fall upon the demon host with the strength of a hundred lions. The second verse gives the reason such a call always works: a son may fail his mother, but no mother has ever been heard of as a bad mother. The third verse is the heart of it — the devotee asks for neither silver nor gold, only "a small corner in your heart". Sung morning and evening through the nine nights of Navratri, on Ashtami, and at every Durga jagran and chowki.`,
    tags: ["durga", "aarti", "navratri", "shakti", "protection"],
    featured: false,
    imageUrl: fest("sharad-navratri"),
  },
  {
    slug: "aarti-kije-hanuman-lala-ki",
    type: "AARTI",
    titleEn: "Aarti Kije Hanuman Lala Ki",
    titleHi: "आरती कीजै हनुमान लला की",
    deityEn: "Lord Hanuman",
    deityHi: "भगवान हनुमान",
    bodyHi: `॥ आरती ॥

आरती कीजै हनुमान लला की।
दुष्ट दलन रघुनाथ कला की॥

जाके बल से गिरिवर काँपे।
रोग दोष जाके निकट न झाँके॥
अंजनि पुत्र महा बलदाई।
सन्तन के प्रभु सदा सहाई॥
आरती कीजै हनुमान लला की॥

दे बीरा रघुनाथ पठाए।
लंका जारि सिया सुधि लाए॥
लंका सो कोट समुद्र सी खाई।
जात पवनसुत बार न लाई॥
आरती कीजै हनुमान लला की॥

लंका जारि असुर संहारे।
सियारामजी के काज सँवारे॥
लक्ष्मण मूर्छित पड़े सकारे।
आनि सजीवन प्राण उबारे॥
आरती कीजै हनुमान लला की॥

पैठि पाताल तोरि जमकारे।
अहिरावण की भुजा उखारे॥
बाईं भुजा असुर दल मारे।
दहिनी भुजा सन्तजन तारे॥
आरती कीजै हनुमान लला की॥

सुर नर मुनि जन आरती उतारें।
जय जय जय हनुमान उचारें॥
कंचन थार कपूर लौ छाई।
आरती करत अंजना माई॥
आरती कीजै हनुमान लला की॥

जो हनुमानजी की आरती गावे।
बसि बैकुण्ठ परमपद पावे॥
लंक विध्वंस किए रघुराई।
तुलसीदास स्वामी कीरति गाई॥
आरती कीजै हनुमान लला की॥

आरती कीजै हनुमान लला की।
दुष्ट दलन रघुनाथ कला की॥`,
    bodyEn: `Aarti kije Hanuman Lala ki.
Dusht dalan Raghunath kala ki.

Jaake bal se girivar kaanpe.
Rog dosh jaake nikat na jhaanke.
Anjani putra maha baldai.
Santan ke prabhu sada sahai.
Aarti kije Hanuman Lala ki.

De beera Raghunath pathaye.
Lanka jaari Siya sudhi laaye.
Lanka so kot samudra si khai.
Jaat Pavansut baar na lai.
Aarti kije Hanuman Lala ki.

Lanka jaari asur sanhare.
Siyaramji ke kaaj sanware.
Lakshman moorchhit pade sakare.
Aani Sanjivan praan ubare.
Aarti kije Hanuman Lala ki.

Paithi patal tori Jamkare.
Ahiravan ki bhuja ukhare.
Baayin bhuja asur dal mare.
Dahini bhuja santjan tare.
Aarti kije Hanuman Lala ki.

Sur nar muni jan aarti utarein.
Jai jai jai Hanuman ucharein.
Kanchan thar kapoor lau chhai.
Aarti karat Anjana mai.
Aarti kije Hanuman Lala ki.

Jo Hanumanji ki aarti gave.
Basi Baikunth param pad pave.
Lank vidhwans kiye Raghurai.
Tulsidas swami keerati gai.
Aarti kije Hanuman Lala ki.

Aarti kije Hanuman Lala ki.
Dusht dalan Raghunath kala ki.

Meaning: The standard aarti offered to Hanuman after the Chalisa or Sunderkand, praising him as the crusher of the wicked and the very power of Raghunath. It walks through his great deeds: mountains tremble at his strength, disease and dosha do not come near him; carrying Rama's ring he crossed the ocean in a single leap, burnt Lanka and brought back news of Sita; he carried the Sanjivani mountain to revive Lakshman; he tore into Patala to destroy Ahiravan. The last verse says his left arm slays demon armies while his right arm delivers the saints — the two things a devotee asks of him. Whoever sings this aarti, it promises, attains the highest state. Recited on Tuesdays and Saturdays and at Hanuman Jayanti.`,
    tags: ["hanuman", "aarti", "tuesday", "saturday", "protection"],
    featured: true,
    imageUrl: svc("hanuman-sunderkand-sankat-mochan"),
  },
  {
    slug: "aarti-om-jai-lakshmi-mata",
    type: "AARTI",
    titleEn: "Om Jai Lakshmi Mata",
    titleHi: "ॐ जय लक्ष्मी माता",
    deityEn: "Goddess Lakshmi",
    deityHi: "माँ लक्ष्मी",
    bodyHi: `॥ आरती ॥

ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता।
तुमको निशदिन सेवत, हर विष्णु विधाता॥
ॐ जय लक्ष्मी माता॥

उमा रमा ब्रह्माणी, तुम ही जग माता।
सूर्य चन्द्रमा ध्यावत, नारद ऋषि गाता॥
ॐ जय लक्ष्मी माता॥

दुर्गा रूप निरंजनी, सुख सम्पत्ति दाता।
जो कोई तुमको ध्यावत, ऋद्धि सिद्धि धन पाता॥
ॐ जय लक्ष्मी माता॥

तुम पाताल निवासिनी, तुम ही शुभदाता।
कर्म प्रभाव प्रकाशिनी, भवनिधि की त्राता॥
ॐ जय लक्ष्मी माता॥

जिस घर में तुम रहतीं, सब सद्गुण आता।
सब सम्भव हो जाता, मन नहीं घबराता॥
ॐ जय लक्ष्मी माता॥

तुम बिन यज्ञ न होते, वस्त्र न कोई पाता।
खान पान का वैभव, सब तुमसे आता॥
ॐ जय लक्ष्मी माता॥

शुभ गुण मन्दिर सुन्दर, क्षीरोदधि जाता।
रत्न चतुर्दश तुम बिन, कोई नहीं पाता॥
ॐ जय लक्ष्मी माता॥

महालक्ष्मीजी की आरती, जो कोई नर गाता।
उर आनन्द समाता, पाप उतर जाता॥
ॐ जय लक्ष्मी माता॥`,
    bodyEn: `Om Jai Lakshmi Mata, maiya Jai Lakshmi Mata.
Tumko nishdin sevat, Har Vishnu Vidhata.
Om Jai Lakshmi Mata.

Uma Rama Brahmani, tum hi jag mata.
Surya Chandrama dhyavat, Narad rishi gata.
Om Jai Lakshmi Mata.

Durga roop niranjani, sukh sampatti data.
Jo koi tumko dhyavat, riddhi siddhi dhan pata.
Om Jai Lakshmi Mata.

Tum patal nivasini, tum hi shubhdata.
Karm prabhav prakashini, bhavnidhi ki trata.
Om Jai Lakshmi Mata.

Jis ghar mein tum rahtin, sab sadgun aata.
Sab sambhav ho jata, man nahin ghabrata.
Om Jai Lakshmi Mata.

Tum bin yagya na hote, vastra na koi pata.
Khaan paan ka vaibhav, sab tumse aata.
Om Jai Lakshmi Mata.

Shubh gun mandir sundar, ksheerodadhi jata.
Ratna chaturdash tum bin, koi nahin pata.
Om Jai Lakshmi Mata.

Mahalakshmiji ki aarti, jo koi nar gata.
Ur anand samata, paap utar jata.
Om Jai Lakshmi Mata.

Meaning: The aarti of Mahalakshmi, served day and night by Shiva, Vishnu and Brahma themselves. She is named as Uma, Rama and Brahmani — the one Shakti behind all three — and as the giver of riddhi, siddhi and wealth to whoever meditates on her. The most-quoted lines are the household ones: where she dwells every virtue follows, everything becomes possible and the mind stops trembling; without her no yagya is completed, no cloth is worn and no food reaches the plate. The seventh verse recalls that she rose from the churning of the ocean of milk, without whom the fourteen jewels could not be obtained. Sung every Friday and on Diwali night after the Lakshmi-Kuber pooja.`,
    tags: ["lakshmi", "aarti", "friday", "diwali", "wealth"],
    featured: false,
    imageUrl: fest("diwali"),
  },
  {
    slug: "aarti-shri-ramchandra-kripalu",
    type: "AARTI",
    titleEn: "Shri Ramchandra Kripalu Bhajman",
    titleHi: "श्रीरामचन्द्र कृपालु भजु मन",
    deityEn: "Lord Rama",
    deityHi: "भगवान श्रीराम",
    bodyHi: `॥ श्रीराम स्तुति ॥

श्रीरामचन्द्र कृपालु भजु मन हरण भवभय दारुणम्।
नवकंज लोचन कंज मुख कर कंज पद कंजारुणम्॥१॥

कन्दर्प अगणित अमित छवि नवनील नीरज सुन्दरम्।
पटपीत मानहुँ तड़ित रुचि शुचि नौमि जनक सुतावरम्॥२॥

भजु दीनबन्धु दिनेश दानव दैत्यवंश निकन्दनम्।
रघुनन्द आनँदकन्द कोशल चन्द दशरथ नन्दनम्॥३॥

सिर मुकुट कुण्डल तिलक चारु उदारु अंग विभूषणम्।
आजानुभुज शर चापधर संग्राम जित खरदूषणम्॥४॥

इति वदति तुलसीदास शंकर शेष मुनि मन रंजनम्।
मम हृदयकंज निवास कुरु कामादि खलदल गंजनम्॥५॥

॥ दोहा ॥
मनु जाहिं राचेउ मिलिहि सो बरु सहज सुन्दर साँवरो।
करुना निधान सुजान सीलु सनेहु जानत रावरो॥
एहि भाँति गौरि असीस सुनि सिय सहित हियँ हरषीं अली।
तुलसी भवानिहि पूजि पुनि पुनि मुदित मन मन्दिर चली॥`,
    bodyEn: `Shri Ramchandra kripalu bhaju man haran bhavabhaya darunam.
Navakanja lochan kanja mukh kar kanja pad kanjarunam.

Kandarpa aganita amita chhavi navaneela neeraja sundaram.
Patapeeta manahun tadita ruchi shuchi naumi Janaka sutavaram.

Bhaju Deenabandhu Dinesha danava daityavansha nikandanam.
Raghunanda anandakanda Koshala chanda Dasharatha nandanam.

Sira mukuta kundala tilaka charu udaru anga vibhushanam.
Ajanubhuja shara chapadhara sangrama jita Kharadushanam.

Iti vadati Tulsidasa Shankara Shesha muni mana ranjanam.
Mama hridayakanja nivasa kuru kamadi khaladala ganjanam.

Manu jahin racheu milihi so baru sahaja sundara saanwaro.
Karuna nidhana sujana seelu sanehu janata raavaro.
Ehi bhaanti Gauri aseesa suni Siya sahita hiyan harasheen ali.
Tulsi Bhavanihi pooji puni puni mudita mana mandira chali.

Meaning: Tulsidas's own stuti of Rama, sung as an aarti in temples and homes across north India. Every image is a lotus — lotus eyes, lotus face, lotus hands, lotus feet the colour of dawn — and the Lord's beauty is said to exceed countless Kamadevas, dark as a fresh rain-cloud with lightning-yellow silk around him. He is called Deenabandhu, friend of the helpless, destroyer of the demon lines, the moon of Kosala and son of Dasharatha. The fifth verse is the poet's prayer: "come and live in the lotus of my heart, and crush the wicked army of desire and its kin." The closing doha is from the Balkand — Gauri's blessing to Sita that she will receive the beautiful dark-hued groom her heart has chosen. Recited at Ram Navami, during Ramcharitmanas paath, and in daily sandhya.`,
    tags: ["rama", "aarti", "tulsidas", "ram-navami", "daily"],
    featured: false,
    imageUrl: fest("ram-navami"),
  },
  {
    slug: "aarti-kunj-bihari-ki",
    type: "AARTI",
    titleEn: "Aarti Kunj Bihari Ki",
    titleHi: "आरती कुंजबिहारी की",
    deityEn: "Lord Krishna",
    deityHi: "भगवान श्रीकृष्ण",
    bodyHi: `॥ आरती ॥

आरती कुंजबिहारी की, श्री गिरिधर कृष्णमुरारी की॥

गले में बैजन्ती माला, बजावै मुरली मधुर बाला।
श्रवण में कुण्डल झलकाला, नन्द के आनन्द नन्दलाला॥
गगन सम अंग कान्ति काली, राधिका चमक रही आली।
लतन में ठाढ़े बनमाली, भ्रमर सी अलक कस्तूरी तिलक चन्द्र सा शोभित है॥
आरती कुंजबिहारी की, श्री गिरिधर कृष्णमुरारी की॥

कनकमय मोर मुकुट बिलसै, देवता दरसन को तरसैं।
गगन सों सुमन रासि बरसै, बजे मुरचंग मधुर मृदंग ग्वालिन संग॥
अतुल रति गोप कुमारी, श्री राधिका प्यारी।
मुरली की धुन सुन रही, आरती कुंजबिहारी की॥
श्री गिरिधर कृष्णमुरारी की॥

जहाँ ते प्रकट भई गंगा, कलुष कलि हारिणी श्री गंगा।
स्मरण ते होत मोह भंगा, बसी शिव सीस जटा के बीच हरै अघ कीच॥
चरण छवि श्री बनवारी, आरती कुंजबिहारी की।
श्री गिरिधर कृष्णमुरारी की॥

चमकती उज्ज्वल तट रेणु, बज रही वृन्दावन बेणु।
चहुँ दिसि गोपि ग्वाल धेनु, हँसत मृदु मन्द चाँदनी चन्द कटत भव फन्द॥
टेर सुन दीन दुखारी, आरती कुंजबिहारी की।
श्री गिरिधर कृष्णमुरारी की॥`,
    bodyEn: `Aarti Kunj Bihari ki, Shri Giridhar Krishnamurari ki.

Gale mein baijanti mala, bajavai murali madhur bala.
Shravan mein kundal jhalkala, Nand ke anand Nandlala.
Gagan sam ang kanti kali, Radhika chamak rahi aali.
Latan mein thaadhe Banmali, bhramar si alak kasturi tilak chandra sa shobhit hai.
Aarti Kunj Bihari ki, Shri Giridhar Krishnamurari ki.

Kanakmay mor mukut bilsai, devta darsan ko tarsain.
Gagan son suman raasi barsai, baje murchang madhur mridang gwalin sang.
Atul rati gop kumari, Shri Radhika pyari.
Murali ki dhun sun rahi, aarti Kunj Bihari ki.
Shri Giridhar Krishnamurari ki.

Jahan te prakat bhai Ganga, kalush kali harini Shri Ganga.
Smaran te hot moh bhanga, basi Shiv sees jata ke beech harai agh keech.
Charan chhavi Shri Banwari, aarti Kunj Bihari ki.
Shri Giridhar Krishnamurari ki.

Chamakti ujjwal tat renu, baj rahi Vrindavan benu.
Chahun disi gopi gwal dhenu, hansat mridu mand chandni chand katat bhav phand.
Ter sun deen dukhari, aarti Kunj Bihari ki.
Shri Giridhar Krishnamurari ki.

Meaning: The aarti of the Lord who wanders the kunj groves of Vrindavan, sung nightly at Banke Bihari and in every Krishna temple. It is almost entirely a portrait: the vaijayanti garland at his throat, the flute at his lips, earrings flashing, a body dark as the sky beside the golden radiance of Radha, a musk tilak and curls like bees on his forehead, a peacock-feather crown the devas long to see. The third verse turns to his feet — the same feet from which Ganga sprang, the river Shiva holds in his matted hair, whose mere remembrance breaks delusion. The last verse is Vrindavan itself: shining sand on the Yamuna bank, cows and gopis on all sides, and a soft moonlit smile that cuts the knot of worldly bondage. Sung at Janmashtami and at the evening aarti of Krishna.`,
    tags: ["krishna", "aarti", "vrindavan", "janmashtami", "evening"],
    featured: false,
    imageUrl: fest("krishna-janmashtami"),
  },
  {
    slug: "aarti-jai-santoshi-mata",
    type: "AARTI",
    titleEn: "Jai Santoshi Mata",
    titleHi: "जय सन्तोषी माता",
    deityEn: "Goddess Santoshi Mata",
    deityHi: "माँ सन्तोषी",
    bodyHi: `॥ आरती ॥

जय सन्तोषी माता, मैया जय सन्तोषी माता।
अपने सेवक जन को, सुख सम्पत्ति दाता॥
जय सन्तोषी माता॥

सुन्दर चीर सुनहरी, माँ धारण कीन्हो।
हीरा पन्ना दमके, तन शृंगार लीन्हो॥
जय सन्तोषी माता॥

गेरू लाल छटा छवि, बदन कमल सोहे।
मन्द हँसत करुणामयी, त्रिभुवन मन मोहे॥
जय सन्तोषी माता॥

स्वर्ण सिंहासन बैठी, चँवर ढुरे प्यारे।
धूप दीप मधु मेवा, भोग धरे न्यारे॥
जय सन्तोषी माता॥

गुड़ अरु चना परम प्रिय, तामें सन्तोष कियो।
सन्तोषी कहलाई, भक्तन वैभव दियो॥
जय सन्तोषी माता॥

शुक्रवार प्रिय मानत, आज दिवस सोही।
भक्त मण्डली छाई, कथा सुनत मोही॥
जय सन्तोषी माता॥

मन्दिर जगमग ज्योति, मंगल ध्वनि छाई।
विनय करें हम सेवक, चरणन सिर नाई॥
जय सन्तोषी माता॥

भक्ति भावमय पूजा, अंगीकृत कीजै।
जो मन बसे हमारे, इच्छा फल दीजै॥
जय सन्तोषी माता॥

दुखी दारिद्री रोगी, संकट मुक्त किए।
बहु धन धान्य भरे घर, सुख सौभाग्य दिए॥
जय सन्तोषी माता॥

ध्यान धरे जो तेरा, वाञ्छित फल पायो।
पूजा कथा श्रवण कर, घर आनन्द छायो॥
जय सन्तोषी माता॥

शरण गहे की लज्जा, राखो जगदम्बे।
संकट तू ही निवारे, दयामयी अम्बे॥
जय सन्तोषी माता॥

सन्तोषी माता की आरती, जो कोई नर गावे।
ऋद्धि सिद्धि सुख सम्पत्ति, जी भर के पावे॥
जय सन्तोषी माता॥`,
    bodyEn: `Jai Santoshi Mata, maiya Jai Santoshi Mata.
Apne sevak jan ko, sukh sampatti data.
Jai Santoshi Mata.

Sundar cheer sunahari, maa dharan keenho.
Heera panna damke, tan shringar leenho.
Jai Santoshi Mata.

Geru laal chhata chhavi, badan kamal sohe.
Mand hansat karunamayi, tribhuvan man mohe.
Jai Santoshi Mata.

Swarn sinhasan baithi, chanwar dhure pyare.
Dhoop deep madhu mewa, bhog dhare nyare.
Jai Santoshi Mata.

Gud aru chana param priya, tamein santosh kiyo.
Santoshi kahlai, bhaktan vaibhav diyo.
Jai Santoshi Mata.

Shukravar priya manat, aaj divas sohi.
Bhakt mandali chhai, katha sunat mohi.
Jai Santoshi Mata.

Mandir jagmag jyoti, mangal dhwani chhai.
Vinay karein hum sevak, charanan sir nai.
Jai Santoshi Mata.

Bhakti bhavmay pooja, angikrit keejai.
Jo man base hamare, ichchha phal deejai.
Jai Santoshi Mata.

Dukhi daridri rogi, sankat mukt kiye.
Bahu dhan dhanya bhare ghar, sukh saubhagya diye.
Jai Santoshi Mata.

Dhyan dhare jo tera, vanchhit phal payo.
Pooja katha shravan kar, ghar anand chhayo.
Jai Santoshi Mata.

Sharan gahe ki lajja, rakho Jagdambe.
Sankat tu hi nivare, dayamayi Ambe.
Jai Santoshi Mata.

Santoshi Mata ki aarti, jo koi nar gave.
Riddhi siddhi sukh sampatti, ji bhar ke pave.
Jai Santoshi Mata.

Meaning: The aarti of Santoshi Mata, the goddess of contentment, sung at the end of the sixteen-Friday vrat. The verses describe her golden robe, diamond and emerald ornaments, her lotus face with a gentle compassionate smile, and her golden throne fanned with chamars. The fifth verse names the vrat's whole discipline: gur and chana are her dearest offering — she was satisfied with them, and from that satisfaction she is called Santoshi and gives her devotees abundance. Friday is her day, when the vrat katha is heard in a circle of devotees and no sour food is taken. The closing verse promises riddhi, siddhi, happiness and prosperity in full measure to whoever sings it.`,
    tags: ["santoshi-mata", "aarti", "friday", "vrat", "contentment"],
    featured: false,
    imageUrl: svc("durga-saptashati-path-kamakhya"),
  },
  {
    slug: "aarti-jai-jai-shri-shani-dev",
    type: "AARTI",
    titleEn: "Jai Jai Shri Shani Dev",
    titleHi: "जय जय श्री शनिदेव",
    deityEn: "Lord Shani",
    deityHi: "शनिदेव",
    bodyHi: `॥ आरती ॥

जय जय श्री शनिदेव भक्तन हितकारी।
सूरज के पुत्र प्रभु छाया महतारी॥
जय जय श्री शनिदेव॥

श्याम अंग वक्र-दृष्टि चतुर्भुजा धारी।
नीलाम्बर धार नाथ गज की असवारी॥
जय जय श्री शनिदेव॥

क्रीट मुकुट शीश राजित दिपत है लिलारी।
मुक्तन की माला गले शोभित बलिहारी॥
जय जय श्री शनिदेव॥

मोदक मिष्ठान पान चढ़त हैं सुपारी।
लोहा तिल तेल उड़द महिषी अति प्यारी॥
जय जय श्री शनिदेव॥

देव दनुज ऋषि मुनि सुमिरत नर नारी।
विश्वनाथ धरत ध्यान शरण हैं तुम्हारी॥
जय जय श्री शनिदेव भक्तन हितकारी।
सूरज के पुत्र प्रभु छाया महतारी॥`,
    bodyEn: `Jai Jai Shri Shanidev bhaktan hitkari.
Suraj ke putra prabhu Chhaya mahtari.
Jai Jai Shri Shanidev.

Shyam ang vakra-drishti chaturbhuja dhari.
Neelambar dhar nath gaj ki asawari.
Jai Jai Shri Shanidev.

Kreet mukut sheesh rajit dipat hai lilari.
Muktan ki mala gale shobhit balihari.
Jai Jai Shri Shanidev.

Modak mishthan paan chadhat hain supari.
Loha til tel urad mahishi ati pyari.
Jai Jai Shri Shanidev.

Dev danuj rishi muni sumirat nar nari.
Vishwanath dharat dhyan sharan hain tumhari.
Jai Jai Shri Shanidev bhaktan hitkari.
Suraj ke putra prabhu Chhaya mahtari.

Meaning: The aarti of Shanidev, son of Surya and Chhaya, sung on Saturdays and on Shani Amavasya and Shani Jayanti. It describes him exactly as he stands in the shrine — dark-limbed, four-armed, with the sidelong glance that decides fortunes, blue robes, a crown on his head, a pearl garland at his throat and the buffalo or elephant as his mount. The fourth verse lists what is actually offered to him: modak, sweets, betel leaf and supari, and the iron, black sesame, mustard oil and urad dal that every Shani abhishek uses. The closing line places even Vishwanath in meditation upon him, and the devotee simply takes refuge. Recited after lighting a mustard-oil lamp under a peepal tree on Saturday evening.`,
    tags: ["shani", "aarti", "saturday", "sade-sati", "dosh-nivaran"],
    featured: false,
    imageUrl: svc("shani-sade-sati-shanti-shingnapur"),
  },
  {
    slug: "aarti-om-jai-surya-bhagwan",
    type: "AARTI",
    titleEn: "Om Jai Surya Bhagwan",
    titleHi: "ॐ जय सूर्य भगवान",
    deityEn: "Lord Surya",
    deityHi: "भगवान सूर्य",
    bodyHi: `॥ आरती ॥

ॐ जय सूर्य भगवान, जय हो दिनकर भगवान।
जगत के नेत्रस्वरूपा, तुम हो त्रिगुण स्वरूपा।
धरत सब ही तव ध्यान॥
ॐ जय सूर्य भगवान॥

सारथी अरुण हैं प्रभु तुम, श्वेत कमलधारी।
तुम चार भुजाधारी॥
अश्व हैं सात तुम्हारे, कोटि किरण पसारे।
तुम हो देव महान॥
ॐ जय सूर्य भगवान॥

ऊषाकाल में जब तुम, उदयाचल आते।
सब तब दर्शन पाते॥
फैलाते उजियारा, जागता तब जग सारा।
करे सब तव गुणगान॥
ॐ जय सूर्य भगवान॥

सन्ध्या में भुवनेश्वर, अस्ताचल जाते।
गोधन तब घर आते॥
गोधूलि बेला में, हर घर हर आँगन में।
हो तव महिमा गान॥
ॐ जय सूर्य भगवान॥

देव दनुज नर नारी, ऋषि मुनि तव ध्यानी।
करते तव अगवानी॥
अर्घ्य जल ले धारा, जपते गायत्री प्यारा।
पावें सुख निधान॥
ॐ जय सूर्य भगवान, जय हो दिनकर भगवान॥`,
    bodyEn: `Om Jai Surya Bhagwan, jai ho Dinkar Bhagwan.
Jagat ke netraswaroopa, tum ho trigun swaroopa.
Dharat sab hi tav dhyan.
Om Jai Surya Bhagwan.

Sarathi Arun hain prabhu tum, shwet kamaldhari.
Tum chaar bhujadhari.
Ashwa hain saat tumhare, koti kiran pasare.
Tum ho dev mahan.
Om Jai Surya Bhagwan.

Ushakal mein jab tum, udayachal aate.
Sab tab darshan paate.
Phailate ujiyara, jagta tab jag sara.
Kare sab tav gungan.
Om Jai Surya Bhagwan.

Sandhya mein Bhuvaneshwar, astachal jaate.
Godhan tab ghar aate.
Godhuli bela mein, har ghar har aangan mein.
Ho tav mahima gaan.
Om Jai Surya Bhagwan.

Dev danuj nar nari, rishi muni tav dhyani.
Karte tav agwani.
Arghya jal le dhara, japte Gayatri pyara.
Paavein sukh nidhan.
Om Jai Surya Bhagwan, jai ho Dinkar Bhagwan.

Meaning: The Sunday aarti of Surya Narayan, the visible deity — "the eye of the world" and the form of all three gunas. The verses picture his chariot: Arun the charioteer, seven horses, a white lotus in his hand, four arms, and a crore of rays spread across the sky. Two verses mark the two sandhyas — at dawn he rises over Udayachal and the whole world wakes and praises him; at dusk he descends to Astachal as the cattle return home and every courtyard sings his glory. The last verse names the actual practice: offering arghya, a stream of water poured toward the rising sun, while japing the Gayatri. Recited on Sundays, at Ratha Saptami and on Makar Sankranti.`,
    tags: ["surya", "aarti", "sunday", "makar-sankranti", "health"],
    featured: false,
    imageUrl: fest("makar-sankranti"),
  },
  {
    slug: "aarti-sai-baba",
    type: "AARTI",
    titleEn: "Aarti Sai Baba (Saukhya Datar Jeeva)",
    titleHi: "आरती साईबाबा",
    deityEn: "Shirdi Sai Baba",
    deityHi: "शिरडी साईंबाबा",
    bodyHi: `॥ आरती ॥

आरती साईबाबा। सौख्यदातार जीवा।
चरणरजातली। द्यावा दासा विसावा॥
भक्ता विसावा। आरती साईबाबा॥

जाळुनियां अनंग। स्वस्वरूपी राहे दंग।
मुमुक्षुजनां दावी। निज डोळा श्रीरंग॥
डोळा श्रीरंग। आरती साईबाबा॥

जया मनी जैसा भाव। तया तैसा अनुभव।
दाविसी दयाघना। ऐसी तुझी ही माव॥
तुझी ही माव। आरती साईबाबा॥

तुमचे नाम ध्याता। हरे संसृति व्यथा।
अगाध तव करणी। मार्ग दाविसी अनाथा॥
दाविसी अनाथा। आरती साईबाबा॥

कलियुगी अवतार। सगुण परब्रह्म साचार।
अवतीर्ण झालासे। स्वामी दत्त दिगम्बर॥
दत्त दिगम्बर। आरती साईबाबा॥

आठां दिवसा गुरुवारी। भक्त करिती वारी।
प्रभुपद पहावया। भवभय निवारी॥
भय निवारी। आरती साईबाबा॥

माझा निजद्रव्य ठेवा। तव चरणरज सेवा।
मागणे हेचि आता। तुम्हा देवाधिदेवा॥
देवाधिदेवा। आरती साईबाबा॥

इच्छित दीन चातक। निर्मल तोय निजसुख।
पाजावे माधवा या। सांभाळ आपुली भाक॥
आपुली भाक। आरती साईबाबा॥

आरती साईबाबा। सौख्यदातार जीवा।
चरणरजातली। द्यावा दासा विसावा॥`,
    bodyEn: `Aarti Saibaba, saukhyadatar jeeva.
Charanarajatali, dyava dasa visava.
Bhakta visava, aarti Saibaba.

Jaaluniya anang, swaswaroopi rahe dang.
Mumukshujana daavi, nija dola Shreeranga.
Dola Shreeranga, aarti Saibaba.

Jaya mani jaisa bhaav, taya taisa anubhav.
Daavisi dayaghana, aisi tujhi hi maav.
Tujhi hi maav, aarti Saibaba.

Tumche naam dhyata, hare sansriti vyatha.
Agadha tava karani, marg daavisi anatha.
Daavisi anatha, aarti Saibaba.

Kaliyugi avatar, saguna Parabrahma sachar.
Avateerna jhalase, swami Datta Digambar.
Datta Digambar, aarti Saibaba.

Aathan divasa guruvari, bhakta kariti vaari.
Prabhupada pahavaya, bhavabhaya nivari.
Bhaya nivari, aarti Saibaba.

Majha nijadravya theva, tava charanaraja seva.
Magane hechi aata, tumha Devadhideva.
Devadhideva, aarti Saibaba.

Ichchhita deena chataka, nirmala toya nijasukha.
Pajave Madhava ya, sambhal aapuli bhaak.
Aapuli bhaak, aarti Saibaba.

Aarti Saibaba, saukhyadatar jeeva.
Charanarajatali, dyava dasa visava.

Meaning: The dhoop aarti of Shirdi Sai Baba, composed in Marathi and sung at the Samadhi Mandir four times daily. Baba is addressed as the giver of well-being to every living creature, and the one request repeated in every verse is simply rest at the dust of his feet. He is described as having burnt desire away and remaining absorbed in his own true nature, showing seekers the Lord within their own eyes; whatever attitude a devotee carries in the mind, that is the experience Baba grants — this, the verse says, is his wonderful play. He is named an avatar of the Kaliyuga, Datta Digambar himself, and Thursday is the day devotees make their pilgrimage to him. The last verse is the devotee as a chataka bird, asking only for the pure water of his grace.`,
    tags: ["sai-baba", "aarti", "thursday", "shirdi", "peace"],
    featured: false,
    imageUrl: svc("satyanarayan-katha-online"),
  },
  // ───────────────────────────── CHALISA ─────────────────────────────
  {
    slug: "hanuman-chalisa",
    type: "CHALISA",
    titleEn: "Hanuman Chalisa",
    titleHi: "श्री हनुमान चालीसा",
    deityEn: "Lord Hanuman",
    deityHi: "भगवान हनुमान",
    bodyHi: `॥ दोहा ॥

श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि।
बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥

बुद्धिहीन तनु जानिके सुमिरौं पवन-कुमार।
बल बुधि बिद्या देहु मोहिं हरहु कलेस बिकार॥

॥ चौपाई ॥

जय हनुमान ज्ञान गुण सागर। जय कपीस तिहुँ लोक उजागर॥१॥
राम दूत अतुलित बल धामा। अंजनि-पुत्र पवनसुत नामा॥२॥
महाबीर बिक्रम बजरंगी। कुमति निवार सुमति के संगी॥३॥
कंचन बरन बिराज सुबेसा। कानन कुण्डल कुंचित केसा॥४॥
हाथ बज्र औ ध्वजा बिराजै। काँधे मूँज जनेऊ साजै॥५॥
संकर सुवन केसरीनन्दन। तेज प्रताप महा जग बन्दन॥६॥
बिद्यावान गुनी अति चातुर। राम काज करिबे को आतुर॥७॥
प्रभु चरित्र सुनिबे को रसिया। राम लखन सीता मन बसिया॥८॥
सूक्ष्म रूप धरि सियहिं दिखावा। बिकट रूप धरि लंक जरावा॥९॥
भीम रूप धरि असुर सँहारे। रामचन्द्र के काज सँवारे॥१०॥
लाय सजीवन लखन जियाये। श्रीरघुबीर हरषि उर लाये॥११॥
रघुपति कीन्ही बहुत बड़ाई। तुम मम प्रिय भरतहि सम भाई॥१२॥
सहस बदन तुम्हरो जस गावैं। अस कहि श्रीपति कण्ठ लगावैं॥१३॥
सनकादिक ब्रह्मादि मुनीसा। नारद सारद सहित अहीसा॥१४॥
जम कुबेर दिगपाल जहाँ ते। कबि कोबिद कहि सके कहाँ ते॥१५॥
तुम उपकार सुग्रीवहिं कीन्हा। राम मिलाय राज पद दीन्हा॥१६॥
तुम्हरो मन्त्र बिभीषन माना। लंकेस्वर भए सब जग जाना॥१७॥
जुग सहस्र जोजन पर भानू। लील्यो ताहि मधुर फल जानू॥१८॥
प्रभु मुद्रिका मेलि मुख माहीं। जलधि लाँघि गये अचरज नाहीं॥१९॥
दुर्गम काज जगत के जेते। सुगम अनुग्रह तुम्हरे तेते॥२०॥
राम दुआरे तुम रखवारे। होत न आज्ञा बिनु पैसारे॥२१॥
सब सुख लहै तुम्हारी सरना। तुम रच्छक काहू को डर ना॥२२॥
आपन तेज सम्हारो आपै। तीनों लोक हाँक तें काँपै॥२३॥
भूत पिसाच निकट नहिं आवै। महाबीर जब नाम सुनावै॥२४॥
नासै रोग हरै सब पीरा। जपत निरन्तर हनुमत बीरा॥२५॥
संकट तें हनुमान छुड़ावै। मन क्रम बचन ध्यान जो लावै॥२६॥
सब पर राम तपस्वी राजा। तिन के काज सकल तुम साजा॥२७॥
और मनोरथ जो कोई लावै। सोइ अमित जीवन फल पावै॥२८॥
चारों जुग परताप तुम्हारा। है परसिद्ध जगत उजियारा॥२९॥
साधु सन्त के तुम रखवारे। असुर निकन्दन राम दुलारे॥३०॥
अष्ट सिद्धि नौ निधि के दाता। अस बर दीन जानकी माता॥३१॥
राम रसायन तुम्हरे पासा। सदा रहो रघुपति के दासा॥३२॥
तुम्हरे भजन राम को पावै। जनम जनम के दुख बिसरावै॥३३॥
अन्त काल रघुबर पुर जाई। जहाँ जन्म हरि-भक्त कहाई॥३४॥
और देवता चित्त न धरई। हनुमत सेइ सर्ब सुख करई॥३५॥
संकट कटै मिटै सब पीरा। जो सुमिरै हनुमत बलबीरा॥३६॥
जै जै जै हनुमान गोसाईं। कृपा करहु गुरुदेव की नाईं॥३७॥
जो सत बार पाठ कर कोई। छूटहि बन्दि महा सुख होई॥३८॥
जो यह पढ़ै हनुमान चालीसा। होय सिद्धि साखी गौरीसा॥३९॥
तुलसीदास सदा हरि चेरा। कीजै नाथ हृदय महँ डेरा॥४०॥

॥ दोहा ॥

पवनतनय संकट हरन मंगल मूरति रूप।
राम लखन सीता सहित हृदय बसहु सुर भूप॥`,
    bodyEn: `Doha

Shriguru charan saroj raj nij manu mukuru sudhari.
Baranau Raghubar bimal jasu jo dayaku phal chari.

Buddhiheen tanu janike sumirau Pavan-Kumar.
Bal budhi bidya dehu mohi harahu kales bikar.

Chaupai

Jai Hanuman gyan gun sagar. Jai Kapis tihun lok ujagar. (1)
Ram doot atulit bal dhama. Anjani-putra Pavansut nama. (2)
Mahabir Bikram Bajrangi. Kumati nivar sumati ke sangi. (3)
Kanchan baran biraj subesa. Kanan kundal kunchit kesa. (4)
Haath bajra au dhwaja birajai. Kandhe moonj janeu sajai. (5)
Sankar suvan Kesarinandan. Tej pratap maha jag bandan. (6)
Bidyavan guni ati chatur. Ram kaj karibe ko aatur. (7)
Prabhu charitra sunibe ko rasiya. Ram Lakhan Sita man basiya. (8)
Sukshma roop dhari Siyahi dikhava. Bikat roop dhari Lank jarava. (9)
Bhim roop dhari asur sanhare. Ramchandra ke kaj sanware. (10)
Laay Sajivan Lakhan jiyaye. Shri Raghubir harashi ur laye. (11)
Raghupati keenhi bahut badai. Tum mam priya Bharatahi sam bhai. (12)
Sahas badan tumharo jas gavain. As kahi Shripati kanth lagavain. (13)
Sanakadik Brahmadi Munisa. Narad Sarad sahit Ahisa. (14)
Jam Kuber Digpal jahan te. Kabi kobid kahi sake kahan te. (15)
Tum upkar Sugrivahi keenha. Ram milaay raj pad deenha. (16)
Tumharo mantra Bibhishan mana. Lankeshwar bhaye sab jag jana. (17)
Jug sahastra jojan par Bhanu. Leelyo tahi madhur phal janu. (18)
Prabhu mudrika meli mukh mahin. Jaladhi langhi gaye achraj nahin. (19)
Durgam kaj jagat ke jete. Sugam anugrah tumhre tete. (20)
Ram duware tum rakhware. Hot na aagya binu paisare. (21)
Sab sukh lahai tumhari sarna. Tum rachchhak kahu ko dar na. (22)
Aapan tej samharo aapai. Teenon lok haank te kanpai. (23)
Bhoot pisach nikat nahin aavai. Mahabir jab naam sunavai. (24)
Nasai rog harai sab peera. Japat nirantar Hanumat beera. (25)
Sankat te Hanuman chhudavai. Man kram bachan dhyan jo lavai. (26)
Sab par Ram tapasvi raja. Tin ke kaj sakal tum saja. (27)
Aur manorath jo koi lavai. Soi amit jeevan phal pavai. (28)
Charon jug partap tumhara. Hai parsiddh jagat ujiyara. (29)
Sadhu sant ke tum rakhware. Asur nikandan Ram dulare. (30)
Ashta siddhi nau nidhi ke data. As bar deen Janaki mata. (31)
Ram rasayan tumhre pasa. Sada raho Raghupati ke dasa. (32)
Tumhre bhajan Ram ko pavai. Janam janam ke dukh bisravai. (33)
Ant kaal Raghubar pur jai. Jahan janm Hari-bhakt kahai. (34)
Aur devta chitt na dharai. Hanumat sei sarb sukh karai. (35)
Sankat katai mitai sab peera. Jo sumirai Hanumat balbeera. (36)
Jai Jai Jai Hanuman Gosain. Kripa karahu Gurudev ki nain. (37)
Jo sat baar path kar koi. Chhootahi bandi maha sukh hoi. (38)
Jo yah padhai Hanuman Chalisa. Hoy siddhi sakhi Gaurisa. (39)
Tulsidas sada Hari chera. Keejai Nath hriday mahan dera. (40)

Doha

Pavantanay sankat haran mangal murati roop.
Ram Lakhan Sita sahit hriday basahu sur bhoop.

Meaning: Tulsidas's forty verses to Hanuman are the most recited Hindi devotional text in the world. After bowing to the guru's feet and asking Hanuman himself for strength, intellect and knowledge, the poet praises him as the ocean of wisdom, the messenger of Rama, son of Anjani and of the wind, whose body is golden, who carries the vajra and the flag and wears the sacred thread of munj grass. The middle verses recount his deeds — taking a tiny form before Sita and a terrible one to burn Lanka, carrying the Sanjivani to revive Lakshman, restoring Sugriva's kingdom, crowning Vibhishan, leaping the ocean with Rama's ring in his mouth, and swallowing the sun as a sweet fruit. The last third is the devotee's own petition: with Hanuman as gatekeeper of Rama's door, no danger comes near, ghosts and spirits flee at the name Mahavir, disease and pain end with constant japa, and the eight siddhis and nine nidhis he received from Janaki Mata become his to give. Recited on Tuesdays and Saturdays, at dawn or dusk, facing a Hanuman murti with a chameli-oil lamp; a hundred readings are traditionally said to break every bondage.`,
    tags: ["hanuman", "chalisa", "tuesday", "saturday", "protection", "tulsidas"],
    featured: true,
    imageUrl: svc("hanuman-sunderkand-sankat-mochan"),
  },
  {
    slug: "durga-chalisa",
    type: "CHALISA",
    titleEn: "Durga Chalisa",
    titleHi: "श्री दुर्गा चालीसा",
    deityEn: "Goddess Durga",
    deityHi: "माँ दुर्गा",
    bodyHi: `॥ चौपाई ॥

नमो नमो दुर्गे सुख करनी। नमो नमो अम्बे दुख हरनी॥१॥
निराकार है ज्योति तुम्हारी। तिहूँ लोक फैली उजियारी॥२॥
शशि ललाट मुख महाविशाला। नेत्र लाल भृकुटी विकराला॥३॥
रूप मातु को अधिक सुहावे। दरश करत जन अति सुख पावे॥४॥
तुम संसार शक्ति लय कीना। पालन हेतु अन्न धन दीना॥५॥
अन्नपूर्णा हुई जग पाला। तुम ही आदि सुन्दरी बाला॥६॥
प्रलयकाल सब नाशन हारी। तुम गौरी शिवशंकर प्यारी॥७॥
शिव योगी तुम्हरे गुण गावें। ब्रह्मा विष्णु तुम्हें नित ध्यावें॥८॥
रूप सरस्वती को तुम धारा। दे सुबुद्धि ऋषि मुनिन उबारा॥९॥
धरा रूप नरसिंह को अम्बा। परगट भईं फाड़कर खम्बा॥१०॥
रक्षा करि प्रह्लाद बचायो। हिरण्याक्ष को स्वर्ग पठायो॥११॥
लक्ष्मी रूप धरो जग माहीं। श्री नारायण अंग समाहीं॥१२॥
क्षीरसिन्धु में करत विलासा। दयासिन्धु दीजै मन आसा॥१३॥
हिंगलाज में तुम्हीं भवानी। महिमा अमित न जात बखानी॥१४॥
मातंगी अरु धूमावति माता। भुवनेश्वरी बगला सुखदाता॥१५॥
श्री भैरव तारा जग तारिणि। छिन्न भाल भव दुःख निवारिणि॥१६॥
केहरि वाहन सोह भवानी। लांगुर वीर चलत अगवानी॥१७॥
कर में खप्पर खड्ग विराजै। जाको देख काल डर भाजै॥१८॥
सोहे अस्त्र और त्रिशूला। जाते उठत शत्रु हिय शूला॥१९॥
नगरकोट में तुम्हीं विराजत। तिहुँ लोक में डंका बाजत॥२०॥
शुम्भ निशुम्भ दानव तुम मारे। रक्तबीज शंखन संहारे॥२१॥
महिषासुर नृप अति अभिमानी। जेहि अघ भार मही अकुलानी॥२२॥
रूप कराल कालिका धारा। सेन सहित तुम तिहि संहारा॥२३॥
परी गाढ़ सन्तन पर जब जब। भई सहाय मातु तुम तब तब॥२४॥
अमरपुरी अरु बासव लोका। तब महिमा सब रहें अशोका॥२५॥
ज्वाला में है ज्योति तुम्हारी। तुम्हें सदा पूजें नर नारी॥२६॥
प्रेम भक्ति से जो यश गावें। दुःख दारिद्र निकट नहिं आवें॥२७॥
ध्यावे तुम्हें जो नर मन लाई। जन्म-मरण ताकौ छुटि जाई॥२८॥
जोगी सुर मुनि कहत पुकारी। योग न हो बिन शक्ति तुम्हारी॥२९॥
शंकर आचारज तप कीनो। काम अरु क्रोध जीति सब लीनो॥३०॥
निशिदिन ध्यान धरो शंकर को। काहु काल नहिं सुमिरो तुमको॥३१॥
शक्ति रूप को मरम न पायो। शक्ति गई तब मन पछितायो॥३२॥
शरणागत हुई कीर्ति बखानी। जय जय जय जगदम्ब भवानी॥३३॥
भई प्रसन्न आदि जगदम्बा। दई शक्ति नहिं कीन विलम्बा॥३४॥
मोको मातु कष्ट अति घेरो। तुम बिन कौन हरै दुःख मेरो॥३५॥
आशा तृष्णा निपट सतावें। मोह मदादिक सब बिनशावें॥३६॥
शत्रु नाश कीजै महारानी। सुमिरौं इकचित तुम्हें भवानी॥३७॥
करो कृपा हे मातु दयाला। ऋद्धि सिद्धि दै करहु निहाला॥३८॥
जब लगि जिऊँ दया फल पाऊँ। तुम्हरो यश मैं सदा सुनाऊँ॥३९॥
दुर्गा चालीसा जो नित गावै। सब सुख भोग परमपद पावै॥४०॥

॥ दोहा ॥

देवीदास शरण निज जानी। करहु कृपा जगदम्ब भवानी॥`,
    bodyEn: `Chaupai

Namo namo Durge sukh karani. Namo namo Ambe dukh harani. (1)
Nirakar hai jyoti tumhari. Tihun lok phaili ujiyari. (2)
Shashi lalat mukh mahavishala. Netra laal bhrikuti vikarala. (3)
Roop matu ko adhik suhave. Darash karat jan ati sukh pave. (4)
Tum sansar shakti lay keena. Palan hetu ann dhan deena. (5)
Annapurna hui jag pala. Tum hi Adi Sundari Bala. (6)
Pralaykal sab nashan hari. Tum Gauri Shivshankar pyari. (7)
Shiv yogi tumhre gun gavein. Brahma Vishnu tumhein nit dhyavein. (8)
Roop Saraswati ko tum dhara. De subuddhi rishi munin ubara. (9)
Dhara roop Narsingh ko Amba. Pargat bhaeen phaadkar khamba. (10)
Raksha kari Prahlad bachayo. Hiranyaksha ko swarg pathayo. (11)
Lakshmi roop dharo jag mahin. Shri Narayan ang samahin. (12)
Ksheersindhu mein karat vilasa. Dayasindhu deejai man asa. (13)
Hinglaj mein tumhin Bhavani. Mahima amit na jaat bakhani. (14)
Matangi aru Dhumavati mata. Bhuvaneshwari Bagla sukhdata. (15)
Shri Bhairav Tara jag tarini. Chhinn Bhal bhav dukh nivarini. (16)
Kehari vahan soh Bhavani. Langur veer chalat agwani. (17)
Kar mein khappar khadga virajai. Jako dekh kaal dar bhajai. (18)
Sohe astra aur trishula. Jaate uthat shatru hiya shoola. (19)
Nagarkot mein tumhin virajat. Tihun lok mein danka bajat. (20)
Shumbh Nishumbh danav tum mare. Raktbeej shankhan sanhare. (21)
Mahishasur nrip ati abhimani. Jehi agh bhaar mahi akulani. (22)
Roop karal Kalika dhara. Sen sahit tum tihi sanhara. (23)
Pari gaadh santan par jab jab. Bhai sahay matu tum tab tab. (24)
Amarpuri aru Basav loka. Tab mahima sab rahein ashoka. (25)
Jwala mein hai jyoti tumhari. Tumhein sada poojein nar nari. (26)
Prem bhakti se jo yash gavein. Dukh daridra nikat nahin aavein. (27)
Dhyave tumhein jo nar man lai. Janm-maran tako chhuti jai. (28)
Jogi sur muni kahat pukari. Yog na ho bin shakti tumhari. (29)
Shankar Acharaj tap keeno. Kaam aru krodh jeeti sab leeno. (30)
Nishidin dhyan dharo Shankar ko. Kahu kaal nahin sumiro tumko. (31)
Shakti roop ko maram na payo. Shakti gai tab man pachhitayo. (32)
Sharanagat hui keerti bakhani. Jai jai jai Jagdamb Bhavani. (33)
Bhai prasann Adi Jagdamba. Dai shakti nahin keen vilamba. (34)
Moko matu kasht ati ghero. Tum bin kaun harai dukh mero. (35)
Asha trishna nipat satavein. Moh madadik sab binashavein. (36)
Shatru nash keejai Maharani. Sumirau ikchit tumhein Bhavani. (37)
Karo kripa he matu dayala. Riddhi siddhi dai karahu nihala. (38)
Jab lagi jiun daya phal paun. Tumharo yash main sada sunaun. (39)
Durga Chalisa jo nit gavai. Sab sukh bhog param pad pavai. (40)

Doha

Devidas sharan nij jani. Karahu kripa Jagdamb Bhavani.

Meaning: Forty verses to Durga, opening with the double salutation to the giver of happiness and remover of sorrow. The early verses describe her formless light filling the three worlds and then her visible form — the moon on her brow, wide red eyes, terrible arched brows — before naming the many shapes she takes: Annapurna who feeds the world, Saraswati who gives right understanding, the Narsingh who split the pillar to save Prahlad, Lakshmi beside Narayan in the ocean of milk, and the Mahavidyas Matangi, Dhumavati, Bhuvaneshwari and Bagalamukhi. She is worshipped at Hinglaj, at Nagarkot and in the eternal flame of Jwalaji. The central story is her slaying of Shumbh, Nishumbh, Raktabeej and the proud Mahishasur, and the reminder that even Shankaracharya learned that no yoga succeeds without her Shakti. The last verses turn personal — hope and craving torment me, only you can end my sorrow. Recited daily, and every morning of the nine nights of Navratri.`,
    tags: ["durga", "chalisa", "navratri", "shakti", "protection"],
    featured: true,
    imageUrl: svc("durga-saptashati-path-kamakhya"),
  },
  {
    slug: "shiv-chalisa",
    type: "CHALISA",
    titleEn: "Shiv Chalisa",
    titleHi: "श्री शिव चालीसा",
    deityEn: "Lord Shiva",
    deityHi: "भगवान शिव",
    bodyHi: `॥ दोहा ॥

जय गणेश गिरिजा सुवन मंगल मूल सुजान।
कहत अयोध्यादास तुम देहु अभय वरदान॥

॥ चौपाई ॥

जय गिरिजापति दीनदयाला। सदा करत सन्तन प्रतिपाला॥१॥
भाल चन्द्रमा सोहत नीके। कानन कुण्डल नागफनी के॥२॥
अंग गौर शिर गंग बहाये। मुण्डमाल तन क्षार लगाये॥३॥
वस्त्र खाल बाघम्बर सोहे। छवि को देख नाग मुनि मोहे॥४॥
मैना मातु की हवे दुलारी। बाम अंग सोहत छवि न्यारी॥५॥
कर त्रिशूल सोहत छवि भारी। करत सदा शत्रुन क्षयकारी॥६॥
नन्दि गणेश सोहै तहँ कैसे। सागर मध्य कमल हैं जैसे॥७॥
कार्तिक श्याम और गणराऊ। या छवि को कहि जात न काऊ॥८॥
देवन जबहीं जाय पुकारा। तब ही दुख प्रभु आप निवारा॥९॥
कीन्ह उपद्रव तारक भारी। देवन सब मिलि तुमहिं जुहारी॥१०॥
तुरत षडानन आप पठायउ। लव निमेष महँ मारि गिरायउ॥११॥
आप जलन्धर असुर संहारा। सुयश तुम्हार विदित संसारा॥१२॥
त्रिपुरासुर सन युद्ध मचाई। सबहिं कृपा कर लीन बचाई॥१३॥
किया तपहिं भागीरथ भारी। पुरब प्रतिज्ञा तासु पुरारी॥१४॥
दानिन महँ तुम सम कोउ नाहीं। सेवक स्तुति करत सदाहीं॥१५॥
वेद नाम महिमा तव गाई। अकथ अनादि भेद नहिं पाई॥१६॥
प्रकटी उदधि मन्थन में ज्वाला। जरत सुरासुर भए विहाला॥१७॥
कीन्ह दया तहँ करी सहाई। नीलकण्ठ तब नाम कहाई॥१८॥
पूजन रामचन्द्र जब कीन्हा। जीत के लंक विभीषण दीन्हा॥१९॥
सहस कमल में हो रहे धारी। कीन्ह परीक्षा तबहिं पुरारी॥२०॥
एक कमल प्रभु राखेउ जोई। कमल नयन पूजन चहँ सोई॥२१॥
कठिन भक्ति देखी प्रभु शंकर। भये प्रसन्न दिए इच्छित वर॥२२॥
जय जय जय अनन्त अविनाशी। करत कृपा सब के घटवासी॥२३॥
दुष्ट सकल नित मोहि सतावै। भ्रमत रहौं मोहि चैन न आवै॥२४॥
त्राहि त्राहि मैं नाथ पुकारो। यहि अवसर मोहि आन उबारो॥२५॥
लै त्रिशूल शत्रुन को मारो। संकट से मोहि आन उबारो॥२६॥
मात-पिता भ्राता सब कोई। संकट में पूछत नहिं कोई॥२७॥
स्वामी एक है आस तुम्हारी। आय हरहु मम संकट भारी॥२८॥
धन निर्धन को देत सदा हीं। जो कोई जाँचे सो फल पाहीं॥२९॥
अस्तुति केहि विधि करौं तुम्हारी। क्षमहु नाथ अब चूक हमारी॥३०॥
शंकर हो संकट के नाशन। मंगल कारण विघ्न विनाशन॥३१॥
योगी यति मुनि ध्यान लगावैं। शारद नारद शीश नवावैं॥३२॥
नमो नमो जय नमः शिवाय। सुर ब्रह्मादिक पार न पाय॥३३॥
जो यह पाठ करे मन लाई। ता पर होत है शम्भु सहाई॥३४॥
ऋनियाँ जो कोई हो अधिकारी। पाठ करे सो पावन हारी॥३५॥
पुत्र होन कर इच्छा जोई। निश्चय शिव प्रसाद तेहि होई॥३६॥
पण्डित त्रयोदशी को लावे। ध्यान पूर्वक होम करावे॥३७॥
त्रयोदशी व्रत करै हमेशा। ताके तन नहीं रहै कलेशा॥३८॥
धूप दीप नैवेद्य चढ़ावे। शंकर सम्मुख पाठ सुनावे॥३९॥
जन्म जन्म के पाप नसावे। अन्त धाम शिवपुर में पावे॥४०॥

॥ दोहा ॥

नित नेम कर प्रातः ही पाठ करौं चालीसा।
तुम मेरी मनोकामना पूर्ण करो जगदीश॥
मगसर छठि हेमन्त ऋतु संवत चौसठ जान।
अस्तुति चालीसा शिवहि पूर्ण कीन कल्याण॥`,
    bodyEn: `Doha

Jai Ganesh Girija suvan mangal mool sujan.
Kahat Ayodhyadas tum dehu abhay vardan.

Chaupai

Jai Girijapati Deendayala. Sada karat santan pratipala. (1)
Bhaal chandrama sohat neeke. Kanan kundal nagphani ke. (2)
Ang gaur shir Gang bahaye. Mundmal tan kshar lagaye. (3)
Vastra khal baghambar sohe. Chhavi ko dekh Nag muni mohe. (4)
Maina matu ki have dulari. Baam ang sohat chhavi nyari. (5)
Kar trishool sohat chhavi bhari. Karat sada shatrun kshaykari. (6)
Nandi Ganesh sohai tahan kaise. Sagar madhya kamal hain jaise. (7)
Kartik Shyam aur Ganrau. Ya chhavi ko kahi jaat na kau. (8)
Devan jabahin jaay pukara. Tab hi dukh prabhu aap nivara. (9)
Keenh updrav Tarak bhari. Devan sab mili tumhin juhari. (10)
Turat Shadanan aap pathayau. Lav nimesh mahan mari girayau. (11)
Aap Jalandhar asur sanhara. Suyash tumhar vidit sansara. (12)
Tripurasur san yuddh machai. Sabahin kripa kar leen bachai. (13)
Kiya tapahin Bhagirath bhari. Purab pratigya tasu Purari. (14)
Danin mahan tum sam kou nahin. Sevak stuti karat sadahin. (15)
Ved naam mahima tav gai. Akath anadi bhed nahin pai. (16)
Prakati udadhi manthan mein jwala. Jarat surasur bhaye vihala. (17)
Keenh daya tahan kari sahai. Neelkanth tab naam kahai. (18)
Poojan Ramchandra jab keenha. Jeet ke Lank Vibhishan deenha. (19)
Sahas kamal mein ho rahe dhari. Keenh pariksha tabahin Purari. (20)
Ek kamal prabhu rakheu joi. Kamal nayan poojan chahan soi. (21)
Kathin bhakti dekhi prabhu Shankar. Bhaye prasann diye ichchhit var. (22)
Jai jai jai Anant Avinashi. Karat kripa sab ke ghatvasi. (23)
Dusht sakal nit mohi satavai. Bhramat rahau mohi chain na aavai. (24)
Trahi trahi main Nath pukaro. Yahi avsar mohi aan ubaro. (25)
Lai trishool shatrun ko maro. Sankat se mohi aan ubaro. (26)
Maat-pita bhrata sab koi. Sankat mein poochhat nahin koi. (27)
Swami ek hai aas tumhari. Aay harahu mam sankat bhari. (28)
Dhan nirdhan ko det sada hin. Jo koi janche so phal pahin. (29)
Astuti kehi vidhi karau tumhari. Kshamahu Nath ab chook hamari. (30)
Shankar ho sankat ke nashan. Mangal karan vighn vinashan. (31)
Yogi yati muni dhyan lagavain. Sharad Narad sheesh navavain. (32)
Namo namo jai Namah Shivay. Sur Brahmadik paar na paay. (33)
Jo yah path kare man lai. Ta par hot hai Shambhu sahai. (34)
Rniyan jo koi ho adhikari. Path kare so pavan hari. (35)
Putra hon kar ichchha joi. Nishchay Shiv prasad tehi hoi. (36)
Pandit trayodashi ko lave. Dhyan poorvak hom karave. (37)
Trayodashi vrat karai hamesha. Take tan nahin rahai kalesha. (38)
Dhoop deep naivedya chadhave. Shankar sammukh path sunave. (39)
Janm janm ke paap nasave. Ant dham Shivpur mein pave. (40)

Doha

Nit nem kar pratah hi path karau Chalisa.
Tum meri manokamna poorn karo Jagdish.
Magsar chhathi hemant ritu samvat chausath jaan.
Astuti Chalisa Shivahi poorn keen kalyan.

Meaning: Ayodhyadas's forty verses to Shankar, beginning as every Hindu text does with a bow to Ganesh. The opening portrait is the one every devotee carries — the crescent on his brow, serpent-hood earrings, Ganga flowing from his hair, ash on a fair body, a garland of skulls, the tiger skin, the trident in his hand, with Parvati at his left and Nandi, Ganesh and Kartikeya around him. The middle verses recall his rescues: he sent Shadanan to destroy Tarakasur in an instant, killed Jalandhar and Tripurasur, granted Bhagirath's austerity, and drank the halahal from the churning of the ocean to become Neelkanth. Then comes the famous test of Rama's devotion, when one lotus was missing and Rama offered his own lotus-eye instead. The final verses give the vidhi: recite it every morning with concentration, keep the Trayodashi vrat, offer dhoop, deep and naivedya before Shankar. Recited on Mondays, through Shravan and on Mahashivratri.`,
    tags: ["shiva", "chalisa", "monday", "shravan", "shivratri", "dosh-nivaran"],
    featured: true,
    imageUrl: fest("maha-shivratri"),
  },
  {
    slug: "ganesh-chalisa",
    type: "CHALISA",
    titleEn: "Ganesh Chalisa",
    titleHi: "श्री गणेश चालीसा",
    deityEn: "Lord Ganesha",
    deityHi: "भगवान गणेश",
    bodyHi: `॥ दोहा ॥

जय गणपति सद्गुण सदन कविवर बदन कृपाल।
विघ्न हरण मंगल करण जय जय गिरिजालाल॥

॥ चौपाई ॥

जय जय जय गणपति गणराजू। मंगल भरण करण शुभ काजू॥१॥
जै गजबदन सदन सुखदाता। विश्व विनायक बुद्धि विधाता॥२॥
वक्र तुण्ड शुचि शुण्ड सुहावन। तिलक त्रिपुण्ड भाल मन भावन॥३॥
राजित मणि मुक्तन उर माला। स्वर्ण मुकुट शिर नयन विशाला॥४॥
पुस्तक पाणि कुठार त्रिशूलं। मोदक भोग सुगन्धित फूलं॥५॥
सुन्दर पीताम्बर तन साजित। चरण पादुका मुनि मन राजित॥६॥
धनि शिवसुवन षडानन भ्राता। गौरी ललन विश्व-विख्याता॥७॥
ऋद्धि सिद्धि तव चँवर सुधारे। मूषक वाहन सोहत द्वारे॥८॥
कहौ जन्म शुभ कथा तुम्हारी। अति शुचि पावन मंगलकारी॥९॥
एक समय गिरिराज कुमारी। पुत्र हेतु तप कीन्हो भारी॥१०॥
भयो यज्ञ जब पूर्ण अनूपा। तब पहुँच्यो तुम धरि द्विज रूपा॥११॥
अतिथि जानि कै गौरि सुखारी। बहुविधि सेवा करी तुम्हारी॥१२॥
अति प्रसन्न ह्वै तुम वर दीन्हा। मातु पुत्र हित जो तप कीन्हा॥१३॥
मिलहि पुत्र तुहि बुद्धि विशाला। बिना गर्भ धारण यहि काला॥१४॥
गणनायक गुण ज्ञान निधाना। पूजित प्रथम रूप भगवाना॥१५॥
अस कहि अन्तर्धान रूप ह्वै। पलना पर बालक स्वरूप ह्वै॥१६॥
बनि शिशु रुदन जबहिं तुम ठाना। लखि मुख सुख नहिं गौरि समाना॥१७॥
सकल मगन सुखमंगल गावहिं। नभ ते सुरन सुमन वर्षावहिं॥१८॥
शम्भु उमा बहुदान लुटावहिं। सुर मुनिजन सुत देखन आवहिं॥१९॥
लखि अति आनन्द मंगल साजा। देखन भी आये शनि राजा॥२०॥
निज अवगुण गुनि शनि मन माहीं। बालक देखन चाहत नाहीं॥२१॥
गिरिजा कछु मन भेद बढ़ायो। उत्सव मोर न शनि तुहि भायो॥२२॥
कहन लगे शनि मन सकुचाई। का करिहौ शिशु मोहि दिखाई॥२३॥
नहिं विश्वास उमा उर भयऊ। शनि सों बालक देखन कह्यऊ॥२४॥
पड़तहिं शनि दृग कोण प्रकाशा। बालक शिर उड़ि गयो अकाशा॥२५॥
गिरिजा गिरीं विकल ह्वै धरणी। सो दुख दशा गयो नहिं वरणी॥२६॥
हाहाकार मच्यो कैलाशा। शनि कीन्ह्यो लखि सुत को नाशा॥२७॥
तुरत गरुड़ चढ़ि विष्णु सिधाये। काटि चक्र सो गज शिर लाये॥२८॥
बालक के धड़ ऊपर धारयो। प्राण मन्त्र पढ़ि शंकर डारयो॥२९॥
नाम गणेश शम्भु तब कीन्हे। प्रथम पूज्य बुद्धि निधि वर दीन्हे॥३०॥
बुद्धि परीक्षा जब शिव कीन्हा। पृथ्वी कर प्रदक्षिणा लीन्हा॥३१॥
चले षडानन भरमि भुलाई। रचे बैठ तुम बुद्धि उपाई॥३२॥
चरण मातु-पितु के धर लीन्हें। तिनके सात प्रदक्षिण कीन्हें॥३३॥
धनि गणेश कहि शिव हिय हरषे। नभ ते सुरन सुमन बहु बरसे॥३४॥
तुम्हरी महिमा बुद्धि बड़ाई। शेष सहस मुख सकै न गाई॥३५॥
मैं मति हीन मलीन दुखारी। करहुँ कौन विधि विनय तुम्हारी॥३६॥
भजत रामसुन्दर प्रभुदासा। जग प्रयाग ककरा दुर्वासा॥३७॥
अब प्रभु दया दीन पर कीजै। अपनी शक्ति भक्ति कुछ दीजै॥३८॥

॥ दोहा ॥

श्री गणेश यह चालीसा पाठ करै धर ध्यान।
नित नव मंगल गृह बसै लहे जगत सन्मान॥
सम्बन्ध अपने सहस्र दश ऋषि पंचमी दिनेश।
पूरण चालीसा भयो मंगल मूर्ति गणेश॥`,
    bodyEn: `Doha

Jai Ganapati sadgun sadan kavivar badan kripal.
Vighn haran mangal karan jai jai Girijalal.

Chaupai

Jai jai jai Ganapati Ganraju. Mangal bharan karan shubh kaju. (1)
Jai Gajbadan sadan sukhdata. Vishwa Vinayak buddhi vidhata. (2)
Vakra tund shuchi shund suhavan. Tilak tripund bhaal man bhavan. (3)
Rajit mani muktan ur mala. Swarn mukut shir nayan vishala. (4)
Pustak pani kuthar trishoolam. Modak bhog sugandhit phoolam. (5)
Sundar peetambar tan sajit. Charan paduka muni man rajit. (6)
Dhani Shivsuvan Shadanan bhrata. Gauri lalan vishwa-vikhyata. (7)
Riddhi Siddhi tav chanwar sudhare. Mooshak vahan sohat dware. (8)
Kahau janm shubh katha tumhari. Ati shuchi pavan mangalkari. (9)
Ek samay Giriraj Kumari. Putra hetu tap keenho bhari. (10)
Bhayo yagya jab poorn anoopa. Tab pahunchyo tum dhari dwij roopa. (11)
Atithi jani kai Gauri sukhari. Bahuvidhi seva kari tumhari. (12)
Ati prasann hwai tum var deenha. Matu putra hit jo tap keenha. (13)
Milahi putra tuhi buddhi vishala. Bina garbh dharan yahi kala. (14)
Gannayak gun gyan nidhana. Poojit pratham roop Bhagwana. (15)
As kahi antardhan roop hwai. Palna par balak swaroop hwai. (16)
Bani shishu rudan jabahin tum thana. Lakhi mukh sukh nahin Gauri samana. (17)
Sakal magan sukhmangal gavahin. Nabh te suran suman varshavahin. (18)
Shambhu Uma bahudan lutavahin. Sur munijan sut dekhan aavahin. (19)
Lakhi ati anand mangal saja. Dekhan bhi aaye Shani Raja. (20)
Nij avgun guni Shani man mahin. Balak dekhan chahat nahin. (21)
Girija kachhu man bhed badhayo. Utsav mor na Shani tuhi bhayo. (22)
Kahan lage Shani man sakuchai. Ka karihau shishu mohi dikhai. (23)
Nahin vishwas Uma ur bhayau. Shani son balak dekhan kahyau. (24)
Padtahin Shani drig kon prakasha. Balak shir udi gayo akasha. (25)
Girija gireen vikal hwai dharani. So dukh dasha gayo nahin varani. (26)
Hahakar machyo Kailasha. Shani keenhyo lakhi sut ko nasha. (27)
Turat Garud chadhi Vishnu sidhaye. Kaati chakra so gaj shir laye. (28)
Balak ke dhad oopar dharyo. Praan mantra padhi Shankar daryo. (29)
Naam Ganesh Shambhu tab keenhe. Pratham poojya buddhi nidhi var deenhe. (30)
Buddhi pariksha jab Shiv keenha. Prithvi kar pradakshina leenha. (31)
Chale Shadanan bharmi bhulai. Rache baith tum buddhi upai. (32)
Charan matu-pitu ke dhar leenhein. Tinke saat pradakshin keenhein. (33)
Dhani Ganesh kahi Shiv hiya harshe. Nabh te suran suman bahu barse. (34)
Tumhri mahima buddhi badai. Shesh sahas mukh sakai na gai. (35)
Main mati heen maleen dukhari. Karahun kaun vidhi vinay tumhari. (36)
Bhajat Ramsundar Prabhudasa. Jag Prayag Kakra Durvasa. (37)
Ab prabhu daya deen par keejai. Apni shakti bhakti kuchh deejai. (38)

Doha

Shri Ganesh yah Chalisa path karai dhar dhyan.
Nit nav mangal grih basai lahe jagat sanman.
Sambandh apne sahasra dash rishi panchami Dinesh.
Pooran Chalisa bhayo mangal murti Ganesh.

Meaning: The Chalisa of Ganapati opens with his form — the curved trunk, the tripund tilak, a pearl-and-gem garland, golden crown, the book, axe and trident in his hands, modak for bhog, Riddhi and Siddhi fanning him and the little mouse waiting at the door. The larger half is his birth story: Parvati's austerity for a son, the brahmin who appeared at the completed yagya and granted her a child of vast intelligence without conception; then Shani, who came reluctantly to the celebration because of his own drishti, and whose sidelong glance sent the infant's head flying into the sky. Vishnu rode out on Garuda, brought back an elephant's head, and Shankar restored life with a mantra and gave him the name Ganesh with the boon of being worshipped first. It closes with the contest of intelligence: while Kartikeya circled the earth, Ganesh simply walked seven times around his parents. Recited on Chaturthi, at Ganesh Chaturthi, and before any new beginning.`,
    tags: ["ganesha", "chalisa", "chaturthi", "new-beginnings", "obstacles"],
    featured: false,
    imageUrl: fest("ganesh-chaturthi"),
  },
  {
    slug: "lakshmi-chalisa",
    type: "CHALISA",
    titleEn: "Lakshmi Chalisa",
    titleHi: "श्री लक्ष्मी चालीसा",
    deityEn: "Goddess Lakshmi",
    deityHi: "माँ लक्ष्मी",
    bodyHi: `॥ दोहा ॥

मातु लक्ष्मी करि कृपा, करो हृदय में वास।
मनोकामना सिद्ध करि, परुवहु मेरी आस॥

॥ चौपाई ॥

सिन्धु सुता मैं सुमिरौं तोही। ज्ञान बुद्धि विद्या दो मोही॥
तुम समान नहिं कोई उपकारी। सब विधि पुरवहु आस हमारी॥

जय जय जगत जननि जगदम्बा। सबकी तुम ही हो अवलम्बा॥
तुम ही हो सब घट घट वासी। विनती यही हमारी खासी॥

जगजननी जय सिन्धु कुमारी। दीनन की तुम हो हितकारी॥
विनवौं नित्य तुमहिं महारानी। कृपा करौ जग जननि भवानी॥

केहि विधि स्तुति करौं तिहारी। सुधि लीजै अपराध बिसारी॥
कृपा दृष्टि चितवो मम ओरी। जगजननी विनती सुन मोरी॥

ज्ञान बुद्धि जय सुख की दाता। संकट हरो हमारी माता॥
क्षीरसिन्धु जब विष्णु मथायो। चौदह रत्न सिन्धु में पायो॥

चौदह रत्न में तुम सुखरासी। सेवा कियो प्रभु बनि दासी॥
जब जब जन्म जहाँ प्रभु लीन्हा। रूप बदल तहँ सेवा कीन्हा॥

स्वयं विष्णु जब नर तनु धारा। लीन्हेउ अवधपुरी अवतारा॥
तब तुम प्रकट जनकपुर माहीं। सेवा कियो हृदय पुलकाहीं॥

अपनाया तोहि अन्तर्यामी। वैदेही जग की स्वामिनी॥
तुम सम प्रबल शक्ति नहिं आनी। कहँ लौं महिमा कहौं बखानी॥

मन क्रम वचन करै सेवकाई। मन इच्छित वाञ्छित फल पाई॥
तजि छल कपट और चतुराई। पूजहिं विविध भाँति मन लाई॥

और हाल मैं कहौं तुम्हारा। जो कोई कहै सो पावनहारा॥
जो यह पाठ करै मन लाई। ता पर कृपा होत सुखदाई॥

त्राहि त्राहि जय दुःख निवारिणी। त्रिविध ताप भव बन्धन हारिणी॥
जो चालीसा पढ़ै पढ़ावै। ध्यान लगाकर सुनै सुनावै॥

ता कौ कोई कष्ट न होई। मन इच्छित पावै फल सोई॥
सुख सम्पत्ति घर में भरपूरी। दुःख दारिद्र सब होवै दूरी॥

॥ दोहा ॥

त्राहि त्राहि दुःख हारिणी, हरो वेगि सब त्रास।
जयति जयति जय लक्ष्मी, करो शत्रु का नाश॥

रामदास धरि ध्यान नित, विनय करत कर जोर।
मातु लक्ष्मी दास पर, करहु दया की कोर॥`,
    bodyEn: `Doha

Matu Lakshmi kari kripa, karo hriday mein vaas.
Manokamna siddh kari, paruvahu meri aas.

Chaupai

Sindhu suta main sumirau tohi. Gyan buddhi vidya do mohi.
Tum saman nahin koi upkari. Sab vidhi puravahu aas hamari.

Jai jai jagat janani Jagdamba. Sabki tum hi ho avalamba.
Tum hi ho sab ghat ghat vasi. Vinti yahi hamari khasi.

Jagjanani jai Sindhu Kumari. Deenan ki tum ho hitkari.
Vinvau nitya tumahin Maharani. Kripa karau jag janani Bhavani.

Kehi vidhi stuti karau tihari. Sudhi leejai apradh bisari.
Kripa drishti chitvo mam ori. Jagjanani vinti sun mori.

Gyan buddhi jai sukh ki data. Sankat haro hamari mata.
Ksheersindhu jab Vishnu mathayo. Chaudah ratna sindhu mein payo.

Chaudah ratna mein tum sukhrasi. Seva kiyo prabhu bani dasi.
Jab jab janm jahan prabhu leenha. Roop badal tahan seva keenha.

Swayam Vishnu jab nar tanu dhara. Leenheu Avadhpuri avtara.
Tab tum prakat Janakpur mahin. Seva kiyo hriday pulkahin.

Apnaya tohi Antaryami. Vaidehi jag ki Swamini.
Tum sam prabal shakti nahin aani. Kahan laun mahima kahau bakhani.

Man kram vachan karai sevkai. Man ichchhit vanchhit phal pai.
Taji chhal kapat aur chaturai. Poojahin vividh bhanti man lai.

Aur haal main kahau tumhara. Jo koi kahai so pavanhara.
Jo yah path karai man lai. Ta par kripa hot sukhdai.

Trahi trahi jai dukh nivarini. Trividh taap bhav bandhan harini.
Jo Chalisa padhai padhavai. Dhyan lagakar sunai sunavai.

Ta kau koi kasht na hoi. Man ichchhit pavai phal soi.
Sukh sampatti ghar mein bharpoori. Dukh daridra sab hovai doori.

Doha

Trahi trahi dukh harini, haro vegi sab traas.
Jayati jayati jai Lakshmi, karo shatru ka naash.

Ramdas dhari dhyan nit, vinay karat kar jor.
Matu Lakshmi das par, karahu daya ki kor.

Meaning: The Chalisa of Mahalakshmi, daughter of the ocean, addressed as Jagdamba and as the one who dwells in every heart. The devotee admits he does not know how to praise her properly and asks only that she overlook his faults and turn her kripa-drishti — her glance of grace — toward him. The narrative verses recall her origin: when Vishnu churned the ocean of milk and fourteen jewels rose from it, she was the treasure of joy among them, and thereafter she took a new form to serve the Lord in each of his descents — appearing at Janakpur as Vaidehi when Vishnu was born in Ayodhya. The closing verses give the fruit of the paath: whoever reads it or has it read, with attention and without cunning, is freed of the threefold affliction, and the home fills with prosperity while poverty departs. Recited on Fridays, on Diwali night and through the Lakshmi-Kuber pooja.`,
    tags: ["lakshmi", "chalisa", "friday", "diwali", "wealth", "prosperity"],
    featured: false,
    imageUrl: svc("lakshmi-kuber-yagya"),
  },
  {
    slug: "shani-chalisa",
    type: "CHALISA",
    titleEn: "Shani Chalisa",
    titleHi: "श्री शनि चालीसा",
    deityEn: "Lord Shani",
    deityHi: "शनिदेव",
    bodyHi: `॥ दोहा ॥

जय गणेश गिरिजा सुवन, मंगल करण कृपाल।
दीनन के दुःख दूर करि, कीजै नाथ निहाल॥

जय जय श्री शनिदेव प्रभु, सुनहु विनय महाराज।
करहुँ कृपा हे रवि तनय, राखहु जन की लाज॥

॥ चौपाई ॥

जयति जयति शनिदेव दयाला। करत सदा भक्तन प्रतिपाला॥१॥
चारि भुजा तनु श्याम विराजै। माथे रतन मुकुट छबि छाजै॥२॥
परम विशाल मनोहर भाला। टेढ़ी दृष्टि भृकुटि विकराला॥३॥
कुण्डल श्रवण चमाचम चमके। हिय माल मुक्तन मणि दमके॥४॥
कर में गदा त्रिशूल कुठारा। पल बिच करैं अरिहिं संहारा॥५॥
पिंगल कृष्णो छाया नन्दन। यम कोणस्थ रौद्र दुखभंजन॥६॥
सौरी मन्द शनी दश नामा। भानु पुत्र पूजहिं सब कामा॥७॥
जापर प्रभु प्रसन्न ह्वैं जाहीं। रंकहुँ राव करैं क्षण माहीं॥८॥
पर्वतहू तृण होई निहारत। तृणहू को पर्वत करि डारत॥९॥
राज मिलत बन रामहिं दीन्हयो। कैकेइहुँ की मति हरि लीन्हयो॥१०॥
बनहूँ में मृग कपट दिखाई। मातु जानकी गई चुराई॥११॥
लखनहिं शक्ति विकल करि डारा। मचिगा दल में हाहाकारा॥१२॥
रावण की गति-मति बौराई। रामचन्द्र सों बैर बढ़ाई॥१३॥
दियो कीट करि कंचन लंका। बजि बजरंग बीर की डंका॥१४॥
नृप विक्रम पर तुहि पगु धारा। चित्र मयूर निगलि गै हारा॥१५॥
हार नौलखा लाग्यो चोरी। हाथ पैर डरवायो तोरी॥१६॥
भारी दशा निकृष्ट दिखायो। तेलिहिं घर कोल्हू चलवायो॥१७॥
विनय राग दीपक महँ कीन्हयों। तब प्रसन्न प्रभु ह्वै सुख दीन्हयों॥१८॥
हरिश्चन्द्रहुँ नृप नारि बिकानी। आपहुँ भरे डोम घर पानी॥१९॥
तैसे नल पर दशा सिरानी। भूँजी मीन कूद गईं पानी॥२०॥
श्री शंकरहिं गह्यो जब जाई। पारवती को सती कराई॥२१॥
तनि विलोकत ही करि रीसा। नभ उड़ि गयो गौरिसुत सीसा॥२२॥
पाण्डव पर भै दशा तुम्हारी। बची द्रौपदी होति उघारी॥२३॥
कौरव के भी गति मति मारयो। युद्ध महाभारत करि डारयो॥२४॥
रवि कहँ मुख महँ धरि तत्काला। लेकर कूदि परयो पाताला॥२५॥
शेष देव लखि विनती लाई। रवि को मुख ते दियो छुड़ाई॥२६॥
वाहन प्रभु के सात सुजाना। जग दिग्गज गर्दभ मृग स्वाना॥२७॥
जम्बुक सिंह आदि नख धारी। सो फल ज्योतिष कहत पुकारी॥२८॥
गज वाहन लक्ष्मी गृह आवैं। हय ते सुख सम्पत्ति उपजावैं॥२९॥
गर्दभ हानि करै बहु काजा। सिंह सिद्धकर राज समाजा॥३०॥
जम्बुक बुद्धि नष्ट कर डारै। मृग दे कष्ट प्राण संहारै॥३१॥
जब आवहिं प्रभु स्वान सवारी। चोरी आदि होय डर भारी॥३२॥
तैसहि चारि चरण यह नामा। स्वर्ण लोह चाँदी अरु ताम्रा॥३३॥
लोह चरण पर जब प्रभु आवैं। धन जन सम्पत्ति नष्ट करावैं॥३४॥
समता ताम्र रजत शुभकारी। स्वर्ण सर्वसुख मंगल भारी॥३५॥
जो यह शनि चरित्र नित गावै। कबहुँ न दशा निकृष्ट सतावै॥३६॥
अद्भुत नाथ दिखावैं लीला। करैं शत्रु के नशिब बलि ढीला॥३७॥
जो पण्डित सुयोग्य बुलवाई। विधिवत शनि ग्रह शान्ति कराई॥३८॥
पीपल जल शनि दिवस चढ़ावत। दीप दान दै बहु सुख पावत॥३९॥
कहत रामसुन्दर प्रभु दासा। शनि सुमिरत सुख होत प्रकाशा॥४०॥

॥ दोहा ॥

पाठ शनिश्चर देव को, कीं हों भक्त तैयार।
करत पाठ चालीस दिन, हो भवसागर पार॥`,
    bodyEn: `Doha

Jai Ganesh Girija suvan, mangal karan kripal.
Deenan ke dukh door kari, keejai Nath nihal.

Jai jai Shri Shanidev prabhu, sunahu vinay Maharaj.
Karahun kripa he Ravi tanay, rakhahu jan ki laaj.

Chaupai

Jayati jayati Shanidev dayala. Karat sada bhaktan pratipala. (1)
Chari bhuja tanu shyam virajai. Mathe ratan mukut chhabi chhajai. (2)
Param vishal manohar bhala. Tedhi drishti bhrikuti vikarala. (3)
Kundal shravan chamacham chamke. Hiya maal muktan mani damke. (4)
Kar mein gada trishool kuthara. Pal bich karain arihin sanhara. (5)
Pingal Krishno Chhaya Nandan. Yam Konasth Raudra Dukhbhanjan. (6)
Sauri Mand Shani dash nama. Bhanu putra poojahin sab kama. (7)
Japar prabhu prasann hwain jahin. Rankahun rav karain kshan mahin. (8)
Parvatahu trin hoi niharat. Trinahu ko parvat kari daarat. (9)
Raj milat ban Ramahin deenhyo. Kaikeihun ki mati hari leenhyo. (10)
Banhoon mein mrig kapat dikhai. Matu Janaki gai churai. (11)
Lakhanahin shakti vikal kari daara. Machiga dal mein hahakara. (12)
Ravan ki gati-mati baurai. Ramchandra son bair badhai. (13)
Diyo keet kari kanchan Lanka. Baji Bajrang Beer ki danka. (14)
Nrip Vikram par tuhi pagu dhara. Chitra mayoor nigali gai hara. (15)
Haar naulakha lagyo chori. Haath pair darvayo tori. (16)
Bhari dasha nikrisht dikhayo. Telihin ghar kolhu chalvayo. (17)
Vinay raag deepak mahan keenhyon. Tab prasann prabhu hwai sukh deenhyon. (18)
Harishchandrahun nrip nari bikani. Aapahun bhare Dom ghar pani. (19)
Taise Nal par dasha sirani. Bhoonji meen kood gaeen pani. (20)
Shri Shankarahin gahyo jab jai. Parvati ko Sati karai. (21)
Tani vilokat hi kari reesa. Nabh udi gayo Gaurisut seesa. (22)
Pandav par bhai dasha tumhari. Bachi Draupadi hoti ughari. (23)
Kaurav ke bhi gati mati maaryo. Yuddh Mahabharat kari daaryo. (24)
Ravi kahan mukh mahan dhari tatkala. Lekar koodi paryo patala. (25)
Shesh dev lakhi vinti lai. Ravi ko mukh te diyo chhudai. (26)
Vahan prabhu ke saat sujana. Jag diggaj gardabh mrig swana. (27)
Jambuk sinh aadi nakh dhari. So phal jyotish kahat pukari. (28)
Gaj vahan Lakshmi grih aavain. Hay te sukh sampatti upjavain. (29)
Gardabh hani karai bahu kaja. Sinh siddhkar raj samaja. (30)
Jambuk buddhi nasht kar daarai. Mrig de kasht praan sanharai. (31)
Jab aavahin prabhu swan sawari. Chori aadi hoy dar bhari. (32)
Taisahi chari charan yah nama. Swarn loh chandi aru tamra. (33)
Loh charan par jab prabhu aavain. Dhan jan sampatti nasht karavain. (34)
Samta tamra rajat shubhkari. Swarn sarvasukh mangal bhari. (35)
Jo yah Shani charitra nit gavai. Kabahun na dasha nikrisht satavai. (36)
Adbhut Nath dikhavain leela. Karain shatru ke nashib bali dheela. (37)
Jo pandit suyogya bulvai. Vidhivat Shani grah shanti karai. (38)
Peepal jal Shani divas chadhavat. Deep daan dai bahu sukh pavat. (39)
Kahat Ramsundar prabhu dasa. Shani sumirat sukh hot prakasha. (40)

Doha

Path Shanishchar dev ko, keen hon bhakt taiyar.
Karat path chalees din, ho bhavsagar paar.

Meaning: The Chalisa of Shanaishchara, son of Surya and Chhaya, is recited to soften the hardest transit in Indian astrology. It first describes him — dark-bodied and four-armed, a jewelled crown, a broad brow, the famous sidelong glance under fierce brows, mace, trident and axe in his hands — and lists his ten names: Pingal, Krishna, Chhaya-Nandan, Yama, Konasth, Raudra, Dukhbhanjan, Sauri, Mand and Shani. Then it recounts what his dasha has done in the shastras: Rama exiled on the eve of coronation, Sita carried away, Lakshman struck down, Ravan's mind turned against Rama, Vikramaditya's nine-lakh necklace stolen and the king put to the oil-press, Harishchandra selling his wife, Nala's fried fish leaping back into the water, and even Shankar and the Pandavas touched. The practical half follows: Shani's seven vahanas and their fruits, his four "feet" of gold, silver, copper and iron, and the remedies — a qualified pandit for graha shanti, water on the peepal on Saturday, and a lamp offered in daan. Forty days of paath is said to carry the devotee across.`,
    tags: ["shani", "chalisa", "saturday", "sade-sati", "dosh-nivaran"],
    featured: false,
    imageUrl: fest("shani-jayanti"),
  },
  // ───────────────────────────── MANTRA ─────────────────────────────
  {
    slug: "mantra-gayatri",
    type: "MANTRA",
    titleEn: "Gayatri Mantra",
    titleHi: "गायत्री मन्त्र",
    deityEn: "Goddess Gayatri (Savitr, the Sun)",
    deityHi: "माँ गायत्री (सविता)",
    bodyHi: `॥ गायत्री मन्त्र ॥

ॐ भूर्भुवः स्वः।
तत्सवितुर्वरेण्यं।
भर्गो देवस्य धीमहि।
धियो यो नः प्रचोदयात्॥

॥ जप विधि ॥

प्रातःकाल सूर्योदय से पूर्व, मध्याह्न तथा सन्ध्या — तीनों सन्ध्याओं में जप करें।
पूर्व दिशा की ओर मुख कर, कुश आसन पर बैठकर, रुद्राक्ष अथवा तुलसी की माला से।
एक माला (१०८ बार) न्यूनतम, श्रद्धानुसार तीन, ग्यारह अथवा चौबीस माला।
जप से पूर्व आचमन तथा सूर्य को जल का अर्घ्य दें।
जप के अन्त में — ॐ शान्तिः शान्तिः शान्तिः॥`,
    bodyEn: `Om bhur bhuvah svah.
Tat savitur varenyam.
Bhargo devasya dheemahi.
Dhiyo yo nah prachodayat.

Japa vidhi:
Recite at the three sandhyas — before sunrise, at midday and at dusk.
Sit facing east on a kusha asan and use a rudraksha or tulsi mala.
One mala (108 repetitions) is the minimum; three, eleven or twenty-four malas as your shraddha allows.
Do achman first and offer arghya, a stream of water, to the sun.
Close with Om shantih shantih shantih.

Meaning: The Gayatri is the most revered verse of the Rigveda, addressed to Savitr, the light behind the sun. Word by word it says: we meditate upon that adorable effulgence of the divine Vivifier; may He impel our intellects. It asks for nothing material at all — the single petition is that the buddhi be set in motion toward truth, which is why it is called the mother of the Vedas and given at the upanayana. The three vyahritis prefixed to it, bhur bhuvah svah, place that light in the earthly, atmospheric and celestial planes, so the meditation covers the whole of one's being. Traditionally japa is done mentally, with the lips barely moving, and never counted aloud.`,
    tags: ["gayatri", "mantra", "daily", "sandhya", "wisdom"],
    featured: true,
    imageUrl: fest("makar-sankranti"),
  },
  {
    slug: "mantra-mahamrityunjay",
    type: "MANTRA",
    titleEn: "Mahamrityunjay Mantra",
    titleHi: "महामृत्युञ्जय मन्त्र",
    deityEn: "Lord Shiva (Mrityunjaya)",
    deityHi: "भगवान शिव (मृत्युञ्जय)",
    bodyHi: `॥ महामृत्युञ्जय मन्त्र ॥

ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।
उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥

॥ लघु मृत्युञ्जय मन्त्र ॥

ॐ जूं सः माम् पालय पालय।

॥ जप विधि ॥

सोमवार, प्रदोष अथवा शिवरात्रि से आरम्भ करें।
रुद्राक्ष की माला से, शिवलिंग अथवा शिव चित्र के सम्मुख, उत्तर या पूर्व मुख होकर।
सवा लाख (१,२५,०००) जप का संकल्प रोग, अपमृत्यु भय तथा दीर्घायु हेतु किया जाता है।
जप के साथ जल की अखण्ड धारा से रुद्राभिषेक कराना श्रेष्ठ माना गया है।
जप के अन्त में दशांश हवन, तर्पण, मार्जन तथा ब्राह्मण भोजन।`,
    bodyEn: `Om tryambakam yajamahe sugandhim pushtivardhanam.
Urvarukamiva bandhanan mrityor mukshiya mamritat.

Laghu Mrityunjaya mantra:
Om joom sah maam palaya palaya.

Japa vidhi:
Begin on a Monday, a Pradosh or on Shivratri.
Use a rudraksha mala, sitting before a Shivling or a picture of Shiva, facing north or east.
A sankalp of sava lakh (1,25,000) repetitions is the traditional count for illness, fear of untimely death and long life.
It is considered best to have Rudrabhishek performed with an unbroken stream of water alongside the japa.
Conclude with a dashansh havan (one tenth of the count), tarpan, marjan and brahmin bhojan.

Meaning: From the Rigveda and the Yajurveda, this is the great death-conquering verse. It says: we worship the three-eyed one, the fragrant one who increases nourishment; as a ripe cucumber is released from its stem, may I be freed from death — but not from immortality. The image is precise and gentle: the fruit is not torn off, it simply lets go when it is ripe, and this is what the devotee asks of mortality. It is chanted for the seriously ill, before surgery, after an accident or an inauspicious transit, and during Shravan for long life and health. It is the core mantra of every Mahamrityunjay Jaap performed at Mahakaleshwar and Trimbakeshwar.`,
    tags: ["shiva", "mantra", "monday", "health", "dosh-nivaran", "longevity"],
    featured: true,
    imageUrl: svc("mahamrityunjay-jaap-mahakaleshwar"),
  },
  {
    slug: "mantra-ganesh-vakratunda",
    type: "MANTRA",
    titleEn: "Vakratunda Mahakaya (Ganesh Mantra)",
    titleHi: "वक्रतुण्ड महाकाय",
    deityEn: "Lord Ganesha",
    deityHi: "भगवान गणेश",
    bodyHi: `॥ गणेश मंगल श्लोक ॥

वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥

॥ मूल मन्त्र ॥

ॐ गं गणपतये नमः॥

॥ गणेश गायत्री ॥

ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि।
तन्नो दन्तिः प्रचोदयात्॥

॥ जप विधि ॥

बुधवार अथवा चतुर्थी को प्रातः स्नान कर पूर्व मुख होकर बैठें।
लाल वस्त्र, लाल आसन तथा दूर्वा एवं मोदक का भोग।
ॐ गं गणपतये नमः का ११ अथवा २१ माला जप — किसी भी नवीन कार्य, गृह प्रवेश, विवाह अथवा व्यापार आरम्भ से पूर्व।
जप के पश्चात् दूर्वा की २१ गाँठ अर्पित कर मंगल श्लोक का पाठ करें।`,
    bodyEn: `Vakratunda mahakaya suryakoti samaprabha.
Nirvighnam kuru me deva sarvakaryeshu sarvada.

Mool mantra:
Om gam ganapataye namah.

Ganesh Gayatri:
Om ekadantaya vidmahe vakratundaya dheemahi.
Tanno dantih prachodayat.

Japa vidhi:
On a Wednesday or a Chaturthi, bathe at dawn and sit facing east.
Red cloth, a red asan, and an offering of durva grass and modak.
Recite Om gam ganapataye namah for 11 or 21 malas before any new undertaking — griha pravesh, a marriage, or the start of a business.
Afterwards offer 21 knots of durva and read the mangal shloka.

Meaning: The mangal shloka asks the curved-trunked, mighty-bodied one whose radiance equals a crore suns to make all one's works free of obstacles, always. It is the shloka spoken at the opening of a pooja, a book, a journey or a ceremony, and the reason Ganesha is called Vighnaharta. The bija mantra Om gam ganapataye namah carries the same prayer in seed form and is the mantra used for japa; the Ganesh Gayatri is used in sankalp and havan. Durva grass in odd-numbered knots and modak are his fixed offerings, and Wednesday and the fourth tithi of each fortnight are his days.`,
    tags: ["ganesha", "mantra", "wednesday", "chaturthi", "new-beginnings"],
    featured: false,
    imageUrl: svc("ganesh-siddhi-pooja-siddhivinayak"),
  },
  {
    slug: "mantra-om-namah-shivaya",
    type: "MANTRA",
    titleEn: "Om Namah Shivaya (Panchakshari)",
    titleHi: "ॐ नमः शिवाय (पञ्चाक्षरी मन्त्र)",
    deityEn: "Lord Shiva",
    deityHi: "भगवान शिव",
    bodyHi: `॥ पञ्चाक्षरी मन्त्र ॥

ॐ नमः शिवाय॥

॥ षडक्षर सहित ॥

ॐ नमः शिवाय। ॐ नमः शिवाय। ॐ नमः शिवाय॥
न — पृथ्वी तत्त्व। म — जल तत्त्व। शि — अग्नि तत्त्व। वा — वायु तत्त्व। य — आकाश तत्त्व॥

॥ जप विधि ॥

सोमवार से आरम्भ करें, प्रदोष काल अथवा ब्रह्ममुहूर्त में।
रुद्राक्ष की माला, सफेद अथवा भस्म-रंग का आसन, उत्तर दिशा की ओर मुख।
शिवलिंग पर जल, दूध, बेलपत्र, धतूरा तथा सफेद पुष्प अर्पित कर जप करें।
प्रतिदिन कम से कम एक माला; श्रावण मास में १०८ माला का संकल्प श्रेष्ठ।
जप के अन्त में — कर्पूर आरती तथा ॐ शान्तिः शान्तिः शान्तिः॥`,
    bodyEn: `Om Namah Shivaya.

Om Namah Shivaya. Om Namah Shivaya. Om Namah Shivaya.
Na - the earth element. Ma - water. Shi - fire. Va - air. Ya - space.

Japa vidhi:
Begin on a Monday, in the Pradosh hour or at brahma-muhurta.
Rudraksha mala, a white or ash-coloured asan, facing north.
Offer water, milk, bilva leaves, dhatura and white flowers on the Shivling, then do the japa.
At least one mala daily; a sankalp of 108 malas through the month of Shravan is considered best.
Close with a camphor aarti and Om shantih shantih shantih.

Meaning: The five syllables na-mah-shi-va-ya are the heart of the Shri Rudram in the Yajurveda and the oldest Shaiva mantra. It means simply "salutations to Shiva" — an offering of the self rather than a request for anything, which is why it is called the mantra of surrender. Each syllable is traditionally identified with one of the five elements, so reciting it is understood as returning the five constituents of the body to their source; the prefixed Om makes it the shadakshari, the six-syllable form used by initiates. It requires no ritual purity conditions, may be chanted at any hour, silently or aloud, and is the mantra given to householders, sannyasis and children alike.`,
    tags: ["shiva", "mantra", "monday", "shravan", "daily", "meditation"],
    featured: false,
    imageUrl: svc("bhasma-aarti-sankalp-mahakal"),
  },
  {
    slug: "mantra-shanti-sarve-bhavantu-sukhinah",
    type: "MANTRA",
    titleEn: "Shanti Mantra (Sarve Bhavantu Sukhinah)",
    titleHi: "शान्ति मन्त्र (सर्वे भवन्तु सुखिनः)",
    deityEn: "Universal peace invocation",
    deityHi: "सर्वमंगल शान्ति प्रार्थना",
    bodyHi: `॥ शान्ति मन्त्र ॥

ॐ सर्वे भवन्तु सुखिनः।
सर्वे सन्तु निरामयाः।
सर्वे भद्राणि पश्यन्तु।
मा कश्चिद्दुःखभाग्भवेत्॥
ॐ शान्तिः शान्तिः शान्तिः॥

॥ सह नाववतु ॥

ॐ सह नाववतु। सह नौ भुनक्तु।
सह वीर्यं करवावहै।
तेजस्वि नावधीतमस्तु मा विद्विषावहै॥
ॐ शान्तिः शान्तिः शान्तिः॥

॥ द्यौः शान्तिः ॥

ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः।
वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥
ॐ शान्तिः शान्तिः शान्तिः॥

॥ जप विधि ॥

प्रत्येक पूजा, हवन, कथा तथा पाठ के अन्त में इनका उच्चारण किया जाता है।
गृह शान्ति, नवग्रह शान्ति तथा वास्तु शान्ति में तीनों मन्त्रों का पाठ।
शान्तिः तीन बार — आधिदैविक, आधिभौतिक तथा आध्यात्मिक तापों की निवृत्ति हेतु।`,
    bodyEn: `Om sarve bhavantu sukhinah.
Sarve santu niramayah.
Sarve bhadrani pashyantu.
Ma kashchid duhkhabhag bhavet.
Om shantih shantih shantih.

Om saha navavatu. Saha nau bhunaktu.
Saha viryam karavavahai.
Tejasvi navadhitamastu ma vidvishavahai.
Om shantih shantih shantih.

Om dyauh shantir antariksham shantih prithivi shantir apah shantir oshadhayah shantih.
Vanaspatayah shantir vishvedevah shantir brahma shantih sarvam shantih shantir eva shantih sa ma shantir edhi.
Om shantih shantih shantih.

Japa vidhi:
These are pronounced at the close of every pooja, havan, katha and paath.
All three are read together in griha shanti, navgrah shanti and vastu shanti rituals.
Shantih is said three times, for the removal of the three afflictions - those from the gods, from other beings, and from oneself.

Meaning: The first verse is the best-known prayer in the Sanskrit tradition and asks nothing for the reciter: may all be happy, may all be free from illness, may all see what is auspicious, and may no one anywhere come to sorrow. The second, from the Taittiriya Upanishad, is the invocation of a teacher and student together — may we be protected together, nourished together, work with vigour together, may our study be brilliant, and may we never quarrel. The third, from the Shukla Yajurveda, extends peace outward in widening circles: to the sky, the space between, the earth, the waters, the herbs, the trees, the devas, Brahman, and then to everything — and finally asks that this peace come to the reciter as well.`,
    tags: ["shanti", "mantra", "peace", "daily", "havan"],
    featured: false,
    imageUrl: svc("navgrah-shanti-trimbakeshwar"),
  },
  {
    slug: "mantra-hare-krishna-mahamantra",
    type: "MANTRA",
    titleEn: "Hare Krishna Mahamantra",
    titleHi: "हरे कृष्ण महामन्त्र",
    deityEn: "Lord Krishna",
    deityHi: "भगवान श्रीकृष्ण",
    bodyHi: `॥ महामन्त्र ॥

हरे कृष्ण हरे कृष्ण। कृष्ण कृष्ण हरे हरे॥
हरे राम हरे राम। राम राम हरे हरे॥

॥ पञ्चतत्त्व मन्त्र ॥

श्री कृष्ण चैतन्य प्रभु नित्यानन्द।
श्री अद्वैत गदाधर श्रीवासादि गौर भक्त वृन्द॥

॥ जप विधि ॥

तुलसी की माला से जप करें — एक माला में १०८ बार, प्रतिदिन कम से कम चार माला।
जप के पूर्व पञ्चतत्त्व मन्त्र का उच्चारण।
जप किसी भी समय, किसी भी अवस्था में — इस मन्त्र में देश, काल अथवा शुद्धि का कोई नियम नहीं।
सामूहिक कीर्तन में मृदंग एवं करताल के साथ गान — इसे संकीर्तन कहते हैं।
एकादशी, जन्माष्टमी तथा कार्तिक मास में विशेष फलदायी।`,
    bodyEn: `Hare Krishna Hare Krishna. Krishna Krishna Hare Hare.
Hare Rama Hare Rama. Rama Rama Hare Hare.

Panchatattva mantra:
Shri Krishna Chaitanya Prabhu Nityananda.
Shri Advaita Gadadhara Shrivasadi Gaura bhakta vrinda.

Japa vidhi:
Count on a tulsi mala - 108 repetitions to a round, at least four rounds a day.
Say the Panchatattva mantra before beginning.
It may be chanted at any time and in any state; this mantra has no rules of place, hour or ritual purity.
Sung together with mridang and kartal in a group, it is called sankirtan.
Especially fruitful on Ekadashi, at Janmashtami and through the month of Kartik.

Meaning: The sixteen names of the Kali-Santarana Upanishad, given wide currency by Chaitanya Mahaprabhu in the sixteenth century, are called the Mahamantra because the shastras say that in this age the holy name alone carries one across. Hare is the vocative of Hara, the energy of the Lord — Radha — so the mantra is a call to Her first and then to Krishna and Rama, the all-attractive one and the reservoir of joy. It is not a petition but an address: the devotee simply calls out the names. Chanted on tulsi beads in japa, or sung in kirtan where anyone present may join without initiation.`,
    tags: ["krishna", "mantra", "kirtan", "ekadashi", "janmashtami"],
    featured: false,
    imageUrl: svc("santan-gopal-pooja-vrindavan"),
  },
  {
    slug: "mantra-navgrah-stotra",
    type: "MANTRA",
    titleEn: "Navgrah Stotra",
    titleHi: "नवग्रह स्तोत्र",
    deityEn: "The Nine Planets (Navagraha)",
    deityHi: "नवग्रह",
    bodyHi: `॥ मंगल श्लोक ॥

ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च।
गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम्॥

॥ नवग्रह स्तोत्र ॥

जपाकुसुमसंकाशं काश्यपेयं महाद्युतिम्।
तमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम्॥१॥

दधिशंखतुषाराभं क्षीरोदार्णवसम्भवम्।
नमामि शशिनं सोमं शम्भोर्मुकुटभूषणम्॥२॥

धरणीगर्भसम्भूतं विद्युत्कान्तिसमप्रभम्।
कुमारं शक्तिहस्तं तं मङ्गलं प्रणमाम्यहम्॥३॥

प्रियंगुकलिकाश्यामं रूपेणाप्रतिमं बुधम्।
सौम्यं सौम्यगुणोपेतं तं बुधं प्रणमाम्यहम्॥४॥

देवानां च ऋषीणां च गुरुं काञ्चनसन्निभम्।
बुद्धिभूतं त्रिलोकेशं तं नमामि बृहस्पतिम्॥५॥

हिमकुन्दमृणालाभं दैत्यानां परमं गुरुम्।
सर्वशास्त्रप्रवक्तारं भार्गवं प्रणमाम्यहम्॥६॥

नीलाञ्जनसमाभासं रविपुत्रं यमाग्रजम्।
छायामार्तण्डसम्भूतं तं नमामि शनैश्चरम्॥७॥

अर्धकायं महावीर्यं चन्द्रादित्यविमर्दनम्।
सिंहिकागर्भसम्भूतं तं राहुं प्रणमाम्यहम्॥८॥

पलाशपुष्पसंकाशं तारकाग्रहमस्तकम्।
रौद्रं रौद्रात्मकं घोरं तं केतुं प्रणमाम्यहम्॥९॥

॥ फलश्रुति ॥

इति व्यासमुखोद्गीतं यः पठेत्सुसमाहितः।
दिवा वा यदि वा रात्रौ विघ्नशान्तिर्भविष्यति॥

नरनारीनृपाणां च भवेद्दुःस्वप्ननाशनम्।
ऐश्वर्यमतुलं तेषामारोग्यं पुष्टिवर्धनम्॥

ग्रहनक्षत्रजाः पीडास्तस्कराग्निसमुद्भवाः।
ताः सर्वाः प्रशमं यान्ति व्यासो ब्रूते न संशयः॥

॥ जप विधि ॥

प्रातःकाल स्नान के पश्चात् नवग्रह मण्डल अथवा नवग्रह यन्त्र के सम्मुख पाठ करें।
नौ बत्ती का दीपक, नौ प्रकार का अन्न तथा नौ रंग के पुष्प अर्पित करें।
प्रत्येक ग्रह की दशा, अन्तर्दशा अथवा प्रतिकूल गोचर में नित्य पाठ।
शनिवार अथवा अमावस्या को नवग्रह शान्ति हवन के साथ पाठ श्रेष्ठ।`,
    bodyEn: `Mangal shloka:
Brahma Murarih Tripurantakari Bhanuh Shashi Bhoomisuto Budhashcha.
Gurushcha Shukrah Shanirahuketavah kurvantu sarve mama suprabhatam.

Navgrah Stotra:
Japakusumasankasham Kashyapeyam mahadyutim.
Tamo'rim sarvapapaghnam pranato'smi Divakaram. (1)

Dadhishankhatusharabham ksheerodarnavasambhavam.
Namami shashinam Somam Shambhormukutabhushanam. (2)

Dharanigarbhasambhutam vidyutkantisamaprabham.
Kumaram shaktihastam tam Mangalam pranamamyaham. (3)

Priyangukalikashyamam rupenapratimam budham.
Saumyam saumyagunopetam tam Budham pranamamyaham. (4)

Devanam cha rishinam cha gurum kanchanasannibham.
Buddhibhutam trilokesham tam namami Brihaspatim. (5)

Himakundamrinalabham daityanam paramam gurum.
Sarvashastrapravaktaram Bhargavam pranamamyaham. (6)

Nilanjanasamabhasam Raviputram Yamagrajam.
Chhayamartandasambhutam tam namami Shanaishcharam. (7)

Ardhakayam mahaviryam chandradityavimardanam.
Simhikagarbhasambhutam tam Rahum pranamamyaham. (8)

Palashapushpasankasham tarakagrahamastakam.
Raudram raudratmakam ghoram tam Ketum pranamamyaham. (9)

Phalashruti:
Iti Vyasamukhodgitam yah pathet susamahitah.
Diva va yadi va ratrau vighnashantir bhavishyati.

Naranarinripanam cha bhaved duhswapnanashanam.
Aishwaryam atulam tesham arogyam pushtivardhanam.

Grahanakshatrajah pidas taskaragnisamudbhavah.
Tah sarvah prashamam yanti Vyaso brute na samshayah.

Japa vidhi:
Read after the morning bath before a navgrah mandal or navgrah yantra.
Offer a nine-wick lamp, nine kinds of grain and flowers of nine colours.
Recite daily during the dasha, antardasha or an adverse transit of any planet.
Best read on a Saturday or an Amavasya alongside a Navgrah Shanti havan.

Meaning: The opening shloka greets the morning by naming Brahma, Vishnu, Shiva and all nine grahas together and asking that they make the day auspicious. The nine verses that follow, sung by Vyasa, salute each planet with one precise image: the Sun red as a hibiscus flower and enemy of darkness; the Moon white as curd, conch and frost, risen from the ocean of milk and worn on Shiva's crown; Mangal born of the earth with the radiance of lightning, spear in hand; Budha dark as a priyangu bud and gentle in nature; Brihaspati golden, guru of gods and rishis; Shukra white as snow-jasmine and lotus-fibre, teacher of the daityas and expounder of all shastras; Shanaishchara dark as collyrium, son of the Sun and elder brother of Yama; Rahu the half-bodied one born of Simhika who torments Sun and Moon; and Ketu terrible as a palash flower at the head of the star-planets. The phalashruti promises that read attentively by day or night it ends obstacles, bad dreams and the afflictions caused by planets, thieves and fire.`,
    tags: ["navgrah", "mantra", "stotra", "dosh-nivaran", "saturday", "amavasya"],
    featured: false,
    imageUrl: svc("navgrah-shanti-trimbakeshwar"),
  },
  {
    slug: "mantra-kuber",
    type: "MANTRA",
    titleEn: "Kuber Mantra",
    titleHi: "कुबेर मन्त्र",
    deityEn: "Lord Kuber",
    deityHi: "भगवान कुबेर",
    bodyHi: `॥ कुबेर मन्त्र ॥

ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्याधिपतये।
धनधान्यसमृद्धिं मे देहि दापय स्वाहा॥

॥ कुबेर बीज मन्त्र ॥

ॐ श्रीं ह्रीं क्लीं श्रीं क्लीं वित्तेश्वराय नमः॥

॥ कुबेर गायत्री ॥

ॐ यक्षराजाय विद्महे वैश्रवणाय धीमहि।
तन्नो कुबेरः प्रचोदयात्॥

॥ जप विधि ॥

धनतेरस, दीपावली अथवा किसी भी शुक्रवार को उत्तर दिशा की ओर मुख कर बैठें।
कुबेर यन्त्र अथवा श्री यन्त्र के सम्मुख पीले आसन पर, घी का दीपक तथा पीले पुष्प।
हल्दी की माला अथवा स्फटिक माला से १०८ बार, इक्कीस दिन तक नित्य।
तिजोरी अथवा गल्ले को उत्तर दिशा में रखकर उस पर अक्षत तथा दक्षिणावर्ती शंख स्थापित करें।
जप के पूर्व लक्ष्मी पूजन तथा जप के अन्त में अन्नदान — कुबेर बिना लक्ष्मी के पूजित नहीं होते।`,
    bodyEn: `Om yakshaya Kuberaya Vaishravanaya dhanadhanyadhipataye.
Dhanadhanyasamriddhim me dehi dapaya swaha.

Kuber beej mantra:
Om shreem hreem kleem shreem kleem Vitteshwaraya namah.

Kuber Gayatri:
Om Yaksharajaya vidmahe Vaishravanaya dheemahi.
Tanno Kuberah prachodayat.

Japa vidhi:
Sit facing north on Dhanteras, Diwali or any Friday.
Before a Kuber yantra or Shri yantra, on a yellow asan, with a ghee lamp and yellow flowers.
108 repetitions on a haldi or sphatik mala, daily for twenty-one days.
Keep the safe or cash box in the north of the room and place akshat and a dakshinavarti shankh upon it.
Do Lakshmi poojan before the japa and give food in daan afterwards - Kuber is never worshipped apart from Lakshmi.

Meaning: Kuber is the Yaksha king, son of Vishrava, treasurer of the devas and lord of the northern direction. The mantra addresses him by all three names and then asks plainly for the increase of wealth and grain - and, in the word dapaya, asks him to cause others to give as well, which is why it is used by traders and for household finances rather than for hoarding. The tradition is emphatic that Kuber is only the keeper of the treasury while Lakshmi is the wealth itself, so the japa is done after Lakshmi poojan and completed with daan; wealth that does not circulate is considered to leave. Recited on Dhanteras, during the Lakshmi-Kuber yagya and at the opening of a new shop or account book.`,
    tags: ["kuber", "mantra", "dhanteras", "diwali", "wealth", "business"],
    featured: false,
    imageUrl: fest("dhanteras"),
  },
  // ───────────────────────────── STOTRA ─────────────────────────────
  {
    slug: "stotra-lingashtakam",
    type: "STOTRA",
    titleEn: "Lingashtakam",
    titleHi: "लिंगाष्टकम्",
    deityEn: "Lord Shiva",
    deityHi: "भगवान शिव",
    bodyHi: `॥ लिंगाष्टकम् ॥

ब्रह्ममुरारिसुरार्चितलिङ्गं निर्मलभासितशोभितलिङ्गम्।
जन्मजदुःखविनाशकलिङ्गं तत्प्रणमामि सदाशिवलिङ्गम्॥१॥

देवमुनिप्रवरार्चितलिङ्गं कामदहं करुणाकरलिङ्गम्।
रावणदर्पविनाशनलिङ्गं तत्प्रणमामि सदाशिवलिङ्गम्॥२॥

सर्वसुगन्धिसुलेपितलिङ्गं बुद्धिविवर्धनकारणलिङ्गम्।
सिद्धसुरासुरवन्दितलिङ्गं तत्प्रणमामि सदाशिवलिङ्गम्॥३॥

कनकमहामणिभूषितलिङ्गं फणिपतिवेष्टितशोभितलिङ्गम्।
दक्षसुयज्ञविनाशनलिङ्गं तत्प्रणमामि सदाशिवलिङ्गम्॥४॥

कुङ्कुमचन्दनलेपितलिङ्गं पङ्कजहारसुशोभितलिङ्गम्।
सञ्चितपापविनाशनलिङ्गं तत्प्रणमामि सदाशिवलिङ्गम्॥५॥

देवगणार्चितसेवितलिङ्गं भावैर्भक्तिभिरेव च लिङ्गम्।
दिनकरकोटिप्रभाकरलिङ्गं तत्प्रणमामि सदाशिवलिङ्गम्॥६॥

अष्टदलोपरिवेष्टितलिङ्गं सर्वसमुद्भवकारणलिङ्गम्।
अष्टदरिद्रविनाशनलिङ्गं तत्प्रणमामि सदाशिवलिङ्गम्॥७॥

सुरगुरुसुरवरपूजितलिङ्गं सुरवनपुष्पसदार्चितलिङ्गम्।
परात्परं परमात्मकलिङ्गं तत्प्रणमामि सदाशिवलिङ्गम्॥८॥

॥ फलश्रुति ॥

लिङ्गाष्टकमिदं पुण्यं यः पठेच्छिवसन्निधौ।
शिवलोकमवाप्नोति शिवेन सह मोदते॥`,
    bodyEn: `Brahmamurarisurarchitalingam nirmalabhasitashobhitalingam.
Janmajaduhkhavinashakalingam tatpranamami Sadashivalingam. (1)

Devamunipravararchitalingam kamadaham karunakaralingam.
Ravanadarpavinashanalingam tatpranamami Sadashivalingam. (2)

Sarvasugandhisulepitalingam buddhivivardhanakaranalingam.
Siddhasurasuravanditalingam tatpranamami Sadashivalingam. (3)

Kanakamahamanibhushitalingam phanipativeshtitashobhitalingam.
Dakshasuyagyavinashanalingam tatpranamami Sadashivalingam. (4)

Kunkumachandanalepitalingam pankajaharasushobhitalingam.
Sanchitapapavinashanalingam tatpranamami Sadashivalingam. (5)

Devaganarchitasevitalingam bhavair bhaktibhir eva cha lingam.
Dinakarakotiprabhakaralingam tatpranamami Sadashivalingam. (6)

Ashtadaloparaiveshtitalingam sarvasamudbhavakaranalingam.
Ashtadaridravinashanalingam tatpranamami Sadashivalingam. (7)

Suragurusuravarapujitalingam suravanapushpasadarchitalingam.
Paratparam paramatmakalingam tatpranamami Sadashivalingam. (8)

Phalashruti:
Lingashtakam idam punyam yah pathech chhivasannidhau.
Shivalokam avapnoti Shivena saha modate.

Meaning: Eight verses that end identically — "to that Sadashiva Linga I bow" — each naming a different aspect of the Linga worshipped in the sanctum. It is the Linga adored by Brahma, Vishnu and the devas, radiant and spotless, destroying the sorrow of birth; the Linga that burned Kamadeva yet is the source of compassion, and that broke Ravana's pride; anointed with every fragrance, giver of increasing intelligence; adorned with gold and great gems and encircled by the king of serpents, the Linga that ended Daksha's sacrifice; smeared with kumkum and sandal, garlanded with lotuses, destroyer of accumulated sin; served by the gana of gods and reached only by bhava and bhakti, blazing like a crore suns; set upon the eight-petalled lotus as the cause of all that arises and the destroyer of the eight poverties; and finally the Linga beyond the beyond, the very Paramatma. The phalashruti says whoever reads it in the presence of Shiva attains Shivaloka and rejoices with Him. Recited during abhishek, on Mondays, in Shravan and on Mahashivratri.`,
    tags: ["shiva", "stotra", "monday", "shravan", "abhishek"],
    featured: false,
    imageUrl: svc("shravan-somvar-rudrabhishek"),
  },
  {
    slug: "stotra-bajrang-baan",
    type: "STOTRA",
    titleEn: "Bajrang Baan",
    titleHi: "बजरंग बाण",
    deityEn: "Lord Hanuman",
    deityHi: "भगवान हनुमान",
    bodyHi: `॥ दोहा ॥

निश्चय प्रेम प्रतीति ते, विनय करैं सनमान।
तेहि के कारज सकल शुभ, सिद्ध करैं हनुमान॥

॥ चौपाई ॥

जय हनुमन्त सन्त हितकारी। सुन लीजै प्रभु अरज हमारी॥
जन के काज विलम्ब न कीजै। आतुर दौरि महा सुख दीजै॥
जैसे कूदि सिन्धु महिपारा। सुरसा बदन पैठि विस्तारा॥
आगे जाय लंकिनी रोका। मारेहु लात गई सुरलोका॥
जाय विभीषण को सुख दीन्हा। सीता निरखि परमपद लीन्हा॥
बाग उजारि सिन्धु महँ बोरा। अति आतुर जमकातर तोरा॥
अक्षय कुमार मारि संहारा। लूम लपेटि लंक को जारा॥
लाह समान लंक जरि गई। जय जय धुनि सुरपुर नभ भई॥
अब विलम्ब केहि कारण स्वामी। कृपा करहु उर अन्तर्यामी॥
जय जय लखन प्राण के दाता। आतुर होय दुख करहु निपाता॥
जय गिरिधर जय जय सुखसागर। सुर समूह समरथ भटनागर॥
ॐ हनु हनु हनु हनुमन्त हठीले। बैरिहि मारु बज्र की कीले॥
गदा बज्र लै बैरिहि मारो। महाराज प्रभु दास उबारो॥
ॐकार हुंकार महाबीर धावो। बज्र गदा हनु विलम्ब न लावो॥
ॐ ह्रीं ह्रीं ह्रीं हनुमन्त कपीसा। ॐ हुं हुं हुं हनु अरि उर शीसा॥
सत्य होहु हरि शपथ पायके। रामदूत धरु मारु जायके॥
जय जय जय हनुमन्त अगाधा। दुख पावत जन केहि अपराधा॥
पूजा जप तप नेम अचारा। नहिं जानत कछु दास तुम्हारा॥
वन उपवन मग गिरि गृह माहीं। तुम्हरे बल हम डरपत नाहीं॥
पाँय परों कर जोरि मनावों। यहि अवसर अब केहि गोहरावों॥
जय अंजनि कुमार बलवन्ता। शंकरसुवन बीर हनुमन्ता॥
बदन कराल काल कुल घालक। राम सहाय सदा प्रतिपालक॥
भूत प्रेत पिशाच निशाचर। अग्नि बेताल काल मारी मर॥
इन्हें मारु तोहि शपथ राम की। राखु नाथ मरजाद नाम की॥
जनकसुता हरि दास कहावो। ताकी शपथ विलम्ब न लावो॥
जय जय जय धुनि होत अकाशा। सुमिरत होत दुसह दुख नाशा॥
चरण शरण कर जोरि मनावों। यहि अवसर अब केहि गोहरावों॥
उठु उठु चलु तोहि राम दुहाई। पाँय परौं कर जोरि मनाई॥
ॐ चं चं चं चं चपल चलन्ता। ॐ हनु हनु हनु हनु हनुमन्ता॥
ॐ हं हं हाँक देत कपि चंचल। ॐ सं सं सहमि पराने खल दल॥
अपने जन को तुरत उबारो। सुमिरत होय आनन्द हमारो॥
यह बजरंग बाण जेहि मारै। ताहि कहो फिर कौन उबारै॥
पाठ करै बजरंग बाण की। हनुमत रक्षा करै प्राण की॥
यह बजरंग बाण जो जापैं। तासों भूत प्रेत सब काँपैं॥
धूप देय जो जपै हमेशा। ताके तन नहिं रहै कलेशा॥

॥ दोहा ॥

प्रेम प्रतीतिहिं कपि भजै, सदा धरैं उर ध्यान।
तेहि के कारज सकल शुभ, सिद्ध करैं हनुमान॥`,
    bodyEn: `Doha

Nishchay prem pratiti te, vinay karain sanman.
Tehi ke karaj sakal shubh, siddh karain Hanuman.

Chaupai

Jai Hanumant sant hitkari. Sun leejai prabhu araj hamari.
Jan ke kaj vilamb na keejai. Aatur dauri maha sukh deejai.
Jaise koodi sindhu mahipara. Sursa badan paithi vistara.
Aage jaay Lankini roka. Marehu laat gai surloka.
Jaay Vibhishan ko sukh deenha. Sita nirakhi param pad leenha.
Baag ujaari sindhu mahan bora. Ati aatur Jamkatar tora.
Akshay Kumar maari sanhara. Loom lapeti Lank ko jara.
Laah saman Lank jari gai. Jai jai dhuni surpur nabh bhai.
Ab vilamb kehi karan swami. Kripa karahu ur antaryami.
Jai jai Lakhan praan ke data. Aatur hoy dukh karahu nipata.
Jai Giridhar jai jai sukhsagar. Sur samooh samarath bhatnagar.
Om hanu hanu hanu Hanumant hathile. Bairihi maaru bajra ki keele.
Gada bajra lai bairihi maro. Maharaj prabhu das ubaro.
Omkar hunkar Mahabir dhavo. Bajra gada hanu vilamb na lavo.
Om hreem hreem hreem Hanumant Kapisa. Om hum hum hum hanu ari ur sheesa.
Satya hohu Hari shapath paayke. Ramdoot dharu maaru jaayke.
Jai jai jai Hanumant agadha. Dukh pavat jan kehi apradha.
Pooja jap tap nem achara. Nahin janat kachhu das tumhara.
Van upvan mag giri grih mahin. Tumhre bal hum darpat nahin.
Paanya paron kar jori manavon. Yahi avsar ab kehi gohravon.
Jai Anjani Kumar balvanta. Shankarsuvan beer Hanumanta.
Badan karal kaal kul ghalak. Ram sahay sada pratipalak.
Bhoot pret pishach nishachar. Agni betal kaal maari mar.
Inhein maaru tohi shapath Ram ki. Rakhu Nath marjad naam ki.
Janaksuta Hari das kahavo. Taki shapath vilamb na lavo.
Jai jai jai dhuni hot akasha. Sumirat hot dusah dukh nasha.
Charan sharan kar jori manavon. Yahi avsar ab kehi gohravon.
Uthu uthu chalu tohi Ram duhai. Paanya parau kar jori manai.
Om cham cham cham cham chapal chalanta. Om hanu hanu hanu hanu Hanumanta.
Om ham ham haank det kapi chanchal. Om sam sam sahami parane khal dal.
Apne jan ko turat ubaro. Sumirat hoy anand hamaro.
Yah Bajrang Baan jehi marai. Tahi kaho phir kaun ubarai.
Path karai Bajrang Baan ki. Hanumat raksha karai praan ki.
Yah Bajrang Baan jo japain. Tason bhoot pret sab kanpain.
Dhoop dey jo japai hamesha. Take tan nahin rahai kalesha.

Doha

Prem pratitihin kapi bhajai, sada dharain ur dhyan.
Tehi ke karaj sakal shubh, siddh karain Hanuman.

Meaning: The Bajrang Baan is the "arrow of Bajrangbali" — a petition rather than a praise, recited when a devotee is under real pressure. It begins by reminding Hanuman of what he has already done: the leap across the ocean, passing through Sursa's mouth, felling Lankini, comforting Vibhishan, finding Sita, uprooting the Ashok grove and burning Lanka like lac. Then the plea turns urgent — do not delay in your servant's work; come running. The middle section is charged with bija syllables, om hanu hanu hanu and om hreem hreem hreem, calling him to strike with the vajra and mace and to drive off bhoot, pret, pishach, nishachar and the fear of untimely death, put under the oath of Rama and of Janaki. The devotee confesses he knows nothing of pooja, japa, tapa or proper conduct, and relies on strength alone. The closing verses promise that whoever recites it with dhoop offered daily is protected in life and body. Traditionally read on Tuesdays and Saturdays, after the Hanuman Chalisa, never casually and never for harming anyone.`,
    tags: ["hanuman", "stotra", "tuesday", "saturday", "protection", "sankat"],
    featured: false,
    imageUrl: fest("hanuman-jayanti"),
  },
  {
    slug: "stotra-shiv-tandav",
    type: "STOTRA",
    titleEn: "Shiv Tandav Stotram",
    titleHi: "शिव ताण्डव स्तोत्रम्",
    deityEn: "Lord Shiva",
    deityHi: "भगवान शिव",
    bodyHi: `॥ शिव ताण्डव स्तोत्रम् ॥
॥ रावणकृतम् ॥

जटाटवीगलज्जलप्रवाहपावितस्थले
गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्।
डमड्डमड्डमड्डमन्निनादवड्डमर्वयं
चकार चण्डताण्डवं तनोतु नः शिवः शिवम्॥१॥

जटाकटाहसम्भ्रमभ्रमन्निलिम्पनिर्झरी-
विलोलवीचिवल्लरीविराजमानमूर्धनि।
धगद्धगद्धगज्ज्वलल्ललाटपट्टपावके
किशोरचन्द्रशेखरे रतिः प्रतिक्षणं मम॥२॥

धराधरेन्द्रनन्दिनीविलासबन्धुबन्धुर-
स्फुरद्दिगन्तसन्ततिप्रमोदमानमानसे।
कृपाकटाक्षधोरणीनिरुद्धदुर्धरापदि
क्वचिद्दिगम्बरे मनो विनोदमेतु वस्तुनि॥३॥

जटाभुजङ्गपिङ्गलस्फुरत्फणामणिप्रभा-
कदम्बकुङ्कुमद्रवप्रलिप्तदिग्वधूमुखे।
मदान्धसिन्धुरस्फुरत्त्वगुत्तरीयमेदुरे
मनो विनोदमद्भुतं बिभर्तु भूतभर्तरि॥४॥

सहस्रलोचनप्रभृत्यशेषलेखशेखर-
प्रसूनधूलिधोरणी विधूसराङ्घ्रिपीठभूः।
भुजङ्गराजमालया निबद्धजाटजूटकः
श्रियै चिराय जायतां चकोरबन्धुशेखरः॥५॥

ललाटचत्वरज्वलद्धनञ्जयस्फुलिङ्गभा-
निपीतपञ्चसायकं नमन्निलिम्पनायकम्।
सुधामयूखलेखया विराजमानशेखरं
महाकपालिसम्पदेशिरोजटालमस्तु नः॥६॥

करालभालपट्टिकाधगद्धगद्धगज्ज्वल-
द्धनञ्जयाहुतीकृतप्रचण्डपञ्चसायके।
धराधरेन्द्रनन्दिनीकुचाग्रचित्रपत्रक-
प्रकल्पनैकशिल्पिनि त्रिलोचने रतिर्मम॥७॥

नवीनमेघमण्डलीनिरुद्धदुर्धरस्फुरत्-
कुहूनिशीथिनीतमः प्रबन्धबद्धकन्धरः।
निलिम्पनिर्झरीधरस्तनोतु कृत्तिसिन्धुरः
कलानिधानबन्धुरः श्रियं जगद्धुरन्धरः॥८॥

प्रफुल्लनीलपङ्कजप्रपञ्चकालिमप्रभा-
वलम्बिकण्ठकन्दलीरुचिप्रबद्धकन्धरम्।
स्मरच्छिदं पुरच्छिदं भवच्छिदं मखच्छिदं
गजच्छिदान्धकच्छिदं तमन्तकच्छिदं भजे॥९॥

अखर्वसर्वमङ्गलाकलाकदम्बमञ्जरी-
रसप्रवाहमाधुरीविजृम्भणामधुव्रतम्।
स्मरान्तकं पुरान्तकं भवान्तकं मखान्तकं
गजान्तकान्धकान्तकं तमन्तकान्तकं भजे॥१०॥

॥ फलश्रुति ॥

इदं हि नित्यमेवमुक्तमुत्तमोत्तमं स्तवं
पठन्स्मरन्ब्रुवन्नरो विशुद्धिमेति सन्ततम्।
हरे गुरौ सुभक्तिमाशु याति नान्यथा गतिं
विमोहनं हि देहिनां सुशङ्करस्य चिन्तनम्॥

पूजावसानसमये दशवक्त्रगीतं
यः शम्भुपूजनपरं पठति प्रदोषे।
तस्य स्थिरां रथगजेन्द्रतुरङ्गयुक्तां
लक्ष्मीं सदैव सुमुखीं प्रददाति शम्भुः॥`,
    bodyEn: `Shiv Tandav Stotram, composed by Ravana

Jatatavigalajjalapravahapavitasthale
gale'valambya lambitam bhujangatungamalikam.
Damaddamaddamaddamanninadavaddamarvayam
chakara chandatandavam tanotu nah Shivah shivam. (1)

Jatakatahasambhramabhramannilimpanirjhari-
vilolavichivallarivirajamanamurdhani.
Dhagaddhagaddhagajjvalallalatapattapavake
kishorachandrashekhare ratih pratikshanam mama. (2)

Dharadharendranandinivilasabandhubandhura-
sphuraddigantasantatipramodamanamanase.
Kripakatakshadhoraniniruddhadurdharapadi
kvachiddigambare mano vinodametu vastuni. (3)

Jatabhujangapingalasphuratphanamaniprabha-
kadambakunkumadravapraliptadigvadhumukhe.
Madandhasindhurasphurattvaguttariyamedure
mano vinodamadbhutam bibhartu bhutabhartari. (4)

Sahasralochanaprabhrityasheshalekhashekhara-
prasunadhulidhorani vidhusaranghripithabhuh.
Bhujangarajamalaya nibaddhajatajutakah
shriyai chiraya jayatam chakorabandhushekharah. (5)

Lalatachatvarajvaladdhananjayasphulingabha-
nipitapanchasayakam namannilimpanayakam.
Sudhamayukhalekhaya virajamanashekharam
mahakapalisampadeshirojatalamastu nah. (6)

Karalabhalapattikadhagaddhagaddhagajjvala-
ddhananjayahutikritaprachandapanchasayake.
Dharadharendranandinikuchagrachitrapatraka-
prakalpanaikashilpini trilochane ratirmama. (7)

Navinameghamandalaniruddhadurdharasphurat-
kuhunishithinitamah prabandhabaddhakandharah.
Nilimpanirjharidharastanotu krittisindhurah
kalanidhanabandhurah shriyam jagaddhurandharah. (8)

Praphullanilapankajaprapanchakalimaprabha-
valambikanthakandalaruchiprabaddhakandharam.
Smarachchhidam purachchhidam bhavachchhidam makhachchhidam
gajachchhidandhakachchhidam tamantakachchhidam bhaje. (9)

Akharvasarvamangalakalakadambamanjari-
rasapravahamadhurivijrimbhanamadhuvratam.
Smarantakam purantakam bhavantakam makhantakam
gajantakandhakantakam tamantakantakam bhaje. (10)

Phalashruti:
Idam hi nityamevamuktamuttamottamam stavam
pathansmaranbruvannaro vishuddhimeti santatam.
Hare gurau subhaktimashu yati nanyatha gatim
vimohanam hi dehinam Sushankarasya chintanam.

Pujavasanasamaye dashavaktragitam
yah Shambhupujanaparam pathati pradoshe.
Tasya sthiram rathagajendraturangayuktam
Lakshmim sadaiva sumukhim pradadati Shambhuh.

Meaning: Ravana's hymn to Shiva, sung, the tradition says, while he was pinned beneath Kailash — which is why its metre moves like the tandava itself, with the damaru sounding "damad damad damad daman" inside the verse. The imagery is relentless: Ganga rushing through the forest of matted hair, a garland of tall serpents at the throat, fire blazing from the flat of the brow with the young moon set above it, the jewels on the serpent-hoods smearing the faces of the directions with saffron light, and the reeking hide of a maddened elephant for an upper garment. The devotee does not ask for anything for several verses at a time — he simply says "may my delight be in that", "may my love be in the three-eyed one at every instant". The ninth and tenth verses drive the point home in a hammering list: I worship the one who cut off Kama, the three cities, worldly existence, Daksha's sacrifice, the elephant demon, Andhaka, and Death itself. The phalashruti promises purity, immediate devotion to Hara, and — for whoever reads it at Pradosh after the pooja — a settled prosperity. Recited on Pradosh, on Mahashivratri and during Bhasma Aarti.`,
    tags: ["shiva", "stotra", "pradosh", "shivratri", "ravana", "tandav"],
    featured: true,
    imageUrl: svc("bhasma-aarti-sankalp-mahakal"),
  },
  {
    slug: "stotra-ram-raksha",
    type: "STOTRA",
    titleEn: "Ram Raksha Stotra",
    titleHi: "श्रीरामरक्षास्तोत्रम्",
    deityEn: "Lord Rama",
    deityHi: "भगवान श्रीराम",
    bodyHi: `॥ श्रीरामरक्षास्तोत्रम् ॥

चरितं रघुनाथस्य शतकोटिप्रविस्तरम्।
एकैकमक्षरं पुंसां महापातकनाशनम्॥

ध्यायेदाजानुबाहुं धृतशरधनुषं बद्धपद्मासनस्थं
पीतं वासो वसानं नवकमलदलस्पर्धिनेत्रं प्रसन्नम्।
वामाङ्कारूढसीतामुखकमलमिलल्लोचनं नीरदाभं
नानालङ्कारदीप्तं दधतमुरुजटामण्डलं रामचन्द्रम्॥

रामरक्षां पठेत्प्राज्ञः पापघ्नीं सर्वकामदाम्।
शिरो मे राघवः पातु भालं दशरथात्मजः॥

कौसल्येयो दृशौ पातु विश्वामित्रप्रियः श्रुती।
घ्राणं पातु मखत्राता मुखं सौमित्रिवत्सलः॥

जिह्वां विद्यानिधिः पातु कण्ठं भरतवन्दितः।
स्कन्धौ दिव्यायुधः पातु भुजौ भग्नेशकार्मुकः॥

करौ सीतापतिः पातु हृदयं जामदग्न्यजित्।
मध्यं पातु खरध्वंसी नाभिं जाम्बवदाश्रयः॥

सुग्रीवेशः कटी पातु सक्थिनी हनुमत्प्रभुः।
ऊरू रघूत्तमः पातु रक्षःकुलविनाशकृत्॥

जानुनी सेतुकृत्पातु जङ्घे दशमुखान्तकः।
पादौ विभीषणश्रीदः पातु रामोऽखिलं वपुः॥

एतां रामबलोपेतां रक्षां यः सुकृती पठेत्।
स चिरायुः सुखी पुत्री विजयी विनयी भवेत्॥

पातालभूतलव्योमचारिणश्छद्मचारिणः।
न द्रष्टुमपि शक्तास्ते रक्षितं रामनामभिः॥

रामेति रामभद्रेति रामचन्द्रेति वा स्मरन्।
नरो न लिप्यते पापैर्भुक्तिं मुक्तिं च विन्दति॥

जगज्जैत्रैकमन्त्रेण रामनाम्नाभिरक्षितम्।
यः कण्ठे धारयेत्तस्य करस्थाः सर्वसिद्धयः॥

वज्रपञ्जरनामेदं यो रामकवचं स्मरेत्।
अव्याहताज्ञः सर्वत्र लभते जयमङ्गलम्॥

आदिष्टवान्यथा स्वप्ने रामरक्षामिमां हरः।
तथा लिखितवान्प्रातः प्रबुद्धो बुधकौशिकः॥

आरामः कल्पवृक्षाणां विरामः सकलापदाम्।
अभिरामस्त्रिलोकानां रामः श्रीमान्स नः प्रभुः॥

तरुणौ रूपसम्पन्नौ सुकुमारौ महाबलौ।
पुण्डरीकविशालाक्षौ चीरकृष्णाजिनाम्बरौ॥

फलमूलाशिनौ दान्तौ तापसौ ब्रह्मचारिणौ।
पुत्रौ दशरथस्यैतौ भ्रातरौ रामलक्ष्मणौ॥

शरण्यौ सर्वसत्त्वानां श्रेष्ठौ सर्वधनुष्मताम्।
रक्षःकुलनिहन्तारौ त्रायेतां नो रघूत्तमौ॥

आत्तसज्जधनुषा विषुस्पृशावक्षयाशुगनिषङ्गसङ्गिनौ।
रक्षणाय मम रामलक्ष्मणावग्रतः पथि सदैव गच्छताम्॥

सन्नद्धः कवची खड्गी चापबाणधरो युवा।
गच्छन्मनोरथोऽस्माकं रामः पातु सलक्ष्मणः॥

रामो दाशरथिः शूरो लक्ष्मणानुचरो बली।
काकुत्स्थः पुरुषः पूर्णः कौसल्येयो रघूत्तमः॥

वेदान्तवेद्यो यज्ञेशः पुराणपुरुषोत्तमः।
जानकीवल्लभः श्रीमानप्रमेयपराक्रमः॥

इत्येतानि जपेन्नित्यं मद्भक्तः श्रद्धयान्वितः।
अश्वमेधाधिकं पुण्यं सम्प्राप्नोति न संशयः॥

रामं दूर्वादलश्यामं पद्माक्षं पीतवाससम्।
स्तुवन्ति नामभिर्दिव्यैर्न ते संसारिणो नराः॥

रामं लक्ष्मणपूर्वजं रघुवरं सीतापतिं सुन्दरं
काकुत्स्थं करुणार्णवं गुणनिधिं विप्रप्रियं धार्मिकम्।
राजेन्द्रं सत्यसन्धं दशरथतनयं श्यामलं शान्तमूर्तिं
वन्दे लोकाभिरामं रघुकुलतिलकं राघवं रावणारिम्॥

रामाय रामभद्राय रामचन्द्राय वेधसे।
रघुनाथाय नाथाय सीतायाः पतये नमः॥

श्रीराम राम रघुनन्दन राम राम
श्रीराम राम भरताग्रज राम राम।
श्रीराम राम रणकर्कश राम राम
श्रीराम राम शरणं भव राम राम॥

श्रीरामचन्द्रचरणौ मनसा स्मरामि
श्रीरामचन्द्रचरणौ वचसा गृणामि।
श्रीरामचन्द्रचरणौ शिरसा नमामि
श्रीरामचन्द्रचरणौ शरणं प्रपद्ये॥

माता रामो मत्पिता रामचन्द्रः
स्वामी रामो मत्सखा रामचन्द्रः।
सर्वस्वं मे रामचन्द्रो दयालु-
र्नान्यं जाने नैव जाने न जाने॥

दक्षिणे लक्ष्मणो यस्य वामे च जनकात्मजा।
पुरतो मारुतिर्यस्य तं वन्दे रघुनन्दनम्॥

लोकाभिरामं रणरङ्गधीरं राजीवनेत्रं रघुवंशनाथम्।
कारुण्यरूपं करुणाकरं तं श्रीरामचन्द्रं शरणं प्रपद्ये॥

मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्।
वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥

कूजन्तं राम रामेति मधुरं मधुराक्षरम्।
आरुह्य कविताशाखां वन्दे वाल्मीकिकोकिलम्॥

आपदामपहर्तारं दातारं सर्वसम्पदाम्।
लोकाभिरामं श्रीरामं भूयो भूयो नमाम्यहम्॥

भर्जनं भवबीजानामर्जनं सुखसम्पदाम्।
तर्जनं यमदूतानां रामरामेति गर्जनम्॥

रामो राजमणिः सदा विजयते रामं रमेशं भजे
रामेणाभिहता निशाचरचमू रामाय तस्मै नमः।
रामान्नास्ति परायणं परतरं रामस्य दासोऽस्म्यहं
रामे चित्तलयः सदा भवतु मे भो राम मामुद्धर॥

श्रीराम राम रामेति रमे रामे मनोरमे।
सहस्रनाम तत्तुल्यं रामनाम वरानने॥`,
    bodyEn: `Charitam Raghunathasya shatakotipravistaram.
Ekaikamaksharam pumsam mahapatakanashanam.

Dhyayedajanubahum dhritasharadhanusham baddhapadmasanastham
pitam vaso vasanam navakamaladalaspardhinetram prasannam.
Vamankarudhasitamukhakamalamilallochanam niradabham
nanalankaradiptam dadhatamurujatamandalam Ramachandram.

Ramaraksham pathetprajnah papaghnim sarvakamadam.
Shiro me Raghavah patu bhalam Dasharathatmajah.

Kausalyeyo drishau patu Vishvamitrapriyah shruti.
Ghranam patu makhatrata mukham Saumitrivatsalah.

Jihvam vidyanidhih patu kantham Bharatavanditah.
Skandhau divyayudhah patu bhujau bhagneshakarmukah.

Karau Sitapatih patu hridayam Jamadagnyajit.
Madhyam patu Kharadhvamsi nabhim Jambavadashrayah.

Sugriveshah kati patu sakthini Hanumatprabhuh.
Uru Raghuttamah patu rakshahkulavinashakrit.

Januni setukritpatu janghe Dashamukhantakah.
Padau Vibhishanashridah patu Ramo'khilam vapuh.

Etam Ramabalopetam raksham yah sukriti pathet.
Sa chirayuh sukhi putri vijayi vinayi bhavet.

Patalabhutalavyomacharinashchhadmacharinah.
Na drashtumapi shaktaste rakshitam Ramanamabhih.

Rameti Ramabhadreti Ramachandreti va smaran.
Naro na lipyate papairbhuktim muktim cha vindati.

Jagajjaitraikamantrena Ramanamnabhirakshitam.
Yah kanthe dharayettasya karasthah sarvasiddhayah.

Vajrapanjaranamedam yo Ramakavacham smaret.
Avyahatajnah sarvatra labhate jayamangalam.

Adishtavanyatha svapne Ramarakshamimam Harah.
Tatha likhitavanpratah prabuddho Budhakaushikah.

Aramah kalpavrikshanam viramah sakalapadam.
Abhiramastrilokanam Ramah Shriman sa nah prabhuh.

Tarunau rupasampannau sukumarau mahabalau.
Pundarikavishalakshau chirakrishnajinambarau.

Phalamulashinau dantau tapasau brahmacharinau.
Putrau Dasharathasyaitau bhratarau Ramalakshmanau.

Sharanyau sarvasattvanam shreshthau sarvadhanushmatam.
Rakshahkulanihantarau trayetam no Raghuttamau.

Attasajjadhanusha vishusprishavakshayashuganishangasanginau.
Rakshanaya mama Ramalakshmanavagratah pathi sadaiva gachchhatam.

Sannaddhah kavachi khadgi chapabanadharo yuva.
Gachchhanmanoratho'smakam Ramah patu salakshmanah.

Ramo Dasharathih shuro Lakshmananucharo bali.
Kakutsthah purushah purnah Kausalyeyo Raghuttamah.

Vedantavedyo yajnesho puranapurushottamah.
Janakivallabhah Shriman aprameyaparakramah.

Ityetani japennityam madbhaktah shraddhayanvitah.
Ashvamedhadhikam punyam samprapnoti na samshayah.

Ramam durvadalashyamam padmaksham pitavasasam.
Stuvanti namabhirdivyairna te samsarino narah.

Ramam Lakshmanapurvajam Raghuvaram Sitapatim sundaram
Kakutstham karunarnavam gunanidhim viprapriyam dharmikam.
Rajendram satyasandham Dasharathatanayam shyamalam shantamurtim
vande lokabhiramam Raghukulatilakam Raghavam Ravanarim.

Ramaya Ramabhadraya Ramachandraya vedhase.
Raghunathaya nathaya Sitayah pataye namah.

Shriram Ram Raghunandana Ram Ram
Shriram Ram Bharatagraja Ram Ram.
Shriram Ram ranakarkasha Ram Ram
Shriram Ram sharanam bhava Ram Ram.

Shriramachandracharanau manasa smarami
Shriramachandracharanau vachasa grinami.
Shriramachandracharanau shirasa namami
Shriramachandracharanau sharanam prapadye.

Mata Ramo matpita Ramachandrah
svami Ramo matsakha Ramachandrah.
Sarvasvam me Ramachandro dayalur
nanyam jane naiva jane na jane.

Dakshine Lakshmano yasya vame cha Janakatmaja.
Purato Marutiryasya tam vande Raghunandanam.

Lokabhiramam ranarangadhiram rajivanetram Raghuvamshanatham.
Karunyarupam karunakaram tam Shriramachandram sharanam prapadye.

Manojavam marutatulyavegam jitendriyam buddhimatam varishtham.
Vatatmajam vanarayuthamukhyam Shriramadutam sharanam prapadye.

Kujantam Ram Rameti madhuram madhuraksharam.
Aruhya kavitashakham vande Valmikikokilam.

Apadamapahartaram dataram sarvasampadam.
Lokabhiramam Shriramam bhuyo bhuyo namamyaham.

Bharjanam bhavabijanamarjanam sukhasampadam.
Tarjanam Yamadutanam Rama Rameti garjanam.

Ramo rajamanih sada vijayate Ramam Ramesham bhaje
Ramenabhihata nishacharachamu Ramaya tasmai namah.
Ramannasti parayanam parataram Ramasya daso'smyaham
Rame chittalayah sada bhavatu me bho Ram mamuddhara.

Shriram Ram Rameti rame Rame manorame.
Sahasranama tattulyam Ramanama varanane.

Meaning: Budhakaushika's Ram Raksha Stotra is a kavach — an armour — said to have been dictated to him by Shiva in a dream. After a dhyana verse picturing Rama seated in padmasana with bow and arrow, dark as a raincloud, his gaze meeting Sita's lotus face at his left, the stotra assigns a name of Rama to guard each part of the body from head to foot: Raghava the head, Dasharatha's son the brow, Kausalya's son the eyes, Vishvamitra's beloved the ears, and so on down through Sugriva's lord at the waist, Hanuman's master at the thighs, the bridge-builder at the knees and the giver of fortune to Vibhishan at the feet. It then declares that those protected by Rama's names cannot even be seen by beings that move in the underworld, on earth or in the sky, or by those who go about in disguise. The closing section is the part most often recited on its own — the vow that Rama is mother, father, master and friend, the description of him with Lakshman at his right and Janaki at his left and Maruti before him, the shloka to Hanuman as manojavam marutatulyavegam, and the famous "Ramo rajamanih sada vijayate". The last verse tells Parvati that the single name Rama equals the thousand names of Vishnu. Recited on Ram Navami, during Ramayana paath, and for protection before travel.`,
    tags: ["rama", "stotra", "kavach", "protection", "ram-navami"],
    featured: false,
    imageUrl: svc("vishnu-sahasranam-badrinath"),
  },
];

export const CONTENT_SLUGS = CONTENT.map((c) => c.slug);
