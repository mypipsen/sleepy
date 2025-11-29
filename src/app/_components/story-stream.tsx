"use client";

import { Fragment } from "react";

import { api } from "~/trpc/react";

export function StoryStream() {
  const stream = api.story.stream.useQuery(undefined, { enabled: false });

  return (
    <div className="w-full max-w-xs">
      <button
        onClick={() => stream.refetch()}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={stream.isFetching}
      >
        {stream.isFetching ? "Generating..." : "Tell me a story..."}
      </button>
      {stream.isError && <p>Error: {stream.error.message}</p>}
      <p>
        {stream.data?.map((chunk, index) => (
          <Fragment key={index}>{chunk}</Fragment>
        ))}
      </p>
    </div>
  );
}
