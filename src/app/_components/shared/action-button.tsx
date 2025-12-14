"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import { Button } from "@mui/material";

type ActionButtonProps = {
  onClick: () => void;
  icon: SvgIconComponent;
  label: string;
  fullWidth?: boolean;
  variant?: "text" | "outlined" | "contained";
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
};

export function ActionButton({
  onClick,
  icon: Icon,
  label,
  fullWidth = true,
  variant = "text",
  color = "inherit",
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      startIcon={<Icon />}
      fullWidth={fullWidth}
      variant={variant}
      color={color}
      sx={{ justifyContent: "flex-start" }}
    >
      {label}
    </Button>
  );
}
