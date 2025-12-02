import { put } from "@vercel/blob";
import OpenAI from "openai";
import { eq } from "drizzle-orm";

import { db } from "~/server/db/index";
import { stories } from "~/server/db/schema";

export async function* streamVideo(story: typeof stories.$inferSelect) {
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

    yield { type: "progress" as const, progress };

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (video.status === "failed") {
    console.error("Video generation failed");
    return;
  }

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

  yield { type: "video" as const, url };
}
