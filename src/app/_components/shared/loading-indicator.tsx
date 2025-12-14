"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

type LoadingIndicatorProps = {
  message?: string;
  size?: number;
};

export function LoadingIndicator({
  message = "Loading...",
  size = 20,
}: LoadingIndicatorProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      <Typography>{message}</Typography>
    </Box>
  );
}
