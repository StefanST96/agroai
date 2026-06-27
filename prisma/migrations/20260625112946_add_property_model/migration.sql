-- AlterTable
ALTER TABLE `Post` MODIFY `category` ENUM('GENERAL', 'QUESTION', 'MARKET', 'SUBSIDY', 'DISEASE', 'VOCARSTVO', 'BILJNA_PROIZVODNJA', 'STOCARSTVO', 'POVRCARSTVO', 'ZIVOT_NA_SELU') NOT NULL DEFAULT 'GENERAL';

-- CreateTable
CREATE TABLE `Property` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'EUR',
    `city` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NULL,
    `areaSqm` INTEGER NULL,
    `landHa` DECIMAL(8, 2) NULL,
    `rooms` INTEGER NULL,
    `category` ENUM('KUCA', 'ZEMLJISTE', 'STAN', 'VIKENDICA', 'IMANJE') NOT NULL DEFAULT 'KUCA',
    `imageUrl` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Property_category_idx`(`category`),
    INDEX `Property_city_idx`(`city`),
    INDEX `Property_isActive_idx`(`isActive`),
    INDEX `Property_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
