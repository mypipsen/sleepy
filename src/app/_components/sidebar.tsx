"use client";

import { useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Drawer, Toolbar, Divider, Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";
import { StoryList } from "./sidebar/story-list";
import { UserProfile } from "./sidebar/user-profile";
import { DeleteDialog } from "./sidebar/delete-dialog";

const drawerWidth = 280;

type SidebarProps = {
  onSelectStory: (id: number | null) => void;
  selectedStoryId: number | null;
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({
  onSelectStory,
  selectedStoryId,
  isOpen,
  onClose,
}: SidebarProps) {
  const utils = api.useUtils();
  const { data: stories, isLoading } = api.story.getAll.useQuery();
  const { data: session } = useSession();
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<number | null>(null);

  const deleteStory = api.story.delete.useMutation({
    onSuccess: async () => {
      await utils.story.getAll.invalidate();
      if (selectedStoryId === storyToDelete) {
        onSelectStory(null);
      }
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
    },
  });

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  const handleInstructions = useCallback(() => {
    router.push("/instructions");
    onClose();
  }, [router, onClose]);

  const handleDeleteClick = useCallback((id: number) => {
    setStoryToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleSelectStory = useCallback(
    (id: number) => {
      onSelectStory(id);
      onClose();
    },
    [onSelectStory, onClose],
  );

  const confirmDelete = useCallback(() => {
    if (storyToDelete) {
      deleteStory.mutate({ id: storyToDelete });
    }
  }, [storyToDelete, deleteStory]);

  return (
    <>
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Toolbar sx={{ px: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => {
                onSelectStory(null);
                onClose();
              }}
            >
              New Story
            </Button>
          </Toolbar>
          <Divider />
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            <StoryList
              stories={stories}
              selectedId={selectedStoryId}
              onSelect={handleSelectStory}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
            />
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <UserProfile user={session?.user} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                onClick={handleInstructions}
                startIcon={<InfoIcon />}
                fullWidth
                sx={{ justifyContent: "flex-start" }}
              >
                Instructions
              </Button>
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                fullWidth
                sx={{ justifyContent: "flex-start" }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
