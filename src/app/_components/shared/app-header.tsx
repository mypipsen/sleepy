"use client";

import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";

type AppHeaderProps = {
  onMenuClick: () => void;
  onLogoClick: () => void;
};

export function AppHeader({ onMenuClick, onLogoClick }: AppHeaderProps) {
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
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={onLogoClick}
        >
          Sleepy
        </Typography>
        <Box
          component="img"
          src="logo.png"
          onClick={onLogoClick}
          sx={{
            width: "45px",
            height: "auto",
            cursor: "pointer",
          }}
        />
      </Toolbar>
    </AppBar>
  );
}
