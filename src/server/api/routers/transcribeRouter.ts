import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { transcribeAudio } from "~/server/services/transcribe";

export const transcribeRouter = createTRPCRouter({
  transcribe: protectedProcedure
    .input(z.object({ audio: z.string() }))
    .mutation(async ({ input }) => {
      const text = await transcribeAudio(input.audio);
      return { text };
    }),
});
