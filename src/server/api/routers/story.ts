import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { stories } from "~/server/db/schema";

export const storyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async function* ({ ctx, input }) {
      const result = streamText({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        model: openai("gpt-4.1-nano") as any,
        prompt: input.prompt,
        system: "Tell me a short story. Use the prompt as inspiration. Always write the story in Danish.",
      });

      let text = "";
      for await (const textPart of result.textStream) {
        text += textPart;
        yield textPart;
      }

      await ctx.db.insert(stories).values({
        prompt: input.prompt,
        text,
        createdById: ctx.session.user.id,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.stories.findMany({
      where: eq(stories.createdById, ctx.session.user.id),
      orderBy: (stories, { desc }) => [desc(stories.createdAt)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.stories.findFirst({
        where: and(
          eq(stories.id, input.id),
          eq(stories.createdById, ctx.session.user.id),
        ),
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(stories)
        .where(
          and(
            eq(stories.id, input.id),
            eq(stories.createdById, ctx.session.user.id),
          ),
        );
    }),
});
