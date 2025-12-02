"use client";

import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";

export function UnauthenticatedView() {
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
