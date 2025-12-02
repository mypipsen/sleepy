"use client";

import { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

type StoryInputProps = {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
};

export function StoryInput({ onSubmit, isGenerating }: StoryInputProps) {
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
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" align="center" fontWeight="bold">
          Start Your Story
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          Tell me what kind of story you would like to hear...
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Once upon a time..."
            variant="outlined"
            sx={{ mb: 2 }}
            autoFocus
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
            {isGenerating ? "Creating..." : "Create Story"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
