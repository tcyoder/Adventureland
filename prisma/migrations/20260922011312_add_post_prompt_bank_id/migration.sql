-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "promptBankId" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_promptBankId_fkey" FOREIGN KEY ("promptBankId") REFERENCES "PromptBank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
