import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/server/db/index";
import {
  adventures,
  adventureSegments,
  type instructions,
} from "~/server/db/schema";

const adventureSchema = z.object({
  text: z
    .string()
    .describe(
      "The narrative text for this part of the adventure. Do not include the available choices in this text.",
    ),
  title: z
    .string()
    .optional()
    .describe(
      "A title for the adventure. This should only be filled when its the start of the adventure.",
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
  adventure,
  segments,
  lastChoice,
  instruction,
}: {
  adventure: typeof adventures.$inferSelect;
  segments: Array<typeof adventureSegments.$inferInsert>;
  lastChoice?: string;
  instruction?: typeof instructions.$inferSelect;
}) {
  const currentSegment = segments.length + 1;
  const storySegments = 5;
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
${adventure.prompt}
\`\`\`

3. The adventure so far, in order:
\`\`\`
${JSON.stringify(segments)}
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

Story enrichment rules (apply to all story segments):
- Introduce one recurring magical object, creature, or mystery early in the story.
- This element must subtly influence multiple segments.
- Each new segment should slightly raise tension, curiosity, or stakes.
- At least one segment must include a surprising but age-appropriate twist.
- The final story segment must resolve the recurring element in a satisfying way.

Segment rules:

If currentSegment is exactly 1:
- Set the title in the output.

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

export async function* streamAdventure({
  adventure,
  instruction,
  lastChoice,
}: {
  adventure: typeof adventures.$inferSelect;
  instruction?: typeof instructions.$inferSelect;
  lastChoice?: string;
}) {
  const segments = await db.query.adventureSegments.findMany({
    where: eq(adventureSegments.adventureId, adventure.id),
    orderBy: (segments, { asc }) => [asc(segments.id)],
  });

  const stream = streamObject({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    model: openai("gpt-4.1") as any,
    prompt: getPrompt({ adventure, segments, lastChoice, instruction }),
    schema: adventureSchema,
  });

  let text = "";
  let title = "";
  let choices: Array<string | undefined> = [];
  let choiceType: "story" | "image" = "story";

  for await (const partialObject of stream.partialObjectStream) {
    if (partialObject.text !== undefined) {
      const newText = partialObject.text.slice(text.length);
      text = partialObject.text;
      if (newText) {
        yield { type: "text" as const, content: newText };
      }
    }

    if (Array.isArray(partialObject.choices)) {
      choices = partialObject.choices;
    }

    if (partialObject.choiceType) {
      choiceType = partialObject.choiceType;
    }

    if (partialObject.title !== undefined) {
      title = partialObject.title;
      yield { type: "title" as const, content: title };

      await db
        .update(adventures)
        .set({ title })
        .where(eq(adventures.id, adventure.id));
    }
  }

  if (text) {
    await db.insert(adventureSegments).values({
      adventureId: adventure.id,
      text,
      choice: lastChoice,
    });
  }

  yield {
    type: "choices" as const,
    content: choices,
    choiceType,
  };
}
