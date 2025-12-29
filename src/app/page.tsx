"use client";

import { Stack } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useState } from "react";

import { Adventure } from "~/app/_components/adventure";
import { Coloring } from "~/app/_components/coloring";
import { AppHeader } from "~/app/_components/shared/app-header";
import { Sidebar } from "~/app/_components/sidebar";
import { Story } from "~/app/_components/story";
import { UnauthenticatedView } from "~/app/_components/unauthenticated-view";

function HomeContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"story" | "adventure" | "coloring">("story");

  const storyIdParam = searchParams.get("story");
  const selectedStoryId = storyIdParam ? parseInt(storyIdParam, 10) : null;

  const adventureIdParam = searchParams.get("adventure");
  const selectedAdventureId = adventureIdParam
    ? parseInt(adventureIdParam, 10)
    : undefined;

  // Switch to story mode if a story is selected
  if (selectedStoryId && mode !== "story") {
    setMode("story");
  }

  // Switch to adventure mode if an adventure is selected
  if (selectedAdventureId && mode !== "adventure") {
    setMode("adventure");
  }

  if (!session) {
    return <UnauthenticatedView />;
  }

  return (
    <Stack
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        maxWidth: "800px",
        mx: "auto",
      }}
    >
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />

      <Stack component="main">
        {mode === "story" ? (
          <Story
            storyId={selectedStoryId}
            mode={mode}
            onModeChange={(_mode) => {
              if (_mode !== "story") {
                setMode(_mode);
                router.push("/");
              }
            }}
          />
        ) : mode === "adventure" ? (
          <Adventure
            adventureId={selectedAdventureId}
            mode={mode}
            onModeChange={(_mode) => {
              if (_mode !== "adventure") {
                setMode(_mode);
              }
            }}
          />
        ) : (
          <Coloring
            mode={mode}
            onModeChange={(_mode) => {
              if (_mode !== "coloring") {
                setMode(_mode);
              }
            }}
          />
        )}
      </Stack>
    </Stack>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
