import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

import type { instructions } from "~/server/db/schema";

const adventureSchema = z.object({
  text: z.string().describe("The text from this part of the adventure"),
  choices: z
    .array(z.string())
    .describe(
      "2 to 4 meaningful choices that lead the adventure in clearly different directions. This should be empty when the adventure is over.",
    ),
});

function getPrompt({
  prompt,
  adventureText,
  lastChoice,
  instruction,
}: {
  prompt?: string;
  adventureText?: string;
  lastChoice?: string;
  instruction?: typeof instructions.$inferSelect;
}) {
  return `You are generating an interactive choose your own adventure story for children.

The user will provide four things:

1. General instructions that apply to every adventure:
\`\`\`
${instruction?.text}
\`\`\`

2. The prompt to start the initial adventure:
\`\`\`
${prompt}
\`\`\`

3. The adventure so far:
\`\`\`
${adventureText}
\`\`\`

4. The user's last choice:
\`\`\`
${lastChoice}
\`\`\`

Follow these requirements:
- Continue the adventure in a consistent tone and style.
- Write the next adventure segment in 3 to 5 sentences.
- End the segment at a natural decision point.
- Provide 2 to 4 meaningful choices that lead the adventure in clearly different directions.
- Do not resolve the entire adventure.
- Do not repeat previous text.
- Keep language suitable for all ages.
- Use emojis when they fit into the adventure.
`;
}

export async function streamAdventure({
  prompt,
  adventureText,
  lastChoice,
  instruction,
}: {
  prompt?: string;
  adventureText?: string;
  lastChoice?: string;
  instruction?: typeof instructions.$inferSelect;
}) {
  return streamObject({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    model: openai("gpt-4.1") as any,
    prompt: getPrompt({ prompt, adventureText, lastChoice, instruction }),
    schema: adventureSchema,
  });
}
