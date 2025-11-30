"use client";

import { useState, useRef, useEffect } from "react";

import { api } from "~/trpc/react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function Story() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const createStory = api.story.create.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || createStory.isPending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const assistantMessageId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      const result = await createStory.mutateAsync({
        prompt: userMessage.content,
      });

      for await (const chunk of result) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to generate story:", error);
      // Optionally handle error state in UI
    }
  };

  return (
    <div className="flex h-[600px] w-full max-w-2xl flex-col rounded-xl bg-white/5 p-4 shadow-xl ring-1 ring-white/10">
      <div
        ref={scrollRef}
        className="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent flex-1 space-y-4 overflow-y-auto p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-white/50">
            <p>Type a prompt to start a story...</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {createStory.isPending &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-white/10 px-4 py-2 text-white">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex gap-2 border-t border-white/10 pt-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me a story about..."
          className="flex-1 rounded-full bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={createStory.isPending || !input.trim()}
          className="rounded-full bg-purple-600 px-6 py-2 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
