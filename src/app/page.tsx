"use client";

import { useState, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box } from "@mui/material";

import { Story } from "~/app/_components/story";
import { Sidebar } from "~/app/_components/sidebar";
import { UnauthenticatedView } from "~/app/_components/unauthenticated-view";
import { AppHeader } from "~/app/_components/shared/app-header";

function HomeContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const storyIdParam = searchParams.get("story");
  const selectedStoryId = storyIdParam ? parseInt(storyIdParam, 10) : null;

  const handleSelectStory = useCallback(
    (id: number | null) => {
      if (id) {
        router.push(`/?story=${id}`);
      } else {
        router.push("/");
      }
      setIsSidebarOpen(false);
    },
    [router],
  );

  if (!session) {
    return <UnauthenticatedView />;
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

      <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />

      <Box component="main">
        <Story storyId={selectedStoryId} />
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
