import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import { streamText, experimental_generateImage as generateImage } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { stories, instructions } from "~/server/db/schema";
import { getStoryPrompt } from "~/server/prompts/story-prompt";
import { getImagePrompt } from "~/server/prompts/image-prompt";

export const storyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async function* ({ ctx, input }) {
      const instruction = await ctx.db.query.instructions.findFirst({
        where: eq(instructions.userId, ctx.session.user.id),
      });

      const result = streamText({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        model: openai("gpt-4.1-nano") as any,
        prompt: input.prompt,
        system: getStoryPrompt(String(instruction?.text)),
      });

      let text = "";
      for await (const textPart of result.textStream) {
        text += textPart;
        yield { type: "text" as const, content: textPart };
      }

      const [story] = await ctx.db
        .insert(stories)
        .values({
          prompt: input.prompt,
          text,
          userId: ctx.session.user.id,
        })
        .returning();

      if (!story) {
        return;
      }

      yield { type: "storyId" as const, content: story.id };

      const { image } = await generateImage({
        model: openai.image("dall-e-3"),
        prompt: getImagePrompt(text),
        size: "1024x1024",
      });

      yield { type: "image" as const, content: image.base64 };

      const { url } = await put(
        `images/story-${story.id}`,
        Buffer.from(image.base64, "base64"),
        {
          contentType: image.mediaType,
          access: "public",
          addRandomSuffix: true,
        },
      );

      await ctx.db
        .update(stories)
        .set({ imageUrl: url })
        .where(eq(stories.id, story.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.stories.findMany({
      where: eq(stories.userId, ctx.session.user.id),
      orderBy: (stories, { desc }) => [desc(stories.createdAt)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.stories.findFirst({
        where: and(
          eq(stories.id, input.id),
          eq(stories.userId, ctx.session.user.id),
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
            eq(stories.userId, ctx.session.user.id),
          ),
        );
    }),
});
