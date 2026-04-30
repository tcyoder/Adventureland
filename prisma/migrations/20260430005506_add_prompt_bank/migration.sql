-- CreateTable
CREATE TABLE "PromptBank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promptText" TEXT NOT NULL,
    "theme" TEXT,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WeeklyPrompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekOf" DATETIME NOT NULL,
    "promptText" TEXT NOT NULL,
    "theme" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promptBankId" TEXT,
    CONSTRAINT "WeeklyPrompt_promptBankId_fkey" FOREIGN KEY ("promptBankId") REFERENCES "PromptBank" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WeeklyPrompt" ("createdAt", "id", "promptText", "theme", "weekOf") SELECT "createdAt", "id", "promptText", "theme", "weekOf" FROM "WeeklyPrompt";
DROP TABLE "WeeklyPrompt";
ALTER TABLE "new_WeeklyPrompt" RENAME TO "WeeklyPrompt";
CREATE UNIQUE INDEX "WeeklyPrompt_weekOf_key" ON "WeeklyPrompt"("weekOf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
