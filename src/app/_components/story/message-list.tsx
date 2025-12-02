"use client";

import { Box, Paper, Typography } from "@mui/material";
import { Message } from "./message";
import { MessageLoadingSkeleton } from "../shared/loading-skeleton";

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
    if (isLoading) {
        return <MessageLoadingSkeleton />;
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {messages.map((msg) => (
                <Message
                    key={msg.id}
                    message={msg}
                    title={msg.role === "assistant" ? title : undefined}
                />
            ))}

            {isPending && messages[messages.length - 1]?.role === "user" && (
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "action.hover",
                        }}
                    >
                        <Typography className="animate-pulse">Thinking...</Typography>
                    </Paper>
                </Box>
            )}
        </Box>
    );
}
