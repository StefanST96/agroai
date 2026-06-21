-- AlterTable
ALTER TABLE `AiMessage` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Comment` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `DiseaseAnalysis` MODIFY `recommendation` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Post` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Subsidy` MODIFY `description` TEXT NOT NULL;
