export const currentUser = {
  name: "Marko Petrovic",
  username: "marko_petrovic",
  email: "marko@agroai.rs",
  location: "Arilje, Srbija",
  farmName: "Domacinstvo Petrovic",
  bio: "Malina, voce i povrtarstvo. Pratim savete, pijacne cene i konkurse za gazdinstvo.",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
};

export const posts = [
  {
    id: 1,
    title: "Iskustvo sa zastitom maline protiv tripsa",
    content:
      "Koristio sam Mospilan u kombinaciji sa okvasivacem i rezultati su odlicni. Preporucujem tretman uvece kada nema sunca. Koje su vase preporuke?",
    author: "Milan Jovanovic",
    location: "Cacak, Srbija",
    time: "pre 2h",
    category: "Iskustvo",
    tagTone: "green",
    likes: 24,
    commentsCount: 7,
    image:
      "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=760&q=80",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80",
    comments: [
      "Kod mene je dobro radio tretman predvece.",
      "Pazi na karencu ako je berba blizu.",
    ],
  },
  {
    id: 2,
    title: "Koje djubrivo koristite za psenicu?",
    content:
      "Planiram prihranu psenice. Koje djubrivo koristite i u kojoj kolicini? Da li ide KAN ili nesto drugo? Hvala unapred!",
    author: "Jelena Nikolic",
    location: "Kragujevac, Srbija",
    time: "pre 5h",
    category: "Pitanje",
    tagTone: "purple",
    likes: 15,
    commentsCount: 12,
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=760&q=80",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    comments: ["KAN mi se pokazao dobro posle kise.", "Zavisi od analize zemljista."],
  },
  {
    id: 3,
    title: "Novi konkurs za IPARD subvencije otvoren!",
    content:
      "Objavljen je poziv za investicije u preradu i opremu. Proverite dokumentaciju na vreme, rokovi su kratki.",
    author: "Petar Markovic",
    location: "Sombor, Srbija",
    time: "pre 8h",
    category: "Akcija / Subvencija",
    tagTone: "blue",
    likes: 31,
    commentsCount: 18,
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=760&q=80",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&q=80",
    comments: ["Da li je potrebna profaktura?", "Hvala, saljem knjigovodji odmah."],
  },
];

export const marketPrices = [
  { product: "Malina", market: "Arilje", price: "420 din", unit: "kg", delta: "+20", icon: "🍓" },
  { product: "Kukuruz", market: "Kragujevac", price: "28 din", unit: "kg", delta: "+2", icon: "🌽" },
  { product: "Psenica", market: "Novi Sad", price: "26 din", unit: "kg", delta: "0", icon: "🌾" },
  { product: "Svinja", market: "Nis", price: "160 din", unit: "kg", delta: "+5", icon: "🐖" },
  { product: "Prasad", market: "Cacak", price: "4.500 din", unit: "kom", delta: "-100", icon: "🐷" },
];

export const subsidies = [
  {
    title: "Podsticaji za nabavku nove mehanizacije",
    institution: "Ministarstvo poljoprivrede",
    amount: "do 50% investicije",
    status: "Otvoren",
    deadline: "30.06.2026.",
  },
  {
    title: "Regres za sertifikovano seme",
    institution: "Uprava za agrarna placanja",
    amount: "do 17.000 din/ha",
    status: "Uskoro istice",
    deadline: "25.06.2026.",
  },
  {
    title: "IPARD mera za preradu voca i povrca",
    institution: "IPARD program",
    amount: "do 60% investicije",
    status: "Najava",
    deadline: "15.08.2026.",
  },
];

export const aiSuggestions = [
  "Kako da zastitim malinu posle kise?",
  "Koje djubrivo ide za psenicu u ovoj fazi?",
  "Da li je vreme za tretman protiv plamenjace?",
  "Koji konkursi su otvoreni za vocare?",
];

export const aiMessages = [
  {
    role: "assistant",
    text:
      "Zdravo Marko. Pitaj me za zastitu biljaka, prihranu, subvencije, pijacne cene ili posalji sliku lista za analizu.",
  },
  {
    role: "user",
    text: "Na malini posle kise vidim sitne fleke na listu. Sta prvo da proverim?",
  },
  {
    role: "assistant",
    text:
      "Prvo proveri donju stranu lista, vlagu u zasadu i da li se fleke sire ka mladim izdancima. Ako ima zutih oreola ili sivkastih prevlaka, slikaj list izbliza i dodaj sliku za precizniju procenu.",
  },
];

export const plantAnalyses = [
  {
    crop: "Malina",
    suspectedIssue: "Rani simptomi plamenjace lista",
    confidence: 82,
    severity: "Srednji rizik",
    symptoms: ["tamne fleke na ivicama lista", "vlazni uslovi posle kise", "blago zutilo oko pega"],
    recommendation:
      "Ukloni zarazene listove, popravi provetravanje i uradi preventivni tretman registrovanim preparatom kada nema direktnog sunca.",
    image:
      "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=760&q=80",
  },
  {
    crop: "Paradajz",
    suspectedIssue: "Moguca plamenjaca paradajza",
    confidence: 76,
    severity: "Visok rizik",
    symptoms: ["braon pege", "vlazni listovi", "brzo sirenje posle padavina"],
    recommendation:
      "Odmah ukloni zahvacene listove, smanji zalivanje preko lista i proveri preporuceni fungicid za fazu razvoja.",
    image:
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=760&q=80",
  },
];
