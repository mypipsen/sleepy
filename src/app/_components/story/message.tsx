"use client";

import { Box, Paper, Typography } from "@mui/material";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

type MessageProps = {
    message: Message;
    title?: string;
};

export function Message({ message, title }: MessageProps) {
    const isAssistant = message.role === "assistant";

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isAssistant ? "flex-start" : "flex-end",
                width: "100%",
            }}
        >
            {isAssistant && title && (
                <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                        fontWeight: "bold",
                        mb: 1,
                        color: "text.primary",
                    }}
                >
                    {title}
                </Typography>
            )}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    maxWidth: isAssistant ? "100%" : "85%",
                    width: isAssistant ? "100%" : "auto",
                    borderRadius: 2,
                    bgcolor: isAssistant ? "action.hover" : "primary.main",
                    color: isAssistant ? "text.primary" : "primary.contrastText",
                }}
            >
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {message.content}
                </Typography>
            </Paper>
        </Box>
    );
}
