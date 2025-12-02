"use client";

import { Box, Paper, Typography, LinearProgress } from "@mui/material";

type StoryVideoProps = {
  videoUrl: string | null;
  progress: number | null;
};

export function StoryVideo({ videoUrl, progress }: StoryVideoProps) {
  if (!videoUrl && progress === null) {
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
          width: "100%",
        }}
      >
        {progress !== null && !videoUrl ? (
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Generating video...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        ) : videoUrl ? (
          <Box
            component="video"
            controls
            src={videoUrl}
            sx={{
              width: "100%",
              borderRadius: 1,
              height: "auto",
            }}
          />
        ) : null}
      </Paper>
    </Box>
  );
}
