"use client";

import { Paper, Stack } from "@mui/material";

import { FunLoader } from "../shared/fun-loader";
import { LoadingIndicator } from "../shared/loading-indicator";

type StoryImageProps = {
  imageUrl: string | null;
  isLoading: boolean;
  variant?: "standard" | "fun";
};

export function StoryImage({
  imageUrl,
  isLoading,
  variant = "standard",
}: StoryImageProps) {
  if (!imageUrl && !isLoading) {
    return null;
  }

  return (
    <Stack direction="row" justifyContent="flex-start">
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
          variant === "fun" ? (
            <FunLoader />
          ) : (
            <LoadingIndicator message="Generating image..." size={20} />
          )
        ) : typeof imageUrl === "string" ? (
          <Stack
            component="img"
            src={imageUrl}
            alt="Generated story illustration"
            sx={{
              width: "100%",
              borderRadius: 1,
              height: "auto",
            }}
          />
        ) : null}
      </Paper>
    </Stack>
  );
}
