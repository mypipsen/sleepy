import { put } from "@vercel/blob";
import OpenAI from "openai";
import { eq } from "drizzle-orm";

import { db } from "~/server/db/index";
import { stories } from "~/server/db/schema";

export async function createVideo(story: typeof stories.$inferSelect) {
  if (!story.imageInstructions) {
    return;
  }

  const openai = new OpenAI();
  let video = await openai.videos.create({
    model: "sora-2",
    prompt: story.imageInstructions,
  });

  console.log("Video generation started: ", video);

  let progress = video.progress ?? 0;

  while (video.status === "in_progress" || video.status === "queued") {
    video = await openai.videos.retrieve(video.id);
    progress = video.progress ?? 0;

    // Display progress bar
    const barLength = 30;
    const filledLength = Math.floor((progress / 100) * barLength);
    // Simple ASCII progress visualization for terminal output
    const bar = "=".repeat(filledLength) + "-".repeat(barLength - filledLength);
    const statusText = video.status === "queued" ? "Queued" : "Processing";

    console.log(`${statusText}: [${bar}] ${progress.toFixed(1)}%`);

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Clear the progress line and show completion
  console.log("\n");

  if (video.status === "failed") {
    console.error("Video generation failed");
  }

  console.log("Video generation completed: ", video);

  console.log("Downloading video content...");

  const content = await openai.videos.downloadContent(video.id);

  const body = content.arrayBuffer();
  const buffer = Buffer.from(await body);

  const { url } = await put(`videos/story-${story.id}`, buffer, {
    contentType: "video/mp4",
    access: "public",
    addRandomSuffix: true,
  });

  await db
    .update(stories)
    .set({ videoUrl: url })
    .where(eq(stories.id, story.id));

  return url;
}
