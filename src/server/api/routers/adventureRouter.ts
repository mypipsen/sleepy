import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  adventures,
  adventureSegments,
  instructions,
} from "~/server/db/schema";
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

  getAll: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.adventures.findMany({
        where: eq(adventures.userId, ctx.session.user.id),
        orderBy: (adventures, { desc }) => [desc(adventures.createdAt)],
        limit: input?.limit,
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.adventures.findFirst({
        where: and(
          eq(adventures.id, input.id),
          eq(adventures.userId, ctx.session.user.id),
        ),
        with: {
          segments: {
            orderBy: (segments, { asc }) => [asc(segments.createdAt)],
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(adventureSegments)
        .where(eq(adventureSegments.adventureId, input.id));

      await ctx.db
        .delete(adventures)
        .where(
          and(
            eq(adventures.id, input.id),
            eq(adventures.userId, ctx.session.user.id),
          ),
        );
    }),
});
