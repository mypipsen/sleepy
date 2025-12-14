"use client";

import { Paper, Stack } from "@mui/material";
import { Message } from "./message";
import { MessageLoadingSkeleton } from "./loading-skeleton";
import { LoadingIndicator } from "./loading-indicator";

type MessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type MessageListProps = {
  messages: MessageType[];
  title?: string;
  isLoading: boolean;
  isPending: boolean;
};

export function MessageList({
  messages,
  title,
  isLoading,
  isPending,
}: MessageListProps) {
  if (isLoading && messages.length === 0) {
    return <MessageLoadingSkeleton />;
  }

  return (
    <Stack spacing={2}>
      {messages.map((msg) => (
        <Message
          key={msg.id}
          message={msg}
          title={msg.role === "assistant" ? title : undefined}
        />
      ))}

      {isPending && messages[messages.length - 1]?.role === "user" && (
        <Stack direction="row" justifyContent="flex-start">
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "action.hover",
            }}
          >
            <LoadingIndicator message="Thinking..." size={20} />
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}
