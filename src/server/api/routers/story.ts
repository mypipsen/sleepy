import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { stories } from "~/server/db/schema";

export const storyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const story = await ctx.db
        .insert(stories)
        .values({
          prompt: input.prompt,
          text: "Hello there",
          createdById: ctx.session.user.id,
        })
        .returning();

      return { story };
    }),
  stream: protectedProcedure.query(async function* () {
    const result = streamText({
      model: openai("gpt-4o"),
      prompt: "Tell me a short story.",
    });

    for await (const textPart of result.textStream) {
      yield textPart;
    }
  }),
});
