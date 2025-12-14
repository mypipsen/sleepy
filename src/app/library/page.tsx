"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

import { AppHeader } from "../_components/shared/app-header";
import { DeleteDialog } from "../_components/shared/delete-dialog";
import { Sidebar } from "../_components/sidebar";

export default function LibraryPage() {
  const theme = useTheme();
  const utils = api.useUtils();
  const { data: stories, isLoading } = api.story.getAll.useQuery();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<number | null>(null);

  const router = useRouter(); // Initialize router

  const deleteStory = api.story.delete.useMutation({
    onSuccess: async () => {
      await utils.story.getAll.invalidate();
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
    },
  });

  const handleDeleteClick = (id: number) => {
    setStoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (storyToDelete) {
      deleteStory.mutate({ id: storyToDelete });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        maxWidth: "800px", // Matching home page max width
        mx: "auto",
      }}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <AppHeader onMenuClick={() => setSidebarOpen(true)} />

      <Box component="main" sx={{ p: 2, pb: 4 }}>
        <Container maxWidth="md" disableGutters>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 4 }}
          >
            Your Library
          </Typography>

          {isLoading ? (
            <Typography>Loading library...</Typography>
          ) : (
            <Grid container spacing={3}>
              {stories?.map((story) => (
                <Grid size={{ xs: 6 }} key={story.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[4],
                      },
                      position: "relative", // For absolute positioning of delete button
                    }}
                  >
                    <CardActionArea
                      onClick={() => router.push(`/?story=${story.id}`)}
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        height: "100%",
                      }}
                    >
                      {story.imageUrl && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={story.imageUrl}
                          alt={story.title ?? "Story image"}
                          sx={{ objectFit: "cover", width: "100%" }}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1, width: "100%" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="h2"
                            sx={{ lineHeight: 1.3, fontWeight: "bold" }}
                          >
                            {story.title ?? "Untitled Story"}
                          </Typography>
                        </Box>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          gutterBottom
                        >
                          {story.createdAt.toLocaleDateString()}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mb: 2,
                          }}
                        >
                          {story.text}
                        </Typography>
                      </CardContent>
                    </CardActionArea>

                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleDeleteClick(story.id);
                      }}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "rgba(255, 255, 255, 0.8)",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(4px)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          color: theme.palette.error.main,
                        },
                        zIndex: 1, // Ensure it's above CardActionArea
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
              {stories?.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                  >
                    No stories found. Create one to see it here!
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}

          <DeleteDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={confirmDelete}
          />
        </Container>
      </Box>
    </Box>
  );
}
