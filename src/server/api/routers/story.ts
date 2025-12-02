import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { stories } from "~/server/db/schema";
import { createImage } from "~/server/services/image";
// import { createVideo } from "~/server/services/video";
import { streamStory } from "~/server/services/story";

export const storyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async function* ({ ctx, input }) {
      const stream = await streamStory({
        userId: ctx.session.user.id,
        prompt: input.prompt,
      });

      let text = "";
      let title = "";
      let imageInstructions = "";

      for await (const partialObject of stream.partialObjectStream) {
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

      const imageUrl = await createImage(story);
      if (imageUrl) {
        yield { type: "image" as const, content: imageUrl };
      }

      /*
      const videoUrl = await createVideo(story);
      if (videoUrl) {
        yield { type: "video" as const, content: videoUrl };
      }
      */
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
