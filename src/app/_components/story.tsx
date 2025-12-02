"use client";

import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { api } from "~/trpc/react";
import { StoryInput } from "./story/story-input";
import { MessageList } from "./story/message-list";
import { StoryImage } from "./story/story-image";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type StoryProps = {
  storyId: number | null;
  onSelectStory: (id: number | null) => void;
};

export function Story({ storyId, onSelectStory }: StoryProps) {
  const utils = api.useUtils();
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
    } else if (!storyId) {
      setMessages([]);
      setGeneratedImage(null);
    }
  }, [storyId, existingStory]);

  const handleSubmit = async (prompt: string) => {
    if (isGenerating) return;

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
    setIsGenerating(true);
    setIsWaitingForImage(false);

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
        } else if (chunk.type === "storyId") {
          setIsWaitingForImage(true);
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
      setIsGenerating(false);
      setIsWaitingForImage(false);
    }
  };

  // Show input form for new stories
  if (!storyId && messages.length === 0) {
    return <StoryInput onSubmit={handleSubmit} isGenerating={isGenerating} />;
  }

  // Show messages for existing or generating stories
  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <MessageList
        messages={messages}
        isLoading={isLoading}
        isPending={createStory.isPending}
      />
      <Box sx={{ mt: 2 }}>
        <StoryImage imageUrl={generatedImage} isLoading={isWaitingForImage} />
      </Box>
    </Box>
  );
}
