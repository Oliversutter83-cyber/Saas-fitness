-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "blocker" TEXT,
ADD COLUMN     "canJump" BOOLEAN,
ADD COLUMN     "lastActive" TEXT,
ADD COLUMN     "minutesAvailable" INTEGER;
