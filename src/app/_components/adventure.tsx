"use client";

import { useState, useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";
import { api } from "~/trpc/react";
import { StoryInput } from "./story/story-input";
import { MessageList } from "./story/message-list";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AdventureProps = {
  mode?: "story" | "adventure";
  onModeChange?: (mode: "story" | "adventure") => void;
};

export function Adventure({ mode, onModeChange }: AdventureProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [adventureSegments, setAdventureSegments] = useState<string[]>([]);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [choices, setChoices] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const createAdventure = api.adventure.create.useMutation();

  const handleInteract = useCallback(
    async (params: { prompt?: string; lastChoice?: string }) => {
      if (isGenerating) return;
      setIsGenerating(true);
      setChoices([]);

      const currentPrompt = params.prompt ?? initialPrompt;
      if (params.prompt) {
        setInitialPrompt(params.prompt);
      }

      const userContent = params.prompt ?? params.lastChoice ?? "";
      const userMessageId = crypto.randomUUID();
      const assistantMessageId = crypto.randomUUID();

      // Add user message immediately
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: "user", content: userContent },
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      try {
        const result = await createAdventure.mutateAsync({
          prompt: currentPrompt,
          adventureSegments, // Send accumulated segments
          lastChoice: params.lastChoice,
        });

        let currentSegment = "";

        for await (const chunk of result) {
          if (chunk.type === "text") {
            currentSegment += chunk.content;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + chunk.content }
                  : msg,
              ),
            );
          } else if (chunk.type === "choices") {
            setChoices(
              chunk.content.filter(
                (c): c is string => c !== undefined && c !== null,
              ),
            );
          }
        }

        // Append the new segment to the list
        setAdventureSegments((prev) => [...prev, currentSegment]);
      } catch (error) {
        console.error("Failed to generate adventure:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    [createAdventure, adventureSegments, initialPrompt, isGenerating],
  );

  const handleStart = (prompt: string) => {
    void handleInteract({ prompt });
  };

  const handleChoice = (choice: string) => {
    void handleInteract({ lastChoice: choice });
  };

  if (messages.length === 0) {
    return (
      <StoryInput
        onSubmit={handleStart}
        isGenerating={isGenerating}
        mode={mode}
        onModeChange={onModeChange}
      />
    );
  }

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      <MessageList
        messages={messages}
        isLoading={false} // Adventure doesn't load from DB initially in this version
        isPending={isGenerating}
      />

      {!isGenerating && choices.length > 0 && (
        <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6" align="center" gutterBottom>
            What do you do?
          </Typography>
          {choices.map((choice, index) => (
            <Button
              key={index}
              variant="outlined"
              size="large"
              onClick={() => handleChoice(choice)}
              sx={{
                justifyContent: "flex-start",
                textAlign: "left",
                p: 3,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "divider",
                transition: "all 0.2s",
                textTransform: "none",
                fontSize: "1.1rem",
                position: "relative",
                overflow: "hidden",
                bgcolor: "background.paper",
                color: "text.primary",
                "&:hover": {
                  borderWidth: 1,
                  borderColor: "primary.main",
                  bgcolor: "primary.50", // Light background on hover
                  transform: "translateY(-2px)",
                  boxShadow: 2,
                },
                "&:active": {
                  transform: "translateY(0)",
                  boxShadow: 1,
                },
              }}
            >
              {choice}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}
