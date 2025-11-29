"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function Story() {
  const utils = api.useUtils();
  const [prompt, setPrompt] = useState("");

  const createStory = api.story.create.useMutation({
    onSuccess: async () => {
      await utils.story.invalidate();
      setPrompt("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {createStory.isSuccess && <div>{JSON.stringify(createStory.data.story)}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createStory.mutate({ prompt });
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
