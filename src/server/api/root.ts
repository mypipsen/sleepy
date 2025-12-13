import { adventureRouter } from "./routers/adventureRouter";
import { storyRouter } from "~/server/api/routers/storyRouter";
import { instructionRouter } from "~/server/api/routers/instructionRouter";
import { transcribeRouter } from "~/server/api/routers/transcribeRouter";

import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  story: storyRouter,
  adventure: adventureRouter,
  instruction: instructionRouter,
  transcribe: transcribeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
