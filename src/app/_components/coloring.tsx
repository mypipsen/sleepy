"use client";

import { Print as PrintIcon } from "@mui/icons-material";
import { Box, Button, GlobalStyles, Stack } from "@mui/material";
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
      <GlobalStyles
        styles={{
          "@media print": {
            "body *": {
              visibility: "hidden",
            },
            "#printable-area, #printable-area *": {
              visibility: "visible",
            },
            "#printable-area": {
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              margin: 0,
              padding: 0,
            },
            "#printable-area .MuiPaper-root": {
              boxShadow: "none !important",
              background: "none !important",
              maxWidth: "100% !important",
            },
          },
        }}
      />
      <MessageList
        messages={messages}
        isLoading={false}
        isPending={false}
      />
      <Box id="printable-area">
        <StoryImage
          imageUrl={image}
          isLoading={createColoring.isPending}
          variant="fun"
        />
      </Box>
      {image && !createColoring.isPending && (
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          sx={{ alignSelf: "flex-start" }}
        >
          Print
        </Button>
      )}
    </Stack>
  );
}
