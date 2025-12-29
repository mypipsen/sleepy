"use client";

import AddIcon from "@mui/icons-material/Add";
import CollectionsIcon from "@mui/icons-material/Collections";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Button,
  Divider,
  Drawer,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback } from "react";

import { api } from "~/trpc/react";

import { ActionButton } from "./shared/action-button";
import { StoryList } from "./sidebar/story-list";
import { UserProfile } from "./sidebar/user-profile";

const drawerWidth = 280;

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onNewStoryClick: () => void;
};

export function Sidebar({ isOpen, onClose, onNewStoryClick }: SidebarProps) {
  const { data: session } = useSession();
  const { data: recentStories, isLoading: contentLoading } =
    api.story.getAll.useQuery({
      limit: 5,
    });
  const { data: recentAdventures, isLoading: adventuresLoading } =
    api.adventure.getAll.useQuery({
      limit: 5,
    });

  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  const handleInstructions = useCallback(() => {
    router.push("/instructions");
    onClose();
  }, [router, onClose]);

  const handleLibrary = useCallback(() => {
    router.push("/library");
    onClose();
  }, [router, onClose]);

  const handleNewStory = useCallback(() => {
    onNewStoryClick();
    onClose();
  }, [onNewStoryClick, onClose]);

  const handleStorySelect = useCallback(
    (id: number, type: "story" | "adventure") => {
      if (type === "story") {
        router.push(`/?story=${id}`);
      } else {
        router.push(`/?adventure=${id}`);
      }
      onClose();
    },
    [router, onClose],
  );

  const combinedItems = [
    ...(recentStories?.map((s) => ({ ...s, type: "story" as const })) ?? []),
    ...(recentAdventures?.map((a) => ({ ...a, type: "adventure" as const })) ??
      []),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
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
      <Stack sx={{ height: "100%" }}>
        <Toolbar sx={{ px: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleNewStory}
          >
            New Story
          </Button>
        </Toolbar>
        <Divider />
        <Stack sx={{ p: 2, gap: 1 }}>
          <ActionButton
            onClick={handleLibrary}
            icon={CollectionsIcon}
            label="Library"
          />
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1, overflow: "auto" }}>
          <Typography
            variant="overline"
            sx={{
              px: 2,
              mt: 2,
              mb: 1,
              display: "block",
              color: "text.secondary",
            }}
          >
            Recent
          </Typography>
          <StoryList
            stories={combinedItems}
            onSelect={handleStorySelect}
            isLoading={contentLoading || adventuresLoading}
          />
        </Stack>
        <Divider />
        <Stack spacing={2} sx={{ p: 2 }}>
          <UserProfile user={session?.user} />
          <Stack spacing={1}>
            <ActionButton
              onClick={handleInstructions}
              icon={InfoIcon}
              label="Instructions"
            />
            <ActionButton
              onClick={handleLogout}
              icon={LogoutIcon}
              label="Logout"
            />
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}
