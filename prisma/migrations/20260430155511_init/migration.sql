-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('PROMPTED', 'FREE');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "type" "PostType" NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "promptId" TEXT,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyPrompt" (
    "id" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "promptText" TEXT NOT NULL,
    "theme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promptBankId" TEXT,

    CONSTRAINT "WeeklyPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptBank" (
    "id" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "theme" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PromptBank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyPrompt_weekOf_key" ON "WeeklyPrompt"("weekOf");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "WeeklyPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPrompt" ADD CONSTRAINT "WeeklyPrompt_promptBankId_fkey" FOREIGN KEY ("promptBankId") REFERENCES "PromptBank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
