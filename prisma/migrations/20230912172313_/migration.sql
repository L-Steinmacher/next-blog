-- DropIndex
DROP INDEX "Comment_postSlug_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "langToken" INTEGER NOT NULL DEFAULT 5;
