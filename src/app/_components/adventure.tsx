"use client";

import { Stack } from "@mui/material";
import { useCallback, useState } from "react";

import { api } from "~/trpc/react";

import { ChoiceButton } from "./shared/choice-button";
import { MessageLoadingSkeleton } from "./shared/loading-skeleton";
import { MessageInput } from "./shared/message-input";
import { MessageList } from "./shared/message-list";
import { StoryImage } from "./shared/story-image";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AdventureProps = {
  adventureId?: number;
  mode?: "story" | "adventure";
  onModeChange?: (mode: "story" | "adventure") => void;
};

export function Adventure({
  adventureId: initialAdventureId,
  mode,
  onModeChange,
}: AdventureProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [adventureId, setAdventureId] = useState<number | undefined>(
    initialAdventureId,
  );

  const [initialPrompt, setInitialPrompt] = useState("");
  const [choices, setChoices] = useState<string[]>([]);
  const [choiceType, setChoiceType] = useState<"story" | "image">("story");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const startAdventure = api.adventure.start.useMutation();
  const chatAdventure = api.adventure.chat.useMutation();

  const { data: existingAdventure } = api.adventure.getById.useQuery(
    { id: initialAdventureId! },
    { enabled: !!initialAdventureId },
  );

  // Load existing adventure if available
  if (existingAdventure && messages.length === 0) {
    const newMessages: Message[] = [];
    newMessages.push({
      id: `prompt-${existingAdventure.id}`,
      role: "user",
      content: existingAdventure.prompt,
    });

    existingAdventure.segments.forEach((segment) => {
      newMessages.push({
        id: `seg-${segment.id}`,
        role: "assistant",
        content: segment.text,
      });

      if (segment.choice) {
        newMessages.push({
          id: `choice-${segment.id}`,
          role: "user",
          content: segment.choice,
        });
      }
    });

    setMessages(newMessages);
    setAdventureId(existingAdventure.id);
    setGeneratedImage(existingAdventure.imageUrl);
  }

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
        let result;

        // Use state adventureId or prop adventureId
        const currentAdventureId = adventureId ?? initialAdventureId;

        if (!currentAdventureId) {
          result = await startAdventure.mutateAsync({
            prompt: currentPrompt,
          });
        } else {
          result = await chatAdventure.mutateAsync({
            adventureId: currentAdventureId,
            choice: userContent,
            choiceType: params.choiceType ?? "story",
          });
        }

        for await (const chunk of result) {
          if (chunk.type === "text") {
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
          } else if (chunk.type === "id") {
            setAdventureId(chunk.content);
          }
        }

        // Append the new segment to the list
      } catch (error) {
        console.error("Failed to generate adventure:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      startAdventure,
      chatAdventure,
      initialPrompt,
      isGenerating,
      adventureId,
      initialAdventureId,
    ],
  );

  const handleStart = (prompt: string) => {
    void handleInteract({ prompt });
  };

  const handleChoice = (choice: string) => {
    void handleInteract({ lastChoice: choice, choiceType });
  };

  if (messages.length === 0) {
    if (!!initialAdventureId && !existingAdventure) {
      return <MessageLoadingSkeleton />;
    }

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
