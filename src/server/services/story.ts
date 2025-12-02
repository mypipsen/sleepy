import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "~/server/db/index";
import { instructions } from "~/server/db/schema";

const storySchema = z.object({
  title: z.string().describe("A title for the story"),
  text: z.string().describe("The full story text"),
  imageInstructions: z
    .string()
    .describe("Instructions for generating an image that fits the story"),
});

function getSystemPrompt(instruction?: string | null) {
  return `You tell bedtime stories for children. Your stories should take about 5 minutes to read out loud.

The user will provide two things:

1. General instructions that apply to every story:
\`\`\`
${instruction}
\`\`\`

2. Story specific inspiration such as keywords, characters, locations, or a short setup.

Follow these requirements:
- Write in simple language that is fun, imaginative, and comforting.
- Keep conflict light and avoid anything scary.
- Use lots of emojis.
- Always conclude with a peaceful resolution that makes the child feel safe and relaxed.
- Ensure pacing suitable for a bedtime reading length.
- Use the general instructions and the story inspiration together to create a complete story.

When the user gives inspiration for a new story, respond with the full bedtime tale. Do not mention any missing information. Fill in pleasant details on your own.
`;
}

export async function streamStory({
  userId,
  prompt,
}: {
  userId: string;
  prompt: string;
}) {
  const instruction = await db.query.instructions.findFirst({
    where: eq(instructions.userId, userId),
  });

  return streamObject({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    model: openai("gpt-4.1") as any,
    prompt,
    system: getSystemPrompt(instruction?.text),
    schema: storySchema,
  });
}
