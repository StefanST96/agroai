import { prisma } from "./prisma";

type RequestLike = any;

function parseCookies(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...rest] = part.split("=");
        return [decodeURIComponent(name.trim()), decodeURIComponent(rest.join("=").trim())];
      })
  );
}

function getSessionTokenFromArg(request?: RequestLike) {
  if (!request) return undefined;

  if (request.cookies && typeof request.cookies.get === "function") {
    return request.cookies.get("session")?.value;
  }

  if (typeof request.get === "function") {
    return request.get("session")?.value;
  }

  if (request.headers && typeof request.headers.get === "function") {
    const cookies = parseCookies(request.headers.get("cookie"));
    return cookies.session;
  }

  return undefined;
}

export async function getCurrentUser(request?: RequestLike) {
  const sessionToken = getSessionTokenFromArg(request);
  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function createSession(userId: number) {
  const token = crypto.randomUUID();
  return prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });
}

export async function deleteSession(token: string) {
  return prisma.session.deleteMany({
    where: { token },
  });
}

export async function getFeedPosts() {
  return prisma.post.findMany({
    include: {
      author: true,
      comments: true,
      likes: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostsByUser(userId: number) {
  return prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMarketPrices() {
  return prisma.marketPrice.findMany({
    include: {
      market: true,
      product: true,
    },
    orderBy: { reportedAt: "desc" },
  });
}

export async function getSubsidies() {
  return prisma.subsidy.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getLatestAiConversation() {
  const conversation = await prisma.aiConversation.findFirst({
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return conversation;
}

export async function getPostComments(postId: number) {
  return prisma.comment.findMany({
    where: { postId },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getLikeCount(postId: number) {
  return prisma.like.count({
    where: { postId },
  });
}

export async function getPostById(postId: number) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      comments: true,
      likes: true,
    },
  });
}

export async function createAiConversation(data: {
  userId?: number;
  title: string;
  topic?: string;
  firstMessage: string;
}) {
  return prisma.aiConversation.create({
    data: {
      userId: data.userId,
      title: data.title,
      topic: data.topic,
      messages: {
        create: [
          {
            role: "USER",
            content: data.firstMessage,
          },
          {
            role: "ASSISTANT",
            content:
              "Pozdrav! Dobio sam tvoje pitanje. U produkciji bi se ovde pokrenuo AI model i cuvao rezultat u bazi.",
          },
        ],
      },
    },
    include: {
      messages: true,
    },
  });
}

export async function appendAiMessage(data: {
  conversationId: number;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
}) {
  return prisma.aiMessage.create({
    data: {
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
    },
  });
}

export async function getDiseaseAnalyses() {
  return prisma.diseaseAnalysis.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  phone?: string;
  location?: string;
  bio?: string;
  farmName?: string;
  avatarUrl?: string;
}) {
  return prisma.user.create({
    data,
  });
}

export async function createPost(data: {
  authorId: number;
  title: string;
  content: string;
  category?: string;
  imageUrl?: string;
}) {
  return prisma.post.create({
    data: {
      authorId: data.authorId,
      title: data.title,
      content: data.content,
      category: (data.category as any) || "GENERAL",
      imageUrl: data.imageUrl,
    },
  });
}

export async function createMarketPrice(data: {
  marketName: string;
  marketCity: string;
  productName: string;
  productCategory: string;
  price: number;
  unit: string;
  reporterId?: number;
}) {
  const market = await prisma.market.upsert({
    where: { name_city: { name: data.marketName, city: data.marketCity } },
    update: {},
    create: { name: data.marketName, city: data.marketCity },
  });

  const product = await prisma.product.upsert({
    where: { name_category: { name: data.productName, category: data.productCategory } },
    update: {},
    create: { name: data.productName, category: data.productCategory },
  });

  return prisma.marketPrice.create({
    data: {
      marketId: market.id,
      productId: product.id,
      reporterId: data.reporterId,
      price: data.price,
      unit: data.unit as any,
      source: "User submitted",
    },
  });
}

export async function createComment(data: { postId: number; authorId: number; content: string }) {
  return prisma.comment.create({
    data,
  });
}

export async function createLike(data: { postId: number; authorId: number }) {
  return prisma.like.create({
    data,
  });
}
