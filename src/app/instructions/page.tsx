"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Sidebar } from "~/app/_components/sidebar";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  CircularProgress,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

export default function InstructionsPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { data: instruction, isLoading } = api.instruction.get.useQuery();
  const upsertMutation = api.instruction.upsert.useMutation();
  const deleteMutation = api.instruction.delete.useMutation();

  useEffect(() => {
    if (instruction?.text) {
      setText(instruction.text);
    }
  }, [instruction]);

  const handleSave = async () => {
    if (!text.trim()) return;

    setIsSaving(true);
    try {
      await upsertMutation.mutateAsync({ text });
      await utils.instruction.get.invalidate();
      router.push("/");
    } catch (error) {
      console.error("Failed to save instructions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await deleteMutation.mutateAsync();
      await utils.instruction.get.invalidate();
      setText("");
      router.push("/");
    } catch (error) {
      console.error("Failed to delete instructions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Sidebar
        onSelectStory={(id) => {
          if (id === null) {
            router.push("/");
          } else {
            router.push(`/?story=${id}`);
          }
        }}
        selectedStoryId={null}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {isMobile && (
          <AppBar
            position="static"
            color="transparent"
            elevation={0}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setIsSidebarOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Custom Instructions
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box
          component="main"
          sx={{ flexGrow: 1, overflowY: "auto", p: { xs: 2, md: 4 } }}
        >
          <Container maxWidth="md">
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Custom Instructions
              </Typography>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 2, bgcolor: "background.paper" }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add custom instructions that the AI will consider when
                generating stories. These instructions will be applied to all
                future stories.
              </Typography>

              {isLoading ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                    }}
                  />
                  <Box
                    sx={{
                      width: "100%",
                      height: 48,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                    }}
                  />
                </Box>
              ) : (
                <>
                  <TextField
                    fullWidth
                    multiline
                    minRows={8}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g., Always include a friendly animal character, use simple language suitable for young children, etc."
                    variant="outlined"
                    sx={{ mb: 3 }}
                  />

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !text.trim()}
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      startIcon={
                        isSaving ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )
                      }
                    >
                      {isSaving ? "Saving..." : "Save Instructions"}
                    </Button>

                    {instruction && (
                      <IconButton
                        onClick={handleDelete}
                        disabled={isSaving}
                        color="error"
                        title="Delete instructions"
                        sx={{
                          borderRadius: 2,
                          border: 1,
                          borderColor: "divider",
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </>
              )}
            </Paper>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
