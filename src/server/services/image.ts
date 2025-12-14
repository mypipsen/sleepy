import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import { experimental_generateImage as generateImage } from "ai";

import { type instructions } from "~/server/db/schema";

function getPrompt(
  imagePrompt: string,
  instruction?: typeof instructions.$inferSelect,
) {
  return `Create a friendly illustration for a childrens bedtime story. The image should feel soft, warm, and comforting, with gentle lighting and rounded shapes. Nothing scary or intense. It should visually match the main characters, setting, and mood of the story.

Instructions for generating an image that fits the specific story:
\`\`\`
${imagePrompt}
\`\`\`

Generalized prompt that the user has provided specifically for all stories:
\`\`\`
${instruction?.imageText}
\`\`\`

Art style guidelines:
- Modern cartoon style similar to Paw Patrol and other popular kids TV shows today.
- Simple clean character designs with big expressive eyes.
- Soft edges and smooth shading.
- A cozy feeling that supports bedtime.

Do not include text in the image. Focus on a single scene that represents the heart of the story and feels magical and peaceful.`;
}

export async function createImage({
  prompt,
  instruction,
}: {
  prompt: string;
  instruction?: typeof instructions.$inferSelect;
}) {
  if (!prompt) {
    return;
  }

  const { image } = await generateImage({
    model: openai.image("dall-e-3"),
    prompt: getPrompt(prompt, instruction),
    size: "1024x1024",
  });

  const { url } = await put(
    `images/${crypto.randomUUID()}`,
    Buffer.from(image.base64, "base64"),
    {
      contentType: image.mediaType,
      access: "public",
      addRandomSuffix: true,
    },
  );

  return url;
}
