import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { instructions } from "~/server/db/schema";

export const instructionRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async function ({ ctx, input }) {
      await ctx.db
        .insert(instructions)
        .values({
          text: input.text,
          userId: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          target: instructions.userId,
          set: {
            text: input.text,
            updatedAt: new Date(),
          },
        });
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.instructions.findFirst({
      where: eq(instructions.userId, ctx.session.user.id),
    });
    return result ?? null;
  }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(instructions)
      .where(eq(instructions.userId, ctx.session.user.id));
  }),
});
