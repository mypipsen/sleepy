import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

import type { instructions } from "~/server/db/schema";

const adventureSchema = z.object({
  text: z
    .string()
    .describe(
      "The text from this part of the adventure. Do not include the available choices in this text.",
    ),
  choices: z
    .array(z.string())
    .describe(
      "Some meaningful choices that lead the adventure in clearly different directions. This should be empty when the adventure is over.",
    ),
});

function getPrompt({
  prompt,
  adventureSegments,
  lastChoice,
  instruction,
}: {
  prompt: string;
  adventureSegments: string[];
  lastChoice?: string;
  instruction?: typeof instructions.$inferSelect;
}) {
  const currentSegment = adventureSegments.length + 1;
  const maxSegments = 7;

  return `
You are generating a short interactive choose your own adventure story for children.

The user provides four inputs.

1. Global instructions that apply to every adventure:
\`\`\`
${instruction?.text}
\`\`\`

2. The prompt that started the adventure:
\`\`\`
${prompt}
\`\`\`

3. The adventure so far, in order:
\`\`\`
${JSON.stringify(adventureSegments)}
\`\`\`

4. The user's most recent choice:
\`\`\`
${lastChoice ?? "None. This is the beginning of the adventure."}
\`\`\`

Story state:
- Current segment number: ${currentSegment}
- Maximum number of segments: ${maxSegments}

Hard rules you must follow exactly:
- Write exactly one new adventure segment.
- The segment must be 2 to 4 sentences long.
- Keep language suitable for all ages.
- Use emojis when they naturally fit the story.
- The response must strictly match the provided JSON schema.

Branching rules:
- If currentSegment is less than maxSegments:
  - End the segment at a natural decision point.
  - Provide 2 to 4 meaningful choices.
  - Each choice must lead the story in a clearly different direction.
  - The choices array must NOT be empty.
- If currentSegment is equal to maxSegments:
  - This is the final segment of the story.
  - Write a clear and satisfying ending with resolution.
  - Do NOT introduce new plot threads.
  - Do NOT end at a decision point.
  - The choices array MUST be empty.

Schema semantics:
- An empty choices array means the story is finished.
- Once the choices array is empty, the story must not continue.

Output format:
- Return a single JSON object that matches the schema.
- Do not include explanations, commentary, or extra text.
`;
}

export async function streamAdventure({
  prompt,
  adventureSegments,
  lastChoice,
  instruction,
}: {
  prompt: string;
  adventureSegments: string[];
  lastChoice?: string;
  instruction?: typeof instructions.$inferSelect;
}) {
  return streamObject({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    model: openai("gpt-4.1") as any,
    prompt: getPrompt({ prompt, adventureSegments, lastChoice, instruction }),
    schema: adventureSchema,
  });
}
