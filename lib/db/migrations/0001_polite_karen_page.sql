ALTER TABLE "users" RENAME COLUMN "facebook" TO "github";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "bio";