"use client";

import { useState, useRef, useEffect } from "react";

import { api } from "~/trpc/react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function Story({
  storyId,
  onSelectStory,
}: {
  storyId: number | null;
  onSelectStory: (id: number | null) => void;
}) {
  const utils = api.useUtils();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  const createStory = api.story.create.useMutation();
  const deleteStory = api.story.delete.useMutation({
    onSuccess: async () => {
      await utils.story.getAll.invalidate();
      onSelectStory(null);
    },
  });
  const { data: existingStory, isLoading } = api.story.getById.useQuery(
    { id: storyId! },
    { enabled: !!storyId }
  );

  // Load existing story
  useEffect(() => {
    if (storyId && existingStory) {
      shouldScrollRef.current = false;
      setMessages([
        { id: "prompt", role: "user", content: existingStory.prompt ?? "" },
        { id: "response", role: "assistant", content: existingStory.text ?? "" },
      ]);
    } else if (!storyId) {
      setMessages([]);
    }
  }, [storyId, existingStory]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && shouldScrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || createStory.isPending) return;

    shouldScrollRef.current = true;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    // Clear previous messages and start new conversation
    const assistantMessageId = crypto.randomUUID();
    setMessages([
      userMessage,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);
    setInput("");

    try {
      const result = await createStory.mutateAsync({ prompt: userMessage.content });

      for await (const chunk of result) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      }

      // Refresh the sidebar history
      await utils.story.getAll.invalidate();
    } catch (error) {
      console.error("Failed to generate story:", error);
      // Optionally handle error state in UI
    }
  };

  const handleDelete = () => {
    if (storyId) {
      deleteStory.mutate({ id: storyId });
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white/5 md:p-4 md:shadow-xl md:ring-1 md:ring-white/10">
      {storyId && (
        <div className="mb-4 flex items-center justify-between border-b border-white/10 p-4 md:px-0 md:pt-0 md:pb-4">
          <h2 className="truncate text-lg font-semibold text-white">
            {existingStory?.prompt}
          </h2>
          <button
            onClick={handleDelete}
            disabled={deleteStory.isPending}
            className="rounded px-2 py-1 text-xs text-white/40 transition hover:bg-white/5 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            title="Delete story"
          >
            {deleteStory.isPending ? "⏳" : "🗑️"}
          </button>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="flex justify-end">
              <div className="h-10 w-3/4 rounded-2xl bg-white/10"></div>
            </div>
            <div className="flex justify-start">
              <div className="h-32 w-3/4 rounded-2xl bg-white/10"></div>
            </div>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-white/50">
                <p>Type a prompt to start a story...</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-full md:max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-white"
                    }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {createStory.isPending && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="max-w-full md:max-w-[80%] rounded-2xl bg-white/10 px-4 py-2 text-white">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!storyId && (
        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 p-4 md:mt-4 md:px-0 md:pt-4 md:pb-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me a story about..."
            className="flex-1 rounded-full bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={createStory.isPending || !input.trim()}
            className="rounded-full bg-purple-600 px-6 py-2 font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
