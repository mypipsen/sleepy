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

export function SidebarSkeleton() {
  return (
    <Box sx={{ p: 0 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="40%" height={16} />
        </Box>
      ))}
    </Box>
  );
}

export function LibrarySkeleton() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton variant="text" height={32} width="80%" />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} width="60%" />
        </Box>
      ))}
    </Box>
  );
}
