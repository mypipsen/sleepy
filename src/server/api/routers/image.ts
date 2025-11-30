import { openai } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { stories, instructions } from "~/server/db/schema";
import { getImagePrompt } from "~/server/prompts/image-prompt";

export const imageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ storyId: z.number() }))
    .mutation(async function ({ ctx, input }) {
      const story = await ctx.db.query.stories.findFirst({
        where: and(
          eq(stories.id, input.storyId),
          eq(stories.userId, ctx.session.user.id),
        ),
      });

      if (!story) {
        throw new Error("Story not found");
      }

      const instruction = await ctx.db.query.instructions.findFirst({
        where: eq(instructions.userId, ctx.session.user.id),
      });

      const { image } = await generateImage({
        model: openai.image("dall-e-3"),
        prompt: getImagePrompt(String(story.text), String(instruction?.text)),
        size: "1024x1024",
      });

      return image.base64;
    }),
});
