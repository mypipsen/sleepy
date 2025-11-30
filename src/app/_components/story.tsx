"use client";

import { useState, Fragment } from "react";

import { api } from "~/trpc/react";

export function Story() {
  const utils = api.useUtils();
  const [prompt, setPrompt] = useState("");
  const [storyChunks, setStoryChunks] = useState<string[]>([]);

  const createStory = api.story.create.useMutation({
    onSuccess: async () => {
      await utils.story.invalidate();
      setPrompt("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {createStory.isError && <p>Error: {createStory.error.message}</p>}
      <p>
        {storyChunks.map((chunk, index) => (
          <Fragment key={index}>{chunk}</Fragment>
        ))}
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setStoryChunks([]);
          const result = await createStory.mutateAsync({ prompt });
          for await (const chunk of result) {
            setStoryChunks((prev) => [...prev, chunk]);
          }
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Type something.."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createStory.isPending}
        >
          {createStory.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
