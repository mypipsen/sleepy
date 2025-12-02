"use client";

import { Box, Skeleton } from "@mui/material";

export function MessageLoadingSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Skeleton
        variant="rounded"
        height={40}
        sx={{ alignSelf: "flex-end", width: "70%" }}
      />
      <Skeleton
        variant="rounded"
        height={120}
        sx={{ alignSelf: "flex-start", width: "70%" }}
      />
    </Box>
  );
}

export function FormLoadingSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Skeleton variant="rounded" height={240} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
    </Box>
  );
}
