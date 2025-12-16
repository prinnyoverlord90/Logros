-- DropIndex
DROP INDEX "user_achievements_userId_achievementId_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_achievements" ("category", "createdAt", "description", "id", "isActive", "name", "points", "updatedAt") SELECT "category", "createdAt", "description", "id", "isActive", "name", "points", "updatedAt" FROM "achievements";
DROP TABLE "achievements";
ALTER TABLE "new_achievements" RENAME TO "achievements";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
