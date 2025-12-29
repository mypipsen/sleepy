import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createColoringImage } from "~/server/services/image";

export const imageRouter = createTRPCRouter({
  createColoring: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const url = await createColoringImage({ prompt: input.prompt });
      return { url };
    }),
});
