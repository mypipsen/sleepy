"use client";

import { useState, useRef, useEffect } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  const createStory = api.story.create.useMutation();
  const { data: existingStory, isLoading } = api.story.getById.useQuery(
    { id: storyId! },
    { enabled: !!storyId },
  );

  // Load existing story
  useEffect(() => {
    if (storyId && existingStory) {
      shouldScrollRef.current = false;
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && shouldScrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, generatedImage, createStory.isPending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    shouldScrollRef.current = true;
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
          // storyId = chunk.content;
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
      // Optionally handle error state in UI
    } finally {
      setIsGenerating(false);
      setIsWaitingForImage(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
        borderRadius: { md: 2 },
        overflow: "hidden",
      }}
    >
      {storyId && (
        <Box
          sx={{
            display: "none", // Hidden as per request
          }}
        />
      )}

      {!storyId && messages.length === 0 ? (
        <Container
          maxWidth="sm"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderRadius: 4,
            }}
          >
            <Typography variant="h4" align="center" fontWeight="bold">
              Start Your Story
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary">
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
        <>
          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
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
              <>
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
                        maxWidth: "80%",
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
                          maxWidth: "80%",
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
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
