"use client";

import SendIcon from "@mui/icons-material/Send";
import {
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { ModeToggle } from "./mode-toggle";
import { VoiceRecorder } from "./voice-recorder";

type MessageInputProps = {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
  mode?: "story" | "adventure" | "coloring";
  onModeChange?: (mode: "story" | "adventure" | "coloring") => void;
};

export function MessageInput({
  onSubmit,
  isGenerating,
  mode,
  onModeChange,
}: MessageInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          width: "100%",
          borderRadius: 3,
        }}
      >
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" align="center" fontWeight="bold">
            Start Your{" "}
            {mode === "adventure"
              ? "Adventure"
              : mode === "coloring"
                ? "Coloring Page"
                : "Story"}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Tell me what kind of{" "}
            {mode === "adventure"
              ? "adventure"
              : mode === "coloring"
                ? "coloring page"
                : "story"}{" "}
            you would like to hear...
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Once upon a time..."
            variant="outlined"
            autoFocus
          />
          {onModeChange && mode && (
            <ModeToggle mode={mode} onChange={onModeChange} />
          )}
          <Stack direction="row" spacing={2}>
            <VoiceRecorder
              onTranscribe={(text) => setInput(text)}
              disabled={isGenerating}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isGenerating || !input.trim()}
              endIcon={
                isGenerating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon />
                )
              }
            >
              {isGenerating ? "Creating..." : "Create"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
