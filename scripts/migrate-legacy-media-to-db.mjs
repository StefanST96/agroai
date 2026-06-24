import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const IMAGE_EXT_TO_MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const VIDEO_EXT_TO_MIME = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

function detectMimeType(fileName, kind) {
  const ext = path.extname(fileName || "").toLowerCase();
  if (kind === "IMAGE") {
    return IMAGE_EXT_TO_MIME[ext] || "application/octet-stream";
  }
  return VIDEO_EXT_TO_MIME[ext] || "application/octet-stream";
}

async function readFilesSafe(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  } catch (error) {
    return [];
  }
}

function extractMediaIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(/^\/api\/media\/(\d+)$/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

function extractLegacyVideoUrl(content) {
  const match = content.match(/(?:^|\n)Video:\s*(\S+)/i);
  return match ? match[1] : null;
}

function cleanLegacyVideoTag(content) {
  return content.replace(/(?:^|\n)Video:\s*\S+/i, "").trim();
}

async function ensureAssetFromFile(filePath, kind, fileName) {
  const data = await fs.readFile(filePath);
  const mimeType = detectMimeType(fileName, kind);
  const size = data.byteLength;

  const existing = await prisma.mediaAsset.findFirst({
    where: {
      kind,
      filename: fileName,
      size,
    },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.mediaAsset.create({
    data: {
      kind,
      filename: fileName,
      mimeType,
      size,
      data,
    },
    select: { id: true },
  });

  return created.id;
}

async function migrateLegacyFilesToDb() {
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const imagesDir = path.join(uploadsRoot, "images");
  const videosDir = path.join(uploadsRoot, "videos");

  const imageFiles = await readFilesSafe(imagesDir);
  const videoFiles = await readFilesSafe(videosDir);

  const urlToAssetId = new Map();

  for (const fileName of imageFiles) {
    const filePath = path.join(imagesDir, fileName);
    const assetId = await ensureAssetFromFile(filePath, "IMAGE", fileName);
    urlToAssetId.set(`/uploads/images/${fileName}`, assetId);
  }

  for (const fileName of videoFiles) {
    const filePath = path.join(videosDir, fileName);
    const assetId = await ensureAssetFromFile(filePath, "VIDEO", fileName);
    urlToAssetId.set(`/uploads/videos/${fileName}`, assetId);
  }

  return {
    imageFileCount: imageFiles.length,
    videoFileCount: videoFiles.length,
    urlToAssetId,
  };
}

async function migratePostMedia(urlToAssetId) {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      content: true,
      imageUrl: true,
      imageAssetId: true,
      videoAssetId: true,
    },
  });

  let postsUpdated = 0;
  let legacyVideoTagsCleaned = 0;

  for (const post of posts) {
    const updateData = {};

    if (!post.imageAssetId && post.imageUrl) {
      const fromApiMedia = extractMediaIdFromUrl(post.imageUrl);
      if (fromApiMedia) {
        updateData.imageAssetId = fromApiMedia;
      } else if (urlToAssetId.has(post.imageUrl)) {
        const mappedId = urlToAssetId.get(post.imageUrl);
        updateData.imageAssetId = mappedId;
        updateData.imageUrl = `/api/media/${mappedId}`;
      }
    }

    const legacyVideoUrl = extractLegacyVideoUrl(post.content || "");
    if (legacyVideoUrl) {
      let resolvedVideoAssetId = post.videoAssetId || null;
      if (!resolvedVideoAssetId) {
        const fromApiMedia = extractMediaIdFromUrl(legacyVideoUrl);
        if (fromApiMedia) {
          resolvedVideoAssetId = fromApiMedia;
        } else if (urlToAssetId.has(legacyVideoUrl)) {
          resolvedVideoAssetId = urlToAssetId.get(legacyVideoUrl);
        }
      }

      if (resolvedVideoAssetId) {
        updateData.videoAssetId = resolvedVideoAssetId;
        updateData.content = cleanLegacyVideoTag(post.content || "");
        legacyVideoTagsCleaned += 1;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.post.update({
        where: { id: post.id },
        data: updateData,
      });
      postsUpdated += 1;
    }
  }

  return { postsUpdated, legacyVideoTagsCleaned };
}

async function migratePlantUploads(urlToAssetId) {
  const uploads = await prisma.plantImageUpload.findMany({
    select: {
      id: true,
      imageUrl: true,
      imageAssetId: true,
    },
  });

  let uploadsUpdated = 0;

  for (const upload of uploads) {
    if (upload.imageAssetId) {
      continue;
    }

    const updateData = {};

    if (upload.imageUrl) {
      const fromApiMedia = extractMediaIdFromUrl(upload.imageUrl);
      if (fromApiMedia) {
        updateData.imageAssetId = fromApiMedia;
      } else if (urlToAssetId.has(upload.imageUrl)) {
        const mappedId = urlToAssetId.get(upload.imageUrl);
        updateData.imageAssetId = mappedId;
        updateData.imageUrl = `/api/media/${mappedId}`;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.plantImageUpload.update({
        where: { id: upload.id },
        data: updateData,
      });
      uploadsUpdated += 1;
    }
  }

  return { uploadsUpdated };
}

async function main() {
  const fileMigration = await migrateLegacyFilesToDb();
  const postMigration = await migratePostMedia(fileMigration.urlToAssetId);
  const plantMigration = await migratePlantUploads(fileMigration.urlToAssetId);

  console.log("Legacy media migration completed.");
  console.log(
    JSON.stringify(
      {
        filesFound: {
          images: fileMigration.imageFileCount,
          videos: fileMigration.videoFileCount,
        },
        postsUpdated: postMigration.postsUpdated,
        legacyVideoTagsCleaned: postMigration.legacyVideoTagsCleaned,
        plantUploadsUpdated: plantMigration.uploadsUpdated,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
