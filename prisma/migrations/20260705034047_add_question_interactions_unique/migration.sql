/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,questionId]` on the table `question_interactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "question_interactions_sessionId_questionId_key" ON "question_interactions"("sessionId", "questionId");
