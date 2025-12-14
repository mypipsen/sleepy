import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

import type { instructions } from "~/server/db/schema";

const adventureSchema = z.object({
  text: z
    .string()
    .describe(
      "The narrative text for this part of the adventure. Do not include the available choices in this text.",
    ),
  choices: z
    .array(z.string())
    .describe(
      "User-selectable options. These are story actions during the adventure, or image prompts in the final step.",
    ),
  choiceType: z
    .enum(["story", "image"])
    .describe(
      "Indicates whether the choices are story decisions or image prompts used to visualize scenes from the adventure.",
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
  const storySegments = 6;
  const imagePromptSegment = storySegments + 1;

  return `
You are generating a short interactive choose your own adventure story for children.

The user provides four inputs.

1. Global instructions that apply to every adventure:
\`\`\`
${instruction?.text ?? ""}
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
- Final story segment number: ${storySegments}
- Final image prompt segment number: ${imagePromptSegment}

Absolute rules:
- Generate exactly one response.
- The response must strictly match the JSON schema with fields: text, choices, choiceType.
- Keep language suitable for all ages.
- Use emojis when they naturally fit the story.
- Do not plan for or imply any future segments beyond this response.

Segment rules:

If currentSegment is less than or equal to ${storySegments}:
- Write a story segment of 2 to 4 sentences.
- Continue the adventure.
- End at a natural decision point.
- Provide 2 to 4 meaningful story choices.
- Each choice must represent an action the user can take next.
- The choices array must NOT be empty.
- Set choiceType to "story".

If currentSegment is exactly ${imagePromptSegment}:
- This is the final response of the entire adventure.
- Conclude the story in 2 to 4 sentences.
- Do NOT introduce new plot threads.
- Do NOT end at a decision point.
- After the conclusion, provide 2 to 4 image prompt choices.
- Each image prompt must clearly start with wording like "Create an image of".
- Each image prompt must depict a different scene that occurred in the story, such as the beginning, a major challenge, a turning point, or the resolution.
- Each prompt must focus on different characters, locations, or actions.
- Do NOT invent new scenes or events.
- Do NOT mention cameras, lenses, styles, artists, or rendering engines.
- The choices array must NOT be empty.
- Set choiceType to "image".

Completion rules:
- The final segment ends the adventure completely.
- No further story segments should be generated.

Output format:
- Return a single JSON object that matches the schema: text, choices, choiceType.
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
