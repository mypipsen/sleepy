"use client";

import { Stack } from "@mui/material";
import { useCallback, useState } from "react";

import { api } from "~/trpc/react";

import { ChoiceButton } from "./shared/choice-button";
import { MessageInput } from "./shared/message-input";
import { MessageList } from "./shared/message-list";
import { StoryImage } from "./shared/story-image";

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
  const [choiceType, setChoiceType] = useState<"story" | "image">("story");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const createAdventure = api.adventure.create.useMutation();

  const handleInteract = useCallback(
    async (params: {
      prompt?: string;
      lastChoice?: string;
      choiceType?: "story" | "image";
    }) => {
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
          choiceType: params.choiceType ?? "story",
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
            if (chunk.choiceType) {
              setChoiceType(chunk.choiceType);
            }
          } else if (chunk.type === "image") {
            setGeneratedImage(chunk.content);
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
    void handleInteract({ lastChoice: choice, choiceType });
  };

  if (messages.length === 0) {
    return (
      <MessageInput
        onSubmit={handleStart}
        isGenerating={isGenerating}
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
        isPending={isGenerating}
      />

      <StoryImage
        imageUrl={generatedImage}
        isLoading={isGenerating && choiceType === "image"}
      />

      {!isGenerating && !generatedImage && choices.length > 0 && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {choices.map((choice, index) => (
            <ChoiceButton
              key={index}
              choice={choice}
              onClick={() => handleChoice(choice)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
