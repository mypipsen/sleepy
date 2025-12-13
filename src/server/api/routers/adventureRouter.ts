import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { instructions } from "~/server/db/schema";
import { streamAdventure } from "~/server/services/adventure";

export const adventureRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        adventureSegments: z.array(z.string()).default([]),
        lastChoice: z.string().optional(),
      }),
    )
    .mutation(async function* ({ ctx, input }) {
      const instruction = await ctx.db.query.instructions.findFirst({
        where: eq(instructions.userId, ctx.session.user.id),
      });

      const stream = await streamAdventure({
        prompt: input.prompt,
        adventureSegments: input.adventureSegments,
        lastChoice: input.lastChoice,
        instruction,
      });

      let text = "";
      let choices: Array<string | undefined> = [];

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
      }

      yield { type: "choices" as const, content: choices };
    }),
});
