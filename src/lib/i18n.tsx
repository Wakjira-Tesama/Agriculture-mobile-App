import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "am" | "om" | "so" | "ti";

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "am", label: "Amharic", native: "አማርኛ" },
  { code: "om", label: "Afaan Oromo", native: "Afaan Oromoo" },
  { code: "so", label: "Somali", native: "Soomaali" },
  { code: "ti", label: "Tigrinya", native: "ትግርኛ" },
];

// Maps app language to a BCP-47 voice tag for text-to-speech (best effort).
export const SPEECH_LANG: Record<Lang, string> = {
  en: "en-US",
  am: "am-ET",
  om: "om-ET",
  so: "so-SO",
  ti: "ti-ET",
};

type Dict = Record<string, Partial<Record<Lang, string>>>;

const dict: Dict = {
  // ---- Navigation / common ----
  greeting: { en: "Selam", am: "ሰላም", om: "Akkam", so: "Salaam", ti: "ሰላም" },
  home: { en: "Home", am: "መነሻ", om: "Mana", so: "Guriga", ti: "መበገሲ" },
  learn: { en: "Learn", am: "ይማሩ", om: "Baradhu", so: "Baro", ti: "ተማር" },
  market: { en: "Market", am: "ገበያ", om: "Gabaa", so: "Suuq", ti: "ዕዳጋ" },
  assistant: { en: "Assistant", am: "ረዳት", om: "Gargaaraa", so: "Kaaliye", ti: "ሓጋዚ" },
  expert: { en: "Expert", am: "ባለሙያ", om: "Ogeessa", so: "Khabiir", ti: "ክኢላ" },
  weather: { en: "Weather", am: "የአየር ሁኔታ", om: "Haala Qilleensaa", so: "Cimilada", ti: "ኩነታት ኣየር" },
  community: { en: "Community", am: "ማህበረሰብ", om: "Hawaasa", so: "Bulshada", ti: "ማሕበረሰብ" },
  profile: { en: "Profile", am: "መገለጫ", om: "Profaayilii", so: "Astaan", ti: "መግለጺ" },
  prices: { en: "Prices", am: "ዋጋዎች", om: "Gatii", so: "Qiimaha", ti: "ዋጋ" },
  notifications: { en: "Notifications", am: "ማሳወቂያዎች", om: "Beeksisa", so: "Ogeysiisyo", ti: "ምልክታታት" },
  all: { en: "All", am: "ሁሉም", om: "Hunda", so: "Dhammaan", ti: "ኩሉ" },
  contact: { en: "Contact", am: "አግኝ", om: "Quunnamtii", so: "La xiriir", ti: "ርኸብ" },
  post: { en: "Post", am: "ለጥፍ", om: "Maxxansi", so: "Dhig", ti: "ለጥፍ" },
  submit: { en: "Submit", am: "አስገባ", om: "Ergi", so: "Gudbi", ti: "ኣእቱ" },
  voice: { en: "Voice", am: "ድምፅ", om: "Sagalee", so: "Cod", ti: "ድምፂ" },
  photo: { en: "Photo", am: "ፎቶ", om: "Suuraa", so: "Sawir", ti: "ስእሊ" },
  signIn: { en: "Sign in", am: "ግባ", om: "Seeni", so: "Gal", ti: "እቶ" },
  signInRegister: { en: "Sign in / Register", am: "ግባ / ተመዝገብ", om: "Seeni / Galmaa'i", so: "Gal / Diiwaangeli", ti: "እቶ / ተመዝገብ" },
  signOut: { en: "Sign Out", am: "ውጣ", om: "Ba'i", so: "Ka bax", ti: "ውፃእ" },
  search: { en: "Search…", am: "ፈልግ…", om: "Barbaadi…", so: "Raadi…", ti: "ድለ…" },
  listen: { en: "Listen", am: "አዳምጥ", om: "Dhaggeeffadhu", so: "Dhageyso", ti: "ስማዕ" },

  // ---- Voice navigation ----
  voiceNav: { en: "Voice command", am: "በድምፅ ይምሩ", om: "Sagaleen ajaja", so: "Amar cod", ti: "ብድምፂ ምእዛዝ" },
  voiceListening: { en: "Listening… say a page name", am: "በማዳመጥ ላይ… የገጽ ስም ይናገሩ", om: "Dhaggeeffachaa jira… maqaa fuulaa dubbadhu", so: "Waan dhageysanayaa… magaca bogga dheh", ti: "ይሰምዕ ኣሎ… ስም ገጽ ተዛረብ" },
  voiceHint: { en: "Try: \"Market\", \"Weather\", \"Assistant\", \"Learn\", \"Sell\"", am: "ሞክር፦ \"ገበያ\"፣ \"የአየር ሁኔታ\"፣ \"ረዳት\"፣ \"ይማሩ\"፣ \"ሽጥ\"", om: "Yaali: \"Gabaa\", \"Qilleensa\", \"Gargaaraa\", \"Baradhu\", \"Gurguri\"", so: "Isku day: \"Suuq\", \"Cimilo\", \"Kaaliye\", \"Baro\", \"Iibi\"", ti: "ፈትን፦ \"ዕዳጋ\"፣ \"ኣየር\"፣ \"ሓጋዚ\"፣ \"ተማር\"፣ \"ሽጥ\"" },
  voiceHeard: { en: "Heard", am: "ተሰማ", om: "Dhaga'ame", so: "La maqlay", ti: "ተሰምዐ" },
  voiceGoing: { en: "Opening", am: "በመክፈት ላይ", om: "Banaa jira", so: "Furaya", ti: "ይኽፈት ኣሎ" },
  voiceNoMatch: { en: "Sorry, I didn't catch a page. Try again.", am: "ይቅርታ፣ ገጽ አልሰማሁም። እንደገና ይሞክሩ።", om: "Dhiifama, fuula hin dhageenye. Irra deebi'i.", so: "Waan ka xumahay, bog ma helin. Mar kale isku day.", ti: "ይቕሬታ፣ ገጽ ኣይሰማዕኩን። ደጊምካ ፈትን።" },
  voiceUnsupported: { en: "Voice not supported on this device.", am: "በዚህ መሣሪያ ድምፅ አይደገፍም።", om: "Meeshaa kana irratti sagaleen hin deeggaramu.", so: "Codka laguma taageero qalabkan.", ti: "ኣብዚ መሳርሒ ድምፂ ኣይድገፍን።" },
  voiceClose: { en: "Close", am: "ዝጋ", om: "Cufi", so: "Xir", ti: "ዕጾ" },

  // ---- Voice: read page aloud ----
  voiceReadPage: { en: "Read this page", am: "ይህን ገጽ አንብብ", om: "Fuula kana dubbisi", so: "Akhri boggan", ti: "ነዚ ገጽ ኣንብብ" },
  voiceReading: { en: "Reading the page aloud…", am: "ገጹን በድምፅ በማንበብ ላይ…", om: "Fuula sagaleen dubbisaa jira…", so: "Bogga cod ku akhrinaya…", ti: "ነቲ ገጽ ብድምፂ የንብብ ኣሎ…" },
  voiceReadHint: { en: "Say \"Read\" to hear everything on this page", am: "በዚህ ገጽ ላይ ያለውን ሁሉ ለመስማት \"አንብብ\" ይበሉ", om: "Waan fuula kana irra jiru hunda dhaggeeffachuuf \"Dubbisi\" jedhi", so: "Dheh \"Akhri\" si aad u maqasho wax kasta oo boggan ku jira", ti: "ኣብዚ ገጽ ዘሎ ኹሉ ንምስማዕ \"ኣንብብ\" በል" },
  voiceNothingToRead: { en: "Nothing to read on this page.", am: "በዚህ ገጽ ላይ የሚነበብ ነገር የለም።", om: "Fuula kana irra wanti dubbifamu hin jiru.", so: "Wax la akhriyo boggan kuma jiraan.", ti: "ኣብዚ ገጽ ዝንበብ ነገር የለን።" },

  // ---- Voice: page description + item selection ----
  voiceOnPage: { en: "You are on the {page} page.", am: "በ{page} ገጽ ላይ ነዎት።", om: "Fuula {page} irra jirta.", so: "Waxaad ku jirtaa bogga {page}.", ti: "ኣብ ገጽ {page} ኣለኻ።" },
  voiceItemsHere: { en: "Here you can choose:", am: "እዚህ መምረጥ ይችላሉ፦", om: "Asitti filachuu dandeessa:", so: "Halkan waxaad dooran kartaa:", ti: "ኣብዚ ክትመርጽ ትኽእል፦" },
  voiceSayItem: { en: "Say the name of what you want, or say another page name.", am: "የሚፈልጉትን ስም ይናገሩ፣ ወይም ሌላ የገጽ ስም ይናገሩ።", om: "Maqaa waan barbaaddu dubbadhu, yookaan maqaa fuula biraa dubbadhu.", so: "Dheh magaca waxa aad rabto, ama dheh magac bog kale.", ti: "ስም እቲ እትደልዮ ተዛረብ፣ ወይ ካልእ ስም ገጽ ተዛረብ።" },
  voiceSelected: { en: "Selected", am: "ተመረጠ", om: "Filatame", so: "La doortay", ti: "ተመሪጹ" },
  voiceDetailsFor: { en: "Details for", am: "ዝርዝር ለ", om: "Odeeffannoo guutuu", so: "Faahfaahinta", ti: "ዝርዝር ን" },
  voiceTakeYourTime: { en: "Take your time. When you are ready, say the name of what you want.", am: "ጊዜ ይውሰዱ። ዝግጁ ሲሆኑ የሚፈልጉትን ስም ይናገሩ።", om: "Yeroo fudhadhu. Yeroo qophoofte, maqaa waan barbaaddu dubbadhu.", so: "Waqti qaado. Markaad diyaar tahay, dheh magaca waxa aad rabto.", ti: "ግዜ ውሰድ። ምስ ተዳለኻ፣ ስም እቲ እትደልዮ ተዛረብ።" },
  voiceNoItems: { en: "No items to choose on this page.", am: "በዚህ ገጽ ላይ የሚመረጥ ነገር የለም።", om: "Fuula kana irra wanti filatamu hin jiru.", so: "Wax la doorto boggan kuma jiraan.", ti: "ኣብዚ ገጽ ዝምረጽ ነገር የለን።" },
  voiceAndMore: { en: "and more", am: "እና ሌሎች", om: "fi kanneen biroo", so: "iyo kuwo kale", ti: "ከምኡ'ውን ካልኦት" },

  // ---- Home ----
  qa_assistant: { en: "AI Assistant", am: "AI ረዳት", om: "Gargaaraa AI", so: "Kaaliye AI", ti: "AI ሓጋዚ" },
  qa_sell: { en: "Sell Produce", am: "ምርት ሽጥ", om: "Oomisha Gurguri", so: "Iibi Wax-soo-saar", ti: "ምህርቲ ሽጥ" },
  qa_expert: { en: "Ask Expert", am: "ባለሙያ ጠይቅ", om: "Ogeessa Gaafadhu", so: "Weydii Khabiir", ti: "ንክኢላ ሕተት" },
  qa_learn: { en: "Learning", am: "ትምህርት", om: "Barumsa", so: "Barasho", ti: "ትምህርቲ" },
  qa_market: { en: "Market", am: "ገበያ", om: "Gabaa", so: "Suuq", ti: "ዕዳጋ" },
  qa_community: { en: "Community", am: "ማህበረሰብ", om: "Hawaasa", so: "Bulshada", ti: "ማሕበረሰብ" },
  todayPrices: { en: "Today's Market Prices", am: "የዛሬ የገበያ ዋጋዎች", om: "Gatii Gabaa Har'aa", so: "Qiimaha Suuqa Maanta", ti: "ዋጋ ዕዳጋ ሎሚ" },
  perUnit: { en: "per", am: "በ", om: "tokkoon", so: "halkii", ti: "ብ" },
  askAI: { en: "Ask the AI Assistant", am: "AI ረዳቱን ጠይቅ", om: "Gargaaraa AI Gaafadhu", so: "Weydii Kaaliyaha AI", ti: "ንAI ሓጋዚ ሕተት" },
  askAIDesc: { en: "Crop, soil, livestock & weather advice — by voice or photo.", am: "ስለ ሰብል፣ አፈር፣ እንስሳትና የአየር ሁኔታ — በድምፅ ወይም በፎቶ።", om: "Gorsa midhaan, biyyee, beeyladaa fi qilleensaa — sagalee ykn suuraan.", so: "Talo dalagaha, carrada, xoolaha & cimilada — cod ama sawir.", ti: "ምኽሪ እኽሊ፣ ሓመድ፣ እንስሳ ከምኡ'ውን ኩነታት ኣየር — ብድምፂ ወይ ስእሊ።" },
  portalNote: { en: "Need a buyer or admin view?", am: "የገዢ ወይም የአስተዳዳሪ እይታ ይፈልጋሉ?", om: "Mul'ata bitataa ykn bulchaa barbaadduu?", so: "Ma u baahan tahay aragtida iibsadaha ama maamulka?", ti: "ናይ ዓዳጊ ወይ ኣመሓዳሪ ትርኢት ይደለ?" },
  openPortals: { en: "Open web portals →", am: "የድር መግቢያዎችን ክፈት →", om: "Karra weebii bani →", so: "Fur boggaga shabakadda →", ti: "ናይ ወብ መእተዊ ክፈት →" },

  // ---- Learn ----
  learningCenter: { en: "Learning Center", am: "የትምህርት ማዕከል", om: "Wiirtuu Barumsaa", so: "Xarunta Waxbarashada", ti: "ማእከል ትምህርቲ" },
  learnDesc: { en: "Audio, video & guides — download for offline use.", am: "ድምፅ፣ ቪዲዮና መመሪያዎች — ከመስመር ውጭ ለመጠቀም አውርድ።", om: "Sagalee, viidiyoo fi qajeelfama — offline fayyadamuuf buufadhu.", so: "Cod, muuqaal & hagayaal — soo deji isticmaal offline.", ti: "ድምፂ፣ ቪድዮን መምርሕን — ብዘይ መስመር ንምጥቃም ኣውርድ።" },

  // ---- Market ----
  marketplace: { en: "Marketplace", am: "የገበያ ቦታ", om: "Iddoo Gabaa", so: "Suuqa", ti: "ቦታ ዕዳጋ" },
  listingsNear: { en: "listings near you", am: "ከእርስዎ አጠገብ ዝርዝሮች", om: "tarreewwan si bira jiran", so: "liisas kuu dhow", ti: "ኣብ ጥቓኻ ዘለዉ ዝርዝራት" },
  marketPricesLink: { en: "Market prices →", am: "የገበያ ዋጋዎች →", om: "Gatii gabaa →", so: "Qiimaha suuqa →", ti: "ዋጋ ዕዳጋ →" },

  // ---- Weather ----
  weatherTitle: { en: "Weather & Climate", am: "የአየር ሁኔታና የአየር ንብረት", om: "Qilleensaa fi Haala Qilleensaa", so: "Cimilada", ti: "ኩነታት ኣየርን ኣየር ንብረትን" },
  forecast7: { en: "7-Day Forecast", am: "የ7 ቀን ትንበያ", om: "Tilmaama Guyyaa 7", so: "Saadaasha 7-Maalmood", ti: "ትንበያ 7 መዓልቲ" },
  activeAlerts: { en: "Active Alerts", am: "ንቁ ማስጠንቀቂያዎች", om: "Akeekkachiisa Yeroo Ammaa", so: "Digniinaha Firfircoon", ti: "ንጡፍ መጠንቀቕታታት" },

  // ---- Sell ----
  sellProduce: { en: "Sell Produce", am: "ምርት ሽጥ", om: "Oomisha Gurguri", so: "Iibi Wax-soo-saar", ti: "ምህርቲ ሽጥ" },
  signInToSell: { en: "Sign in to sell", am: "ለመሸጥ ግባ", om: "Gurguruuf seeni", so: "Gal si aad u iibiso", ti: "ንምሻጥ እቶ" },
  signInToSellDesc: { en: "Create a free account to list your produce to verified buyers.", am: "ምርትዎን ለተረጋገጡ ገዢዎች ለማስተዋወቅ ነፃ መለያ ይክፈቱ።", om: "Oomisha kee bitattoota mirkanaa'aniif dhiyeessuuf herrega bilisaa bani.", so: "Samee xisaab bilaash ah si aad ugu liisato wax-soo-saarkaaga iibsadayaal la xaqiijiyay.", ti: "ምህርትኻ ናብ ዝተረጋገጹ ዓደግቲ ንምዝርዛር ናጻ ሕሳብ ክፈት።" },
  addPhotos: { en: "Add crop photos", am: "የሰብል ፎቶዎች ጨምር", om: "Suuraa midhaanii dabali", so: "Ku dar sawirro dalagga", ti: "ስእሊ እኽሊ ወስኽ" },
  cropName: { en: "Crop name", am: "የሰብል ስም", om: "Maqaa midhaanii", so: "Magaca dalagga", ti: "ስም እኽሊ" },
  quantity: { en: "Quantity", am: "ብዛት", om: "Baay'ina", so: "Tiro", ti: "ብዝሒ" },
  unit: { en: "Unit", am: "መለኪያ", om: "Safara", so: "Halbeeg", ti: "መለክዒ" },
  priceEtb: { en: "Price (ETB)", am: "ዋጋ (ብር)", om: "Gatii (ETB)", so: "Qiimaha (ETB)", ti: "ዋጋ (ብር)" },
  location: { en: "Location", am: "አካባቢ", om: "Bakka", so: "Goobta", ti: "ቦታ" },
  harvestDate: { en: "Harvest date", am: "የመኸር ቀን", om: "Guyyaa sassaabbii", so: "Taariikhda goosashada", ti: "ዕለት ቀውዒ" },
  publishListing: { en: "Publish Listing", am: "ዝርዝር አትም", om: "Tarree Maxxansi", so: "Daabac Liiska", ti: "ዝርዝር ኣሕትም" },
  listingPublished: { en: "Listing Published!", am: "ዝርዝሩ ታትሟል!", om: "Tarreen Maxxanfame!", so: "Liiska waa la daabacay!", ti: "ዝርዝር ተሓቲሙ!" },
  listingPublishedDesc: { en: "Verified buyers near you will be notified.", am: "ከእርስዎ አጠገብ ያሉ የተረጋገጡ ገዢዎች ይነገራቸዋል።", om: "Bitattoonni mirkanaa'an si bira jiran ni beeksifamu.", so: "Iibsadayaasha la xaqiijiyay ee kuu dhow waa la ogeysiin doonaa.", ti: "ኣብ ጥቓኻ ዘለዉ ዝተረጋገጹ ዓደግቲ ክሕበሩ እዮም።" },
  viewMarketplace: { en: "View Marketplace", am: "የገበያ ቦታ እይ", om: "Iddoo Gabaa Ilaali", so: "Eeg Suuqa", ti: "ዕዳጋ ርአ" },

  // ---- Expert ----
  expertAdvisory: { en: "Expert Advisory", am: "የባለሙያ ምክር", om: "Gorsa Ogeessaa", so: "Talo Khabiir", ti: "ምኽሪ ክኢላ" },
  askExpert: { en: "Ask an Expert", am: "ባለሙያ ጠይቅ", om: "Ogeessa Gaafadhu", so: "Weydii Khabiir", ti: "ንክኢላ ሕተት" },
  askExpertDesc: { en: "Type, record a voice note, or upload a photo / video.", am: "ጻፍ፣ የድምፅ ማስታወሻ ቅረጽ ወይም ፎቶ / ቪዲዮ ስቀል።", om: "Barreessi, sagalee waraabi, ykn suuraa / viidiyoo ol kaa'i.", so: "Qor, duub cod, ama soo geli sawir / muuqaal.", ti: "ጽሓፍ፣ ድምፂ ቀድሕ፣ ወይ ስእሊ / ቪድዮ ጽዓን።" },
  describeProblem: { en: "Describe your problem…", am: "ችግርዎን ይግለጹ…", om: "Rakkina kee ibsi…", so: "Sharrax dhibaatadaada…", ti: "ጸገምካ ግለጽ…" },
  availableExperts: { en: "Available Experts", am: "ያሉ ባለሙያዎች", om: "Ogeeyyii Jiran", so: "Khubarada La heli karo", ti: "ዘለዉ ክኢላታት" },
  myTickets: { en: "My Advisory Tickets", am: "የእኔ የምክር ጥያቄዎች", om: "Gaaffiwwan Gorsa Koo", so: "Codsiyadayda Talada", ti: "ናተይ ሕቶታት ምኽሪ" },

  // ---- Community ----
  shareCommunity: { en: "Share with your community…", am: "ከማህበረሰብዎ ጋር አጋራ…", om: "Hawaasa kee waliin qoodi…", so: "La wadaag bulshadaada…", ti: "ምስ ማሕበረሰብካ ኣካፍል…" },

  // ---- Prices ----
  marketPricesTitle: { en: "Market Prices", am: "የገበያ ዋጋዎች", om: "Gatii Gabaa", so: "Qiimaha Suuqa", ti: "ዋጋ ዕዳጋ" },
  thisWeek: { en: "this week", am: "በዚህ ሳምንት", om: "torban kana", so: "usbuucan", ti: "ኣብዚ ሰሙን" },
  bestSellingTime: { en: "Best selling time:", am: "ምርጥ የመሸጫ ጊዜ፡", om: "Yeroo gurgurtaa gaarii:", so: "Wakhtiga iibka ugu fiican:", ti: "ዝበለጸ ግዜ ሽያጥ:" },
  bestSellingTip: { en: "Maize prices typically peak in 2–3 weeks. Consider holding part of your harvest.", am: "የበቆሎ ዋጋ ብዙውን ጊዜ በ2–3 ሳምንታት ከፍ ይላል። የምርትዎን ክፍል ይዘው ማቆየት ያስቡበት።", om: "Gatiin boqqolloo yeroo baay'ee torban 2–3 keessatti ol ka'a. Oomisha kee irraa qabachuu yaadi.", so: "Qiimaha galleyda badanaa wuxuu sare u kacaa 2–3 toddobaad. Tixgeli inaad qabato qayb goosashadaada.", ti: "ዋጋ ዕፉን መብዛሕትኡ ግዜ ኣብ 2–3 ሰሙን ላዕሊ ይድይብ። ክፋል ቀውዕኻ ምሓዝ ሕሰበሉ።" },
  allCropsToday: { en: "All Crops Today", am: "ሁሉም ሰብሎች ዛሬ", om: "Midhaan Hunda Har'a", so: "Dhammaan Dalagga Maanta", ti: "ኩሎም እኽሊ ሎሚ" },

  // ---- Profile ----
  myProfile: { en: "My Profile", am: "የእኔ መገለጫ", om: "Profaayilii Koo", so: "Astaantayda", ti: "መግለጺ ናተይ" },
  farmer: { en: "Farmer", am: "ገበሬ", om: "Qotee bulaa", so: "Beeralay", ti: "ሓረስታይ" },
  pLocation: { en: "Location", am: "አካባቢ", om: "Bakka", so: "Goobta", ti: "ቦታ" },
  pFarmSize: { en: "Farm size", am: "የእርሻ መጠን", om: "Bal'ina qonnaa", so: "Cabbirka beerta", ti: "ስፍሓት ሕርሻ" },
  pMainCrops: { en: "Main crops", am: "ዋና ሰብሎች", om: "Midhaan ijoo", so: "Dalagaha ugu muhiimsan", ti: "ቀንዲ እኽሊ" },
  pLivestock: { en: "Livestock", am: "እንስሳት", om: "Beeyladaa", so: "Xoolaha", ti: "እንስሳ" },
  pIrrigation: { en: "Irrigation", am: "መስኖ", om: "Jallisii", so: "Waraabka", ti: "መስኖ" },
  preferredLanguage: { en: "Preferred Language", am: "የተመረጠ ቋንቋ", om: "Afaan Filatame", so: "Luqadda La doorbiday", ti: "ዝተመርጸ ቋንቋ" },
  portalsRow: { en: "Buyer · Expert · Admin Portals", am: "የገዢ · ባለሙያ · አስተዳዳሪ መግቢያዎች", om: "Karra Bitataa · Ogeessa · Bulchaa", so: "Boggaga Iibsade · Khabiir · Maamul", ti: "መእተዊ ዓዳጊ · ክኢላ · ኣመሓዳሪ" },

  // ---- Assistant ----
  aiTitle: { en: "AI Assistant", am: "AI ረዳት", om: "Gargaaraa AI", so: "Kaaliye AI", ti: "AI ሓጋዚ" },
  aiStatus: { en: "● Online · Crop · Soil · Livestock · Weather", am: "● ላይ · ሰብል · አፈር · እንስሳት · አየር", om: "● Online · Midhaan · Biyyee · Beeylada · Qilleensa", so: "● Online · Dalag · Carro · Xoolo · Cimilo", ti: "● ኦንላይን · እኽሊ · ሓመድ · እንስሳ · ኣየር" },
  aiPlaceholder: { en: "Ask your question…", am: "ጥያቄዎን ይጠይቁ…", om: "Gaaffii kee gaafadhu…", so: "Weydii su'aashaada…", ti: "ሕቶኻ ሕተት…" },
  aiThinking: { en: "Thinking…", am: "በማሰብ ላይ…", om: "Yaadaa jira…", so: "Waan ka fikiraya…", ti: "ይሓስብ ኣሎ…" },
  aiWelcome: { en: "Selam! Akkam! I'm your AgriBridge assistant 🌿 Ask me anything about your farm — type, speak, or upload a photo.", am: "ሰላም! እኔ የAgriBridge ረዳትዎ ነኝ 🌿 ስለ እርሻዎ ማንኛውንም ይጠይቁኝ — ይጻፉ፣ ይናገሩ ወይም ፎቶ ይላኩ።", om: "Akkam! Ani gargaaraa AgriBridge kee ti 🌿 Waa'ee qonna kee waan barbaadde na gaafadhu — barreessi, dubbadhu, ykn suuraa ergi.", so: "Salaam! Waxaan ahay kaaliyahaaga AgriBridge 🌿 Wax kasta oo beertaada ku saabsan i weydii — qor, ku hadal, ama soo geli sawir.", ti: "ሰላም! ኣነ ናትካ AgriBridge ሓጋዚ እየ 🌿 ብዛዕባ ሕርሻኻ ዝኾነ ሕተተኒ — ጽሓፍ፣ ተዛረብ፣ ወይ ስእሊ ስደድ።" },
  notificationsTitle: { en: "Notifications", am: "ማሳወቂያዎች", om: "Beeksisa", so: "Ogeysiisyo", ti: "ምልክታታት" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

const STORAGE_KEY = "agribridge.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string) => dict[key]?.[lang] ?? dict[key]?.en ?? key;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}