"use client";

import { Stack } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { api } from "~/trpc/react";

import { MessageInput } from "./shared/message-input";
import { MessageList } from "./shared/message-list";
import { StoryImage } from "./shared/story-image";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type StoryProps = {
  storyId: number | null;
  mode?: "story" | "adventure" | "coloring";
  onModeChange?: (mode: "story" | "adventure" | "coloring") => void;
};

export function Story({ storyId, mode, onModeChange }: StoryProps) {
  const utils = api.useUtils();
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isWaitingForImage, setIsWaitingForImage] = useState(false);

  const createStory = api.story.create.useMutation();
  const { data: existingStory, isLoading } = api.story.getById.useQuery(
    { id: storyId! },
    { enabled: !!storyId },
  );

  // Load existing story
  useEffect(() => {
    if (storyId && existingStory) {
      setMessages([
        { id: "prompt", role: "user", content: existingStory.prompt ?? "" },
        {
          id: "response",
          role: "assistant",
          content: existingStory.text ?? "",
        },
      ]);
      setGeneratedImage(existingStory.imageUrl ?? null);
      setTitle(existingStory.title ?? "");
    } else if (!storyId) {
      setMessages([]);
      setGeneratedImage(null);
      setTitle("");
    }
  }, [storyId, existingStory]);

  const handleSubmit = useCallback(
    async (prompt: string) => {
      if (createStory.isPending) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
      };

      // Clear previous messages and start new conversation
      const assistantMessageId = crypto.randomUUID();
      setMessages([
        userMessage,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);
      setGeneratedImage(null);
      setTitle("");

      try {
        const result = await createStory.mutateAsync({
          prompt: userMessage.content,
        });

        for await (const chunk of result) {
          if (chunk.type === "text") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + chunk.content }
                  : msg,
              ),
            );
          } else if (chunk.type === "title") {
            setTitle(chunk.content);
          } else if (chunk.type === "storyId") {
            setIsWaitingForImage(true);
            // Update URL without reloading
            const url = new URL(window.location.href);
            url.searchParams.set("story", String(chunk.content));
            window.history.pushState({}, "", url.toString());
          } else if (chunk.type === "image") {
            setGeneratedImage(chunk.content);
            setIsWaitingForImage(false);
          }
        }

        // Refresh the sidebar history
        await utils.story.getAll.invalidate();
      } catch (error) {
        console.error("Failed to generate story:", error);
      } finally {
        setIsWaitingForImage(false);
      }
    },
    [createStory, utils],
  );

  // Show input form for new stories
  if (!storyId && messages.length === 0) {
    return (
      <MessageInput
        onSubmit={handleSubmit}
        isGenerating={createStory.isPending}
        mode={mode}
        onModeChange={onModeChange}
      />
    );
  }

  // Show messages for existing or generating stories
  return (
    <Stack spacing={2} sx={{ p: 2, pb: 4 }}>
      <MessageList
        messages={messages}
        title={title}
        isLoading={isLoading}
        isPending={createStory.isPending}
      />
      <StoryImage imageUrl={generatedImage} isLoading={isWaitingForImage} />
    </Stack>
  );
}
