"use client";

import { Box, Container, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppHeader } from "~/app/_components/shared/app-header";
import { FormLoadingSkeleton } from "~/app/_components/shared/loading-skeleton";
import { Sidebar } from "~/app/_components/sidebar";
import { api } from "~/trpc/react";

import { InstructionsForm } from "./instructions-form";

export default function InstructionsPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: instruction, isLoading } = api.instruction.get.useQuery();
  const upsertMutation = api.instruction.upsert.useMutation();
  const deleteMutation = api.instruction.delete.useMutation();

  const handleSave = async (text: string, imageText: string) => {
    await upsertMutation.mutateAsync({ text, imageText });
    await utils.instruction.get.invalidate();
    router.push("/");
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
    await utils.instruction.get.invalidate();
    router.push("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        maxWidth: "600px",
        mx: "auto",
      }}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />

      <Box component="main" sx={{ p: 2, pb: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Custom Instructions
            </Typography>
          </Box>

          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add custom instructions that the AI will consider when generating
              stories. These instructions will be applied to all future stories.
            </Typography>

            {isLoading ? (
              <FormLoadingSkeleton />
            ) : (
              <InstructionsForm
                instruction={instruction}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
