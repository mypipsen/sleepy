"use client";

import { Box, Paper, CircularProgress, Typography } from "@mui/material";

type StoryImageProps = {
    imageUrl: string | null;
    isLoading: boolean;
};

export function StoryImage({ imageUrl, isLoading }: StoryImageProps) {
    if (!imageUrl && !isLoading) {
        return null;
    }

    return (
        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    maxWidth: "85%",
                    borderRadius: 2,
                    bgcolor: "action.hover",
                }}
            >
                {isLoading ? (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <CircularProgress size={20} />
                        <Typography>Generating image...</Typography>
                    </Box>
                ) : (
                    <Box
                        component="img"
                        src={
                            imageUrl?.startsWith("http")
                                ? imageUrl
                                : `data:image/png;base64,${imageUrl}`
                        }
                        alt="Generated story illustration"
                        sx={{
                            width: "100%",
                            borderRadius: 1,
                            height: "auto",
                        }}
                    />
                )}
            </Paper>
        </Box>
    );
}
