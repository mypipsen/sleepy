import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { stories } from "~/server/db/schema";

export const storyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async function* ({ ctx, input }) {
      const result = streamText({
        model: openai("gpt-4.1-nano"),
        prompt: input.prompt,
        system: "Tell me a short story. Use the prompt as inspiration.",
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
});
