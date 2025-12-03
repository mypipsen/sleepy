ALTER TABLE "story" RENAME COLUMN "imageInstructions" TO "imagePrompt";--> statement-breakpoint
ALTER TABLE "instruction" ADD COLUMN "imageText" text;