import { prisma } from "./prisma";


type RequestLike = any;

function toMediaUrl(assetId?: number | null) {
  return assetId ? `/api/media/${assetId}` : null;
}

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
  const posts = await prisma.post.findMany({
    include: {
      author: true,
      comments: true,
      likes: true,
      imageAsset: {
        select: { id: true },
      },
      videoAsset: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return posts.map((post) => ({
    ...post,
    imageUrl: post.imageUrl ?? toMediaUrl(post.imageAsset?.id),
    videoUrl: toMediaUrl(post.videoAsset?.id),
  }));
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

function dayStartMs(value: Date) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function getMarketPriceHighlights(limit = 5) {
  const prices = await prisma.marketPrice.findMany({
    include: {
      market: true,
      product: true,
    },
    orderBy: { reportedAt: "desc" },
  });

  const todayStart = dayStartMs(new Date());
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

  const grouped = new Map<string, typeof prices>();
  for (const item of prices) {
    const key = `${item.marketId}:${item.productId}`;
    const current = grouped.get(key);
    if (current) {
      current.push(item);
    } else {
      grouped.set(key, [item]);
    }
  }

  const highlights = Array.from(grouped.values()).map((items) => {
    const latest = items[0];
    const latestValue = Number.parseFloat(latest.price.toString());
    const latestDayStart = dayStartMs(latest.reportedAt);

    let previousForDelta: (typeof items)[number] | undefined;

    if (latestDayStart === todayStart) {
      previousForDelta = items.find((entry) => dayStartMs(entry.reportedAt) === yesterdayStart);
    }

    if (!previousForDelta) {
      previousForDelta = items[1];
    }

    const previousValue = previousForDelta
      ? Number.parseFloat(previousForDelta.price.toString())
      : latestValue;

    return {
      ...latest,
      delta: latestValue - previousValue,
    };
  });

  return highlights
    .sort((a, b) => +new Date(b.reportedAt) - +new Date(a.reportedAt))
    .slice(0, limit);
}

export async function getSubsidies() {
  return prisma.subsidy.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getWeekendActivities(limit = 6, city?: string) {
  const now = new Date();
  const activities = await prisma.weekendActivity.findMany({
    where: {
      startAt: { gte: now },
      ...(city ? { city } : {}),
    },
    include: {
      imageAsset: {
        select: { id: true },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: { startAt: "asc" },
    take: limit,
  });

  return activities.map((activity) => ({
    ...activity,
    imageUrl: activity.imageUrl ?? toMediaUrl(activity.imageAsset?.id),
  }));
}

export async function getActivityCities() {
  const cities = await prisma.weekendActivity.findMany({
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });

  return cities
    .map((item) => item.city.trim())
    .filter(Boolean);
}

export async function getUserProfileByUserId(userId: number) {
  return prisma.userProfile.findUnique({
    where: { userId },
  });
}

export async function getPlatformStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [usersCount, postsCount, pricesUpdatedToday, activeDiscussions] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.marketPrice.count({
      where: {
        reportedAt: {
          gte: startOfToday,
        },
      },
    }),
    prisma.aiConversation.count(),
  ]);

  return {
    usersCount,
    postsCount,
    pricesUpdatedToday,
    activeDiscussions,
  };
}

export async function getSidebarBanners(activeOnly = true) {
  const banners = await prisma.sidebarBanner.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    include: {
      imageAsset: {
        select: { id: true },
      },
      createdBy: {
        select: { id: true, name: true, username: true },
      },
    },
    orderBy: [
      { position: "asc" },
      { createdAt: "desc" },
    ],
  });

  return banners.map((banner) => ({
    ...banner,
    imageUrl: banner.imageUrl ?? toMediaUrl(banner.imageAsset?.id),
  }));
}

export async function createSidebarBanner(data: {
  title: string;
  body?: string;
  ctaText?: string;
  ctaHref?: string;
  imageUrl?: string;
  imageAssetId?: number;
  variant?: "CARD" | "HERO";
  position?: number;
  isActive?: boolean;
  createdById?: number;
}) {
  return prisma.sidebarBanner.create({
    data: {
      title: data.title,
      body: data.body,
      ctaText: data.ctaText,
      ctaHref: data.ctaHref,
      imageUrl: data.imageUrl,
      imageAssetId: data.imageAssetId,
      variant: data.variant || "CARD",
      position: data.position ?? 0,
      isActive: data.isActive ?? true,
      createdById: data.createdById,
    },
  });
}

export async function updateSidebarBanner(data: {
  id: number;
  title?: string;
  body?: string | null;
  ctaText?: string | null;
  ctaHref?: string | null;
  imageUrl?: string | null;
  imageAssetId?: number | null;
  variant?: "CARD" | "HERO";
  position?: number;
  isActive?: boolean;
}) {
  return prisma.sidebarBanner.update({
    where: { id: data.id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.body !== undefined ? { body: data.body } : {}),
      ...(data.ctaText !== undefined ? { ctaText: data.ctaText } : {}),
      ...(data.ctaHref !== undefined ? { ctaHref: data.ctaHref } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      ...(data.imageAssetId !== undefined ? { imageAssetId: data.imageAssetId } : {}),
      ...(data.variant !== undefined ? { variant: data.variant } : {}),
      ...(data.position !== undefined ? { position: data.position } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });
}

export async function deleteSidebarBanner(id: number) {
  return prisma.sidebarBanner.delete({
    where: { id },
  });
}

export async function getUsersForAdmin() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      location: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserRole(data: {
  userId: number;
  role: "USER" | "MODERATOR" | "ADMIN";
  actorUserId: number;
}) {
  if (data.userId === data.actorUserId) {
    throw new Error("Ne mozete menjati svoju ulogu.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { id: true, role: true },
  });

  if (!targetUser) {
    throw new Error("Korisnik ne postoji.");
  }

  if (targetUser.role === "ADMIN" && data.role !== "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount <= 1) {
      throw new Error("Mora postojati bar jedan admin korisnik.");
    }
  }

  return prisma.user.update({
    where: { id: data.userId },
    data: { role: data.role },
    select: {
      id: true,
      role: true,
      name: true,
      username: true,
      email: true,
      location: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });
}

export async function createReport(data: {
  reporterId: number;
  targetType: "POST" | "PROFILE";
  reason: string;
  details?: string;
  postId?: number;
  reportedUserId?: number;
}) {
  return prisma.contentReport.create({
    data: {
      reporterId: data.reporterId,
      targetType: data.targetType,
      reason: data.reason,
      details: data.details,
      postId: data.postId,
      reportedUserId: data.reportedUserId,
    },
  });
}

export async function getReportsForAdmin() {
  return prisma.contentReport.findMany({
    include: {
      reporter: {
        select: { id: true, name: true, username: true },
      },
      reportedUser: {
        select: { id: true, name: true, username: true },
      },
      post: {
        select: { id: true, title: true, authorId: true },
      },
      resolvedBy: {
        select: { id: true, name: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateReportStatus(data: {
  reportId: number;
  status: "OPEN" | "REVIEWED" | "RESOLVED" | "REJECTED";
  resolvedById?: number;
}) {
  return prisma.contentReport.update({
    where: { id: data.reportId },
    data: {
      status: data.status,
      resolvedById: data.status === "RESOLVED" || data.status === "REJECTED"
        ? data.resolvedById
        : null,
    },
  });
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      location: true,
      bio: true,
      farmName: true,
      avatarUrl: true,
      createdAt: true,
      role: true,
    },
  });
}

export async function getPostsByUserDetailed(userId: number) {
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    include: {
      author: true,
      comments: true,
      likes: true,
      imageAsset: {
        select: { id: true },
      },
      videoAsset: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return posts.map((post) => ({
    ...post,
    imageUrl: post.imageUrl ?? toMediaUrl(post.imageAsset?.id),
    videoUrl: toMediaUrl(post.videoAsset?.id),
  }));
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

export async function getLatestAiConversationByUser(userId: number) {
  return prisma.aiConversation.findFirst({
    where: { userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAiConversationById(conversationId: number) {
  return prisma.aiConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function touchAiConversation(conversationId: number) {
  return prisma.aiConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
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
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      comments: true,
      likes: true,
      imageAsset: {
        select: { id: true },
      },
      videoAsset: {
        select: { id: true },
      },
    },
  });

  if (!post) return null;

  return {
    ...post,
    imageUrl: post.imageUrl ?? toMediaUrl(post.imageAsset?.id),
    videoUrl: toMediaUrl(post.videoAsset?.id),
  };
}

export async function createAiConversation(data: {
  userId?: number;
  title: string;
  topic?: string;
  firstMessage: string;
  firstAssistantMessage?: string;
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
              data.firstAssistantMessage ||
              "Razumeo sam pitanje i pripremam preporuku na osnovu datog konteksta.",
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
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data,
    });

    await tx.userProfile.create({
      data: {
        userId: user.id,
        displayName: data.name,
        location: data.location,
        farmName: data.farmName,
        bio: data.bio,
      },
    });

    return user;
  });
}

export async function createPost(data: {
  authorId: number;
  title: string;
  content: string;
  category?: string;
  imageUrl?: string;
  imageAssetId?: number;
  videoAssetId?: number;
}) {
  return prisma.post.create({
    data: {
      authorId: data.authorId,
      title: data.title,
      content: data.content,
      category: (data.category as any) || "GENERAL",
      imageUrl: data.imageUrl,
      imageAssetId: data.imageAssetId,
      videoAssetId: data.videoAssetId,
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

export async function createMarketPriceForExisting(data: {
  marketId: number;
  productId: number;
  price: number;
  unit: string;
  reporterId?: number;
}) {
  return prisma.marketPrice.create({
    data: {
      marketId: data.marketId,
      productId: data.productId,
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


export async function getPartners() {
  return prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createPartner(data: {
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  website?: string;
}) {
  return prisma.partner.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      logoUrl: data.logoUrl,
      website: data.website,
    },
  });
}

export async function deletePartner(id: number) {
  return prisma.partner.delete({
    where: { id },
  });
}

export async function getDismissedNotificationKeys(userId: number): Promise<string[]> {
  const dismissed = await prisma.dismissedNotification.findMany({
    where: { userId },
    select: { notificationKey: true },
  });
  return dismissed.map((d) => d.notificationKey);
}

export async function dismissNotificationForUser(userId: number, notificationKey: string) {
  return prisma.dismissedNotification.upsert({
    where: { userId_notificationKey: { userId, notificationKey } },
    update: { dismissedAt: new Date() },
    create: { userId, notificationKey },
  });
}

export async function markNotificationsReadForUser(userId: number, notificationKeys: string[]) {
  const result = await prisma.dismissedNotification.createMany({
    data: notificationKeys.map((key) => ({ userId, notificationKey: key })),
    skipDuplicates: true,
  });
  return result.count;
}