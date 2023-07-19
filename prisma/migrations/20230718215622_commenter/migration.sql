/*
  Warnings:

  - Made the column `commenterId` on table `Comment` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postSlug" TEXT NOT NULL,
    "commenterId" TEXT NOT NULL,
    "clientId" TEXT,
    "content" TEXT NOT NULL,
    CONSTRAINT "Comment_commenterId_fkey" FOREIGN KEY ("commenterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("clientId", "commenterId", "content", "createdAt", "id", "postSlug") SELECT "clientId", "commenterId", "content", "createdAt", "id", "postSlug" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_commenterId_postSlug_idx" ON "Comment"("commenterId", "postSlug");
CREATE INDEX "Comment_clientId_postSlug_idx" ON "Comment"("clientId", "postSlug");
CREATE INDEX "Comment_postSlug_createdAt_idx" ON "Comment"("postSlug", "createdAt");
CREATE INDEX "Comment_createdAt_commenterId_idx" ON "Comment"("createdAt", "commenterId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
