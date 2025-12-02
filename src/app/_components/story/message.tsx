"use client";

import { Box, Paper, Typography } from "@mui/material";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

type MessageProps = {
    message: Message;
};

export function Message({ message }: MessageProps) {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: message.role === "user" ? "flex-end" : "flex-start",
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    maxWidth: "85%",
                    borderRadius: 2,
                    bgcolor: message.role === "user" ? "primary.main" : "action.hover",
                    color:
                        message.role === "user" ? "primary.contrastText" : "text.primary",
                }}
            >
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {message.content}
                </Typography>
            </Paper>
        </Box>
    );
}
