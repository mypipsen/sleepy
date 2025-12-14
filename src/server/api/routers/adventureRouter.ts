import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { instructions } from "~/server/db/schema";
import { streamAdventure } from "~/server/services/adventure";
import { createImage } from "~/server/services/image";

export const adventureRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        adventureSegments: z.array(z.string()).default([]),
        lastChoice: z.string().optional(),
        choiceType: z.enum(["story", "image"]).optional(),
      }),
    )
    .mutation(async function* ({ ctx, input }) {
      const instruction = await ctx.db.query.instructions.findFirst({
        where: eq(instructions.userId, ctx.session.user.id),
      });

      if (input.choiceType === "story") {
        const stream = await streamAdventure({
          prompt: input.prompt,
          adventureSegments: input.adventureSegments,
          lastChoice: input.lastChoice,
          instruction,
        });

        let text = "";
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
        }

        yield {
          type: "choices" as const,
          content: choices,
          choiceType,
        };
      }

      if (input.choiceType === "image") {
        const imageUrl = await createImage({
          prompt: input.lastChoice ?? "",
          //adventure,
          instruction,
        });

        if (imageUrl) {
          yield { type: "image" as const, content: imageUrl };
        }
      }
    }),
});
