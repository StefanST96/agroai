const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("agroai123", 10);

  const user = await prisma.user.upsert({
    where: { email: "marko@agroai.rs" },
    update: {
      role: "ADMIN",
    },
    create: {
      name: "Marko Petrovic",
      username: "marko_petrovic",
      email: "marko@agroai.rs",
      passwordHash,
      role: "ADMIN",
      phone: "+381 60 000 000",
      location: "Arilje, Srbija",
      bio: "Malina, voce i povrtarstvo. Pratim savete, pijacne cene i konkurse za gazdinstvo.",
      farmName: "Domacinstvo Petrovic",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: "jelena@agroai.rs" },
    update: {
      role: "MODERATOR",
    },
    create: {
      name: "Jelena Ilic",
      username: "jelena_ilic",
      email: "jelena@agroai.rs",
      passwordHash,
      role: "MODERATOR",
      phone: "+381 64 111 222",
      location: "Kragujevac, Srbija",
      bio: "Saveti za povrtarstvo i organizaciju sezonskih radova.",
      farmName: "Gazdinstvo Ilic",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "nikola@agroai.rs" },
    update: {},
    create: {
      name: "Nikola Jovanovic",
      username: "nikola_j",
      email: "nikola@agroai.rs",
      passwordHash,
      phone: "+381 63 555 777",
      location: "Novi Sad, Srbija",
      bio: "Ratarstvo i mehanizacija. Aktivno objavljujem oglase.",
      farmName: "Poljo Plus",
      avatarUrl:
        "https://images.unsplash.com/photo-1542178243-bc20204b769f?auto=format&fit=crop&w=96&q=80",
    },
  });

  const [arilje, kragujevac, noviSad] = await Promise.all([
    prisma.market.upsert({
      where: { name_city: { name: "Arilje", city: "Arilje" } },
      update: {},
      create: { name: "Arilje", city: "Arilje" },
    }),
    prisma.market.upsert({
      where: { name_city: { name: "Kragujevac", city: "Kragujevac" } },
      update: {},
      create: { name: "Kragujevac", city: "Kragujevac" },
    }),
    prisma.market.upsert({
      where: { name_city: { name: "Novi Sad", city: "Novi Sad" } },
      update: {},
      create: { name: "Novi Sad", city: "Novi Sad" },
    }),
  ]);

  const [malina, kukuruz, psenica, paradajz, paprika] = await Promise.all([
    prisma.product.upsert({
      where: { name_category: { name: "Malina", category: "Vocie" } },
      update: {},
      create: { name: "Malina", category: "Vocie" },
    }),
    prisma.product.upsert({
      where: { name_category: { name: "Kukuruz", category: "Zito" } },
      update: {},
      create: { name: "Kukuruz", category: "Zito" },
    }),
    prisma.product.upsert({
      where: { name_category: { name: "Psenica", category: "Zito" } },
      update: {},
      create: { name: "Psenica", category: "Zito" },
    }),
    prisma.product.upsert({
      where: { name_category: { name: "Paradajz", category: "Povrce" } },
      update: {},
      create: { name: "Paradajz", category: "Povrce" },
    }),
    prisma.product.upsert({
      where: { name_category: { name: "Paprika", category: "Povrce" } },
      update: {},
      create: { name: "Paprika", category: "Povrce" },
    }),
  ]);

  await Promise.all([
    prisma.marketPrice.upsert({
      where: { id: 1 },
      update: {},
      create: {
        marketId: arilje.id,
        productId: malina.id,
        reporterId: user.id,
        price: "420.00",
        unit: "KG",
        source: "Seed data",
      },
    }),
    prisma.marketPrice.upsert({
      where: { id: 2 },
      update: {},
      create: {
        marketId: kragujevac.id,
        productId: kukuruz.id,
        reporterId: user.id,
        price: "28.00",
        unit: "KG",
        source: "Seed data",
      },
    }),
    prisma.marketPrice.upsert({
      where: { id: 3 },
      update: {},
      create: {
        marketId: noviSad.id,
        productId: psenica.id,
        reporterId: user.id,
        price: "26.00",
        unit: "KG",
        source: "Seed data",
      },
    }),
    prisma.marketPrice.upsert({
      where: { id: 4 },
      update: {},
      create: {
        marketId: kragujevac.id,
        productId: paradajz.id,
        reporterId: moderator.id,
        price: "160.00",
        unit: "KG",
        source: "Seed data",
      },
    }),
    prisma.marketPrice.upsert({
      where: { id: 5 },
      update: {},
      create: {
        marketId: arilje.id,
        productId: paprika.id,
        reporterId: user2.id,
        price: "190.00",
        unit: "KG",
        source: "Seed data",
      },
    }),
  ]);

  const post1 = await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      authorId: user.id,
      title: "Iskustvo sa zastitom maline protiv tripsa",
      content:
        "Koristio sam Mospilan u kombinaciji sa okvasivacem i rezultati su odlicni. Preporucujem tretman uvece kada nema sunca.",
      category: "GENERAL",
      imageUrl:
        "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=760&q=80",
    },
  });

  const post2 = await prisma.post.upsert({
    where: { id: 2 },
    update: {},
    create: {
      authorId: user.id,
      title: "Koje djubrivo koristite za psenicu?",
      content:
        "Planiram prihranu psenice. Koje djubrivo koristite i u kojoj kolicini? Da li ide KAN ili nesto drugo? Hvala unapred!",
      category: "QUESTION",
      imageUrl:
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=760&q=80",
    },
  });

  const post3 = await prisma.post.upsert({
    where: { id: 3 },
    update: {},
    create: {
      authorId: user2.id,
      title: "Oglas: Prodajem traktor IMT 539, registrovan",
      content:
        "Prodajem traktor IMT 539, godiste 1991. Servisiran, nove zadnje gume. Oglas za ozbiljne kupce. Kontakt u poruci.",
      category: "MARKET",
      imageUrl:
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=760&q=80",
    },
  });

  const post4 = await prisma.post.upsert({
    where: { id: 4 },
    update: {},
    create: {
      authorId: moderator.id,
      title: "Oglas: Vucena prskalica 600L u odlicnom stanju",
      content:
        "Mehanizacija za male i srednje parcele. Prskalica 600L, ocuvana i spremna za sezonu. Moguc dogovor oko prevoza.",
      category: "MARKET",
      imageUrl:
        "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=760&q=80",
    },
  });

  const post5 = await prisma.post.upsert({
    where: { id: 5 },
    update: {},
    create: {
      authorId: user2.id,
      title: "Zemljiste pod zakup u Backoj Topoli",
      content:
        "Dajem u zakup 12ha obradivog zemljista na 3 godine. Parcela uz asfalt i kanal za navodnjavanje.",
      category: "ZIVOT_NA_SELU",
      imageUrl:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=760&q=80",
    },
  });

  const post6 = await prisma.post.upsert({
    where: { id: 6 },
    update: {},
    create: {
      authorId: user.id,
      title: "Otvoren konkurs za mehanizaciju do 50% povracaja",
      content:
        "Podsetnik: aktuelan je konkurs za kupovinu prikljucne mehanizacije. Rok za prijavu je 30 dana od objave.",
      category: "SUBSIDY",
      imageUrl:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=760&q=80",
    },
  });

  const post7 = await prisma.post.upsert({
    where: { id: 7 },
    update: {},
    create: {
      authorId: moderator.id,
      title: "Pepelnica na tikvicama - iskustvo i tretman",
      content:
        "Na vreme ukloniti zarazene listove i tretirati preparatom na bazi sumpora u vecernjim satima.",
      category: "DISEASE",
      imageUrl:
        "https://images.unsplash.com/photo-1592417817038-d13fd7342605?auto=format&fit=crop&w=760&q=80",
    },
  });

  const post8 = await prisma.post.upsert({
    where: { id: 8 },
    update: {},
    create: {
      authorId: user.id,
      title: "Koliko puta zalivate malinu tokom jula?",
      content:
        "Otvaram anketu za vocarstvo - zanima me praksa u razlicitim krajevima. Delite rezultate i preporuke.",
      category: "VOCARSTVO",
      imageUrl:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=760&q=80",
    },
  });

  await Promise.all([
    prisma.post.upsert({
      where: { id: 9 },
      update: {},
      create: {
        authorId: user.id,
        title: "Plan setve kukuruza za sezonu 2026",
        content:
          "Delim plan setve po parcelama i predlog gustine sklopa za razlicite tipove zemljista.",
        category: "BILJNA_PROIZVODNJA",
        imageUrl:
          "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 10 },
      update: {},
      create: {
        authorId: user2.id,
        title: "Prihrana psenice u fazi bokorenja",
        content:
          "Koja kolicina KAN-a vam je dala najbolje rezultate na parcelama srednjeg kvaliteta?",
        category: "BILJNA_PROIZVODNJA",
        imageUrl:
          "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 11 },
      update: {},
      create: {
        authorId: moderator.id,
        title: "Rotacija useva za bolji prinos",
        content:
          "Na manjim gazdinstvima rotacija kukuruz-soja-psenica se pokazala stabilno u poslednje tri godine.",
        category: "BILJNA_PROIZVODNJA",
        imageUrl:
          "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 12 },
      update: {},
      create: {
        authorId: moderator.id,
        title: "Rezidba jabuke posle mraza",
        content:
          "Sta skidate prvo kod ostecenih grana i kada je najbolji termin za korektivnu rezidbu?",
        category: "VOCARSTVO",
        imageUrl:
          "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 13 },
      update: {},
      create: {
        authorId: user.id,
        title: "Navodnjavanje malinjaka kap po kap",
        content:
          "Koliko minuta dnevno pustate sistem tokom jula i avgusta na peskovitom zemljistu?",
        category: "VOCARSTVO",
        imageUrl:
          "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 14 },
      update: {},
      create: {
        authorId: user2.id,
        title: "Uzgoj paprike na otvorenom",
        content:
          "Podelite iskustva sa brojem zalivanja i zastitom od jakog sunca tokom leta.",
        category: "POVRCARSTVO",
        imageUrl:
          "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 15 },
      update: {},
      create: {
        authorId: moderator.id,
        title: "Rasad paradajza: kaljenje pre sadnje",
        content:
          "Koliko dana pre presadjivanja pocinjete kaljenje i na kojim temperaturama?",
        category: "POVRCARSTVO",
        imageUrl:
          "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 16 },
      update: {},
      create: {
        authorId: user.id,
        title: "Plastenik: kako smanjiti vlagu",
        content:
          "Ventilacija i raspored navodnjavanja su mi najvise pomogli protiv kondenzacije ujutru.",
        category: "POVRCARSTVO",
        imageUrl:
          "https://images.unsplash.com/photo-1530507629858-e4977d30e5eb?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 17 },
      update: {},
      create: {
        authorId: moderator.id,
        title: "Ishrana tovne junadi u letnjem periodu",
        content:
          "Koji odnos kabaste i koncentrovane hrane koristite kada su temperature iznad 30 stepeni?",
        category: "STOCARSTVO",
        imageUrl:
          "https://images.unsplash.com/photo-1441123694162-e54a981ceba0?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 18 },
      update: {},
      create: {
        authorId: user2.id,
        title: "Prevencija mastitisa kod muznih krava",
        content:
          "Koju rutinu higijene pre i posle muzenja ste uveli i kakvi su rezultati?",
        category: "STOCARSTVO",
        imageUrl:
          "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 19 },
      update: {},
      create: {
        authorId: user.id,
        title: "Ovcarstvo: priprema stada za zimu",
        content:
          "Interesuje me kako planirate koncentrat i mineralne dodatke od oktobra do januara.",
        category: "STOCARSTVO",
        imageUrl:
          "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 20 },
      update: {},
      create: {
        authorId: user2.id,
        title: "Prodaja domaceg sira na pijaci - iskustvo",
        content:
          "Kako ste organizovali ambalazu, etikete i redovne kupce iz grada?",
        category: "ZIVOT_NA_SELU",
        imageUrl:
          "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 21 },
      update: {},
      create: {
        authorId: moderator.id,
        title: "Kako organizovati seoski turizam vikendom",
        content:
          "Delim check-listu za domacine: rezervacije, posluzenje i lokalne ture po selu.",
        category: "ZIVOT_NA_SELU",
        imageUrl:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 22 },
      update: {},
      create: {
        authorId: user.id,
        title: "Pitanje: kapanje ili tifon za mladi vocnjak?",
        content:
          "Imam 1.5ha mladog zasada sljive. Sta se pokazalo bolje u praksi za ustedu vode?",
        category: "QUESTION",
        imageUrl:
          "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 23 },
      update: {},
      create: {
        authorId: moderator.id,
        title: "Novi javni poziv za sisteme za navodnjavanje",
        content:
          "Objavljen je novi poziv sa povracajem dela troskova za opremu i instalaciju sistema.",
        category: "SUBSIDY",
        imageUrl:
          "https://images.unsplash.com/photo-1530507629858-e4977d30e5eb?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 24 },
      update: {},
      create: {
        authorId: user2.id,
        title: "Plamenjaca krompira - prvi simptomi",
        content:
          "Na dve parcele su se pojavile tamne pege posle kise. Sta primeniti odmah?",
        category: "DISEASE",
        imageUrl:
          "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.post.upsert({
      where: { id: 25 },
      update: {},
      create: {
        authorId: user.id,
        title: "Oglas: atomizer 400L, servisiran",
        content:
          "Prodajem atomizer 400L, ispravan i spreman za sezonu. Moguca proba pre kupovine.",
        category: "MARKET",
        imageUrl:
          "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=760&q=80",
      },
    }),
  ]);

  await Promise.all([
    prisma.comment.upsert({
      where: { id: 1 },
      update: {},
      create: {
        postId: post1.id,
        authorId: user.id,
        content: "Kod mene je dobro radio tretman predvece.",
      },
    }),
    prisma.like.upsert({
      where: {
        postId_authorId: {
          postId: post1.id,
          authorId: user.id,
        },
      },
      update: {},
      create: { postId: post1.id, authorId: user.id },
    }),
    prisma.comment.upsert({
      where: { id: 2 },
      update: {},
      create: {
        postId: post3.id,
        authorId: user.id,
        content: "Da li je traktor jos dostupan?",
      },
    }),
    prisma.comment.upsert({
      where: { id: 3 },
      update: {},
      create: {
        postId: post4.id,
        authorId: user2.id,
        content: "Moze li zamena za atomizer plus doplata?",
      },
    }),
    prisma.like.upsert({
      where: {
        postId_authorId: {
          postId: post3.id,
          authorId: user.id,
        },
      },
      update: {},
      create: { postId: post3.id, authorId: user.id },
    }),
    prisma.like.upsert({
      where: {
        postId_authorId: {
          postId: post4.id,
          authorId: user2.id,
        },
      },
      update: {},
      create: { postId: post4.id, authorId: user2.id },
    }),
    prisma.like.upsert({
      where: {
        postId_authorId: {
          postId: post6.id,
          authorId: moderator.id,
        },
      },
      update: {},
      create: { postId: post6.id, authorId: moderator.id },
    }),
  ]);

  await Promise.all([
    prisma.commentLike.upsert({
      where: {
        commentId_authorId: {
          commentId: 1,
          authorId: moderator.id,
        },
      },
      update: {},
      create: {
        commentId: 1,
        authorId: moderator.id,
      },
    }),
    prisma.commentLike.upsert({
      where: {
        commentId_authorId: {
          commentId: 2,
          authorId: user2.id,
        },
      },
      update: {},
      create: {
        commentId: 2,
        authorId: user2.id,
      },
    }),
    prisma.commentReply.upsert({
      where: { id: 1 },
      update: {},
      create: {
        commentId: 1,
        authorId: moderator.id,
        content: "Super savet, kod mene je pomoglo i rano jutarnje prskanje.",
      },
    }),
    prisma.commentReply.upsert({
      where: { id: 2 },
      update: {},
      create: {
        commentId: 3,
        authorId: user.id,
        content: "Moguca je zamena, javljam se u poruci.",
      },
    }),
  ]);

  await Promise.all([
    prisma.subsidy.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: "Podsticaji za nabavku nove mehanizacije",
        institution: "Ministarstvo poljoprivrede",
        description: "Podrska za kupovinu traktora, kombajna i dodatne opreme.",
        amount: "do 50% investicije",
        region: "Srbija",
        status: "OPEN",
        closesAt: new Date("2026-06-30T00:00:00Z"),
        link: "https://poljoprivreda.gov.rs",
        imageUrl:
          "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.subsidy.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: "Regres za sertifikovano seme",
        institution: "Uprava za agrarna placanja",
        description: "Podsticaj za nabavku semenki registrovanog kvaliteta.",
        amount: "do 17.000 din/ha",
        region: "Srbija",
        status: "CLOSING_SOON",
        closesAt: new Date("2026-06-25T00:00:00Z"),
        link: "https://upar.gov.rs",
        imageUrl:
          "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.subsidy.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: "IPARD mera za preradu voca i povrca",
        institution: "IPARD program",
        description:
          "Finansijska pomoc za modernizaciju prerade voca i povrca.",
        amount: "do 60% investicije",
        region: "Zapadna Srbija",
        status: "OPEN",
        closesAt: new Date("2026-08-15T00:00:00Z"),
        link: "https://ipard.gov.rs",
        imageUrl:
          "https://images.unsplash.com/photo-1444930694458-01babf71870c?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.subsidy.upsert({
      where: { id: 4 },
      update: {},
      create: {
        title: "Podrska mladim poljoprivrednicima za plastenike",
        institution: "Ministarstvo poljoprivrede",
        description:
          "Finansiranje postavljanja plastenika i sistema za navodnjavanje.",
        amount: "do 1.500.000 din",
        region: "Srbija",
        status: "OPEN",
        closesAt: new Date("2026-09-20T00:00:00Z"),
        link: "https://poljoprivreda.gov.rs",
        imageUrl:
          "https://images.unsplash.com/photo-1530507629858-e4977d30e5eb?auto=format&fit=crop&w=760&q=80",
      },
    }),
  ]);

  const now = Date.now();
  await Promise.all([
    prisma.weekendActivity.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: "Sajam mehanizacije Sumadija 2026",
        description:
          "Predstavljanje traktora, prikljucnih masina i precizne poljoprivrede.",
        city: "Kragujevac",
        location: "Sajamski centar",
        category: "Mehanizacija",
        startAt: new Date(now + 2 * 24 * 60 * 60 * 1000),
        endAt: new Date(now + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        createdById: moderator.id,
        imageUrl:
          "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.weekendActivity.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: "Dan polja kukuruza",
        description: "Praktican prikaz sorti i tehnologije setve.",
        city: "Novi Sad",
        location: "Poligon Rimski Sancevi",
        category: "Ratarstvo",
        startAt: new Date(now + 3 * 24 * 60 * 60 * 1000),
        endAt: new Date(now + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        createdById: user2.id,
        imageUrl:
          "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=760&q=80",
      },
    }),
    prisma.weekendActivity.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: "Radionica zastite vocnjaka",
        description: "Saveti za prevenciju bolesti i izbor preparata.",
        city: "Arilje",
        location: "Dom kulture",
        category: "Vocarstvo",
        startAt: new Date(now + 5 * 24 * 60 * 60 * 1000),
        endAt: new Date(now + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        createdById: user.id,
        imageUrl:
          "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=760&q=80",
      },
    }),
  ]);

  await Promise.all([
    prisma.partner.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "AgroServis Plus",
        category: "Mehanizacija",
        description: "Prodaja i servis traktora i prikljucnih masina.",
        logoUrl:
          "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=200&q=80",
        website: "https://example.com/agroservis-plus",
      },
    }),
    prisma.partner.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Seme Balkan",
        category: "Seme i repromaterijal",
        description: "Sertifikovano seme i strucna podrska proizvodjacima.",
        logoUrl:
          "https://images.unsplash.com/photo-1441123694162-e54a981ceba0?auto=format&fit=crop&w=200&q=80",
        website: "https://example.com/seme-balkan",
      },
    }),
    prisma.partner.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "EkoPlast Sistem",
        category: "Plastenici",
        description: "Projektovanje i montaza plastenika sirom Srbije.",
        logoUrl:
          "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=200&q=80",
        website: "https://example.com/ekoplast",
      },
    }),
    prisma.partner.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "Zelena Mreza",
        category: "Udruzenje",
        description: "Podrska razvoju mladih poljoprivrednika.",
        logoUrl:
          "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=200&q=80",
        website: "https://example.com/zelena-mreza",
      },
    }),
  ]);

  await Promise.all([
    prisma.property.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: "Seoska kuca sa pomocnim objektima",
        description:
          "Kuca od 140m2, bunar i pomocni objekti. Pogodno za porodicu i manje gazdinstvo.",
        price: "69000",
        currency: "EUR",
        city: "Arilje",
        region: "Zlatiborski okrug",
        areaSqm: 140,
        landHa: "0.45",
        rooms: 5,
        category: "KUCA",
        imageUrl:
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=760&q=80",
        contactPhone: "+38160123456",
        contactName: "Marko Petrovic",
        isActive: true,
      },
    }),
    prisma.property.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: "Poljoprivredno zemljiste 12ha",
        description:
          "U jednoj tabli, uz asfaltni put i kanal za odvodnjavanje.",
        price: "98000",
        currency: "EUR",
        city: "Backa Topola",
        region: "Vojvodina",
        areaSqm: null,
        landHa: "12.00",
        rooms: null,
        category: "ZEMLJISTE",
        imageUrl:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=760&q=80",
        contactPhone: "+38163111222",
        contactName: "Nikola Jovanovic",
        isActive: true,
      },
    }),
    prisma.property.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: "Vikendica sa vocnjakom",
        description:
          "Plac 0.8ha, 120 stabala sljive i jabuke, prilaz asfaltom.",
        price: "54000",
        currency: "EUR",
        city: "Topola",
        region: "Sumadija",
        areaSqm: 82,
        landHa: "0.80",
        rooms: 3,
        category: "VIKENDICA",
        imageUrl:
          "https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=760&q=80",
        contactPhone: "+38164123456",
        contactName: "Jelena Ilic",
        isActive: true,
      },
    }),
    prisma.property.upsert({
      where: { id: 4 },
      update: {},
      create: {
        title: "Imanje sa stalom i magacinom",
        description:
          "Kompletno opremljeno imanje za stocharstvo, struja i voda na parceli.",
        price: "125000",
        currency: "EUR",
        city: "Kragujevac",
        region: "Sumadija",
        areaSqm: 220,
        landHa: "2.40",
        rooms: 6,
        category: "IMANJE",
        imageUrl:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=760&q=80",
        contactPhone: "+38162123123",
        contactName: "AgroServis Plus",
        isActive: true,
      },
    }),
  ]);

  await Promise.all([
    prisma.sidebarBanner.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: "Jesenji sajam mehanizacije",
        body: "Popusti do 20% na prikljucne masine i rezervne delove.",
        ctaText: "Pogledaj ponudu",
        ctaHref: "/oprema-i-oglasi",
        imageUrl:
          "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=760&q=80",
        variant: "HERO",
        position: 1,
        isActive: true,
        createdById: user.id,
      },
    }),
    prisma.sidebarBanner.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: "Dostupna zemljista u Vojvodini",
        body: "Pogledajte aktuelne oglase i zakup poljoprivrednog zemljista.",
        ctaText: "Idi na kuce i zemljiste",
        ctaHref: "/kuce-na-selu?category=ZEMLJISTE",
        imageUrl:
          "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=760&q=80",
        variant: "CARD",
        position: 2,
        isActive: true,
        createdById: moderator.id,
      },
    }),
  ]);

  await prisma.aiConversation.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user.id,
      title: "AI savet za malinu",
      topic: "Zastita maline",
      messages: {
        create: [
          {
            role: "USER",
            content:
              "Na malini posle kise vidim sitne fleke na listu. Sta prvo da proverim?",
          },
          {
            role: "ASSISTANT",
            content:
              "Prvo proveri donju stranu lista, vlagu u zasadu i da li se fleke sire ka mladim izdancima. Ako ima zutih oreola ili sivkastih prevlaka, slikaj list izbliza i dodaj sliku za precizniju procenu.",
          },
        ],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
