"use client";

import { Stack } from "@mui/material";
import { useState } from "react";

import { api } from "~/trpc/react";

import { MessageInput } from "./shared/message-input";
import { MessageList } from "./shared/message-list";
import { StoryImage } from "./shared/story-image";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ColoringProps = {
  mode: "story" | "adventure" | "coloring";
  onModeChange: (mode: "story" | "adventure" | "coloring") => void;
};

export function Coloring({ mode, onModeChange }: ColoringProps) {
  const [image, setImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const createColoring = api.image.createColoring.useMutation();

  const handleCreate = async (text: string) => {
    try {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
        },
      ]);
      setImage(null);
      const result = await createColoring.mutateAsync({ prompt: text });
      setImage(result.url ?? null);
    } catch (error) {
      console.error("Failed to generate coloring page:", error);
    }
  };

  if (messages.length === 0) {
    return (
      <MessageInput
        onSubmit={handleCreate}
        isGenerating={createColoring.isPending}
        mode={mode}
        onModeChange={onModeChange}
      />
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2, pb: 4 }}>
      <MessageList
        messages={messages}
        isLoading={false}
        isPending={false}
      />
      <StoryImage
        imageUrl={image}
        isLoading={createColoring.isPending}
      />
    </Stack>
  );
}
