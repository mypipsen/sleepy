"use client";

import { Box, Avatar, Typography } from "@mui/material";

type User = {
    name?: string | null;
    email?: string | null;
};

type UserProfileProps = {
    user: User | undefined;
};

export function UserProfile({ user }: UserProfileProps) {
    const displayName = user?.name ?? user?.email ?? "User";
    const avatarLetter =
        user?.name?.[0]?.toUpperCase() ??
        user?.email?.[0]?.toUpperCase() ??
        "U";

    return (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                {avatarLetter}
            </Avatar>
            <Box sx={{ overflow: "hidden" }}>
                <Typography variant="subtitle2" noWrap>
                    {displayName}
                </Typography>
                {user?.name && user?.email && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        display="block"
                    >
                        {user.email}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
