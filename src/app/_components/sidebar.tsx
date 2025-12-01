"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Divider,
  Box,
  Typography,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";

const drawerWidth = 280;

interface SidebarProps {
  onSelectStory: (id: number | null) => void;
  selectedStoryId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleInstructions = () => {
    router.push("/instructions");
    if (isMobile) onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setStoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (storyToDelete) {
      deleteStory.mutate({ id: storyToDelete });
    }
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ px: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<AddIcon />}
          onClick={() => {
            onSelectStory(null);
            if (isMobile) onClose();
          }}
        >
          New Story
        </Button>
      </Toolbar>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {isLoading ? (
          <Typography
            sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
          >
            Loading...
          </Typography>
        ) : (
          <List>
            {stories?.map((story) => (
              <ListItem
                key={story.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => handleDeleteClick(e, story.id)}
                    size="small"
                    sx={{
                      opacity: 0.6,
                      "&:hover": { opacity: 1, color: "error.main" },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={selectedStoryId === story.id}
                  onClick={() => {
                    onSelectStory(story.id);
                    if (isMobile) onClose();
                  }}
                  sx={{ pr: 6 }} // Make room for secondary action
                >
                  <ListItemText
                    primary={story.prompt}
                    secondary={new Date(story.createdAt).toLocaleDateString()}
                    primaryTypographyProps={{
                      noWrap: true,
                      variant: "body2",
                      fontWeight:
                        selectedStoryId === story.id ? "bold" : "medium",
                    }}
                    secondaryTypographyProps={{
                      noWrap: true,
                      variant: "caption",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
            {session?.user?.name?.[0]?.toUpperCase() ??
              session?.user?.email?.[0]?.toUpperCase() ??
              "U"}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="subtitle2" noWrap>
              {session?.user?.name ?? session?.user?.email ?? "User"}
            </Typography>
            {session?.user?.name && session?.user?.email && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                display="block"
              >
                {session.user.email}
              </Typography>
            )}
          </Box>
        </Box>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleInstructions}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <InfoIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Instructions" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete this story?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this story? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
