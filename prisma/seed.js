const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("agroai123", 10);

  const user = await prisma.user.upsert({
    where: { email: "marko@agroai.rs" },
    update: {},
    create: {
      name: "Marko Petrovic",
      username: "marko_petrovic",
      email: "marko@agroai.rs",
      passwordHash,
      phone: "+381 60 000 000",
      location: "Arilje, Srbija",
      bio: "Malina, voce i povrtarstvo. Pratim savete, pijacne cene i konkurse za gazdinstvo.",
      farmName: "Domacinstvo Petrovic",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
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

  const [malina, kukuruz, psenica] = await Promise.all([
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
      where: { id: 1 },
      update: {},
      create: { postId: post1.id, authorId: user.id },
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
