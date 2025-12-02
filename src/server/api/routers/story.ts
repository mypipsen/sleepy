import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import { streamObject, experimental_generateImage as generateImage } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { stories, instructions } from "~/server/db/schema";
import { getStoryPrompt } from "~/server/prompts/story-prompt";
import { getImagePrompt } from "~/server/prompts/image-prompt";

const storySchema = z.object({
  title: z.string().describe("A title for the story"),
  text: z.string().describe("The full story text"),
  imageInstructions: z
    .string()
    .describe("Instructions for generating an image that fits the story"),
});

export const storyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async function* ({ ctx, input }) {
      const instruction = await ctx.db.query.instructions.findFirst({
        where: eq(instructions.userId, ctx.session.user.id),
      });

      const result = streamObject({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        model: openai("gpt-4.1") as any,
        prompt: input.prompt,
        system: getStoryPrompt(String(instruction?.text)),
        schema: storySchema,
      });

      let text = "";
      let title = "";
      let imageInstructions = "";

      for await (const partialObject of result.partialObjectStream) {
        if (partialObject.text !== undefined) {
          const newText = partialObject.text.slice(text.length);
          text = partialObject.text;
          if (newText) {
            yield { type: "text" as const, content: newText };
          }
        }
        if (partialObject.title !== undefined) {
          title = partialObject.title;
          yield { type: "title" as const, content: title };
        }
        if (partialObject.imageInstructions !== undefined) {
          imageInstructions = partialObject.imageInstructions;
        }
      }

      const [story] = await ctx.db
        .insert(stories)
        .values({
          prompt: input.prompt,
          title,
          text,
          imageInstructions,
          userId: ctx.session.user.id,
        })
        .returning();

      if (!story) {
        return;
      }

      yield { type: "storyId" as const, content: story.id };

      const { image } = await generateImage({
        model: openai.image("dall-e-3"),
        prompt: getImagePrompt(imageInstructions),
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
