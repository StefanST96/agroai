-- AlterTable
ALTER TABLE `PlantImageUpload` ADD COLUMN `imageAssetId` INTEGER NULL,
    MODIFY `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `imageAssetId` INTEGER NULL,
    ADD COLUMN `videoAssetId` INTEGER NULL;

-- CreateTable
CREATE TABLE `UserProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `farmName` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserProfile_userId_key`(`userId`),
    INDEX `UserProfile_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `kind` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `filename` VARCHAR(191) NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `data` LONGBLOB NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MediaAsset_userId_idx`(`userId`),
    INDEX `MediaAsset_kind_idx`(`kind`),
    INDEX `MediaAsset_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SidebarBanner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `ctaText` VARCHAR(191) NULL,
    `ctaHref` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `imageAssetId` INTEGER NULL,
    `variant` ENUM('CARD', 'HERO') NOT NULL DEFAULT 'CARD',
    `position` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SidebarBanner_isActive_position_idx`(`isActive`, `position`),
    INDEX `SidebarBanner_createdById_idx`(`createdById`),
    INDEX `SidebarBanner_imageAssetId_idx`(`imageAssetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContentReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `targetType` ENUM('POST', 'PROFILE') NOT NULL,
    `reporterId` INTEGER NOT NULL,
    `reportedUserId` INTEGER NULL,
    `postId` INTEGER NULL,
    `reason` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `status` ENUM('OPEN', 'REVIEWED', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `resolvedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ContentReport_targetType_status_idx`(`targetType`, `status`),
    INDEX `ContentReport_reporterId_idx`(`reporterId`),
    INDEX `ContentReport_reportedUserId_idx`(`reportedUserId`),
    INDEX `ContentReport_postId_idx`(`postId`),
    INDEX `ContentReport_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DismissedNotification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `notificationKey` VARCHAR(191) NOT NULL,
    `dismissedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DismissedNotification_userId_idx`(`userId`),
    INDEX `DismissedNotification_dismissedAt_idx`(`dismissedAt`),
    UNIQUE INDEX `DismissedNotification_userId_notificationKey_key`(`userId`, `notificationKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeekendActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `city` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `imageAssetId` INTEGER NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WeekendActivity_startAt_idx`(`startAt`),
    INDEX `WeekendActivity_city_idx`(`city`),
    INDEX `WeekendActivity_createdById_idx`(`createdById`),
    INDEX `WeekendActivity_imageAssetId_idx`(`imageAssetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Partner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Partner_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PlantImageUpload_imageAssetId_idx` ON `PlantImageUpload`(`imageAssetId`);

-- CreateIndex
CREATE INDEX `Post_imageAssetId_idx` ON `Post`(`imageAssetId`);

-- CreateIndex
CREATE INDEX `Post_videoAssetId_idx` ON `Post`(`videoAssetId`);

-- AddForeignKey
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_imageAssetId_fkey` FOREIGN KEY (`imageAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_videoAssetId_fkey` FOREIGN KEY (`videoAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlantImageUpload` ADD CONSTRAINT `PlantImageUpload_imageAssetId_fkey` FOREIGN KEY (`imageAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SidebarBanner` ADD CONSTRAINT `SidebarBanner_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SidebarBanner` ADD CONSTRAINT `SidebarBanner_imageAssetId_fkey` FOREIGN KEY (`imageAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentReport` ADD CONSTRAINT `ContentReport_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentReport` ADD CONSTRAINT `ContentReport_reportedUserId_fkey` FOREIGN KEY (`reportedUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentReport` ADD CONSTRAINT `ContentReport_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentReport` ADD CONSTRAINT `ContentReport_resolvedById_fkey` FOREIGN KEY (`resolvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DismissedNotification` ADD CONSTRAINT `DismissedNotification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeekendActivity` ADD CONSTRAINT `WeekendActivity_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeekendActivity` ADD CONSTRAINT `WeekendActivity_imageAssetId_fkey` FOREIGN KEY (`imageAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
