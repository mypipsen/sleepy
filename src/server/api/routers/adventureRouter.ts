import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { adventures, instructions } from "~/server/db/schema";
import { streamAdventure } from "~/server/services/adventure";
import { createImage } from "~/server/services/image";

export const adventureRouter = createTRPCRouter({
  start: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async function* ({ ctx, input }) {
      const [adventure] = await ctx.db
        .insert(adventures)
        .values({
          prompt: input.prompt,
          userId: ctx.session.user.id,
        })
        .returning();

      if (!adventure) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create adventure",
        });
      }

      yield { type: "id" as const, content: adventure.id };

      const instruction = await ctx.db.query.instructions.findFirst({
        where: eq(instructions.userId, ctx.session.user.id),
      });

      yield* streamAdventure({ adventure, instruction });
    }),

  chat: protectedProcedure
    .input(
      z.object({
        adventureId: z.number(),
        choice: z.string(),
        choiceType: z.enum(["story", "image"]).default("story"),
      }),
    )
    .mutation(async function* ({ ctx, input }) {
      const adventure = await ctx.db.query.adventures.findFirst({
        where: and(
          eq(adventures.id, input.adventureId),
          eq(adventures.userId, ctx.session.user.id),
        ),
      });

      if (!adventure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Adventure not found",
        });
      }

      const instruction = await ctx.db.query.instructions.findFirst({
        where: eq(instructions.userId, ctx.session.user.id),
      });

      if (input.choiceType === "story") {
        yield* streamAdventure({
          adventure,
          instruction,
          lastChoice: input.choice,
        });
      }

      if (input.choiceType === "image") {
        const imageUrl = await createImage({
          prompt: input.choice,
          instruction,
        });

        if (imageUrl) {
          yield { type: "image" as const, content: imageUrl };

          await ctx.db
            .update(adventures)
            .set({ imagePrompt: input.choice, imageUrl })
            .where(eq(adventures.id, input.adventureId));
        }
      }
    }),
});
