"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { Story } from "~/app/_components/story";
import { Sidebar } from "~/app/_components/sidebar";

function HomeContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const storyIdParam = searchParams.get("story");
  const selectedStoryId = storyIdParam ? parseInt(storyIdParam, 10) : null;

  const handleSelectStory = (id: number | null) => {
    if (id) {
      router.push(`/?story=${id}`);
    } else {
      router.push("/");
    }
    setIsSidebarOpen(false);
  };

  if (!session) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom, #2e026d, #15162c)",
          color: "white",
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Typography
            variant="h1"
            fontWeight="800"
            sx={{ fontSize: "3rem" }}
          >
            sl
            <Box component="span" sx={{ color: "secondary.main" }}>
              ee
            </Box>
            py
          </Typography>
          <Button
            component={Link}
            href="/api/auth/signin"
            variant="contained"
            color="secondary"
            size="large"
            sx={{ borderRadius: 50, px: 5, py: 1.5, fontWeight: "bold" }}
          >
            Sign in
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        maxWidth: "800px",
        mx: "auto",
      }}
    >
      <Sidebar
        onSelectStory={handleSelectStory}
        selectedStoryId={selectedStoryId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          top: 0,
          bgcolor: "background.default",
          zIndex: 10,
        }}
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
            Sleepy
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="main">
        <Story storyId={selectedStoryId} onSelectStory={handleSelectStory} />
      </Box>
    </Box>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
