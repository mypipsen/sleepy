"use client";

import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

type AppHeaderProps = {
    title: string;
    onMenuClick: () => void;
};

export function AppHeader({ title, onMenuClick }: AppHeaderProps) {
    return (
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
                    onClick={onMenuClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}
