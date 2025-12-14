"use client";

import { Stack } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useState } from "react";

import { Adventure } from "~/app/_components/adventure";
import { AppHeader } from "~/app/_components/shared/app-header";
import { Sidebar } from "~/app/_components/sidebar";
import { Story } from "~/app/_components/story";
import { UnauthenticatedView } from "~/app/_components/unauthenticated-view";

function HomeContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"story" | "adventure">("story");

  const storyIdParam = searchParams.get("story");
  const selectedStoryId = storyIdParam ? parseInt(storyIdParam, 10) : null;

  // Switch to story mode if a story is selected
  if (selectedStoryId && mode !== "story") {
    setMode("story");
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
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

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
        ) : (
          <Adventure
            mode={mode}
            onModeChange={(_mode) => {
              if (_mode !== "adventure") {
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
