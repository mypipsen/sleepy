"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Container,
  Skeleton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function Story({
  storyId,
  onSelectStory,
}: {
  storyId: number | null;
  onSelectStory: (id: number | null) => void;
}) {
  const utils = api.useUtils();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWaitingForImage, setIsWaitingForImage] = useState(false);

  const createStory = api.story.create.useMutation();
  const { data: existingStory, isLoading } = api.story.getById.useQuery(
    { id: storyId! },
    { enabled: !!storyId },
  );

  // Load existing story
  useEffect(() => {
    if (storyId && existingStory) {
      setMessages([
        { id: "prompt", role: "user", content: existingStory.prompt ?? "" },
        {
          id: "response",
          role: "assistant",
          content: existingStory.text ?? "",
        },
      ]);
      setGeneratedImage(existingStory.imageUrl ?? null);
    } else if (!storyId) {
      setMessages([]);
      setGeneratedImage(null);
    }
  }, [storyId, existingStory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    // Clear previous messages and start new conversation
    const assistantMessageId = crypto.randomUUID();
    setMessages([
      userMessage,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);
    setInput("");
    setGeneratedImage(null);
    setIsGenerating(true);
    setIsWaitingForImage(false);

    try {
      const result = await createStory.mutateAsync({
        prompt: userMessage.content,
      });

      for await (const chunk of result) {
        if (chunk.type === "text") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk.content }
                : msg,
            ),
          );
        } else if (chunk.type === "storyId") {
          setIsWaitingForImage(true);
        } else if (chunk.type === "image") {
          setGeneratedImage(chunk.content);
          setIsWaitingForImage(false);
        }
      }

      // Refresh the sidebar history
      await utils.story.getAll.invalidate();
    } catch (error) {
      console.error("Failed to generate story:", error);
    } finally {
      setIsGenerating(false);
      setIsWaitingForImage(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {!storyId && messages.length === 0 ? (
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
      ) : (
        <Box sx={{ p: 2 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Skeleton
                variant="rounded"
                height={40}
                sx={{ alignSelf: "flex-end", width: "70%" }}
              />
              <Skeleton
                variant="rounded"
                height={120}
                sx={{ alignSelf: "flex-start", width: "70%" }}
              />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: "85%",
                      borderRadius: 2,
                      bgcolor:
                        msg.role === "user" ? "primary.main" : "action.hover",
                      color:
                        msg.role === "user"
                          ? "primary.contrastText"
                          : "text.primary",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: "pre-wrap" }}
                    >
                      {msg.content}
                    </Typography>
                  </Paper>
                </Box>
              ))}

              {/* Display generated image */}
              {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (generatedImage || isWaitingForImage) && (
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
                      {isWaitingForImage ? (
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
                            generatedImage?.startsWith("http")
                              ? generatedImage
                              : `data:image/png;base64,${generatedImage}`
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
                )
              }

              {createStory.isPending &&
                messages[messages.length - 1]?.role === "user" && (
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                      }}
                    >
                      <Typography className="animate-pulse">
                        Thinking...
                      </Typography>
                    </Paper>
                  </Box>
                )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
