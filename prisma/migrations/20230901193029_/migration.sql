/*
  Warnings:

  - A unique constraint covering the columns `[postSlug]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Comment_postSlug_key" ON "Comment"("postSlug");
