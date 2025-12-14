"use client";

import { Button } from "@mui/material";

type ChoiceButtonProps = {
  choice: string;
  onClick: () => void;
  disabled?: boolean;
};

export function ChoiceButton({ choice, onClick, disabled }: ChoiceButtonProps) {
  return (
    <Button
      variant="outlined"
      size="large"
      onClick={onClick}
      disabled={disabled}
      sx={{
        justifyContent: "flex-start",
        textAlign: "left",
        p: 3,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "divider",
        transition: "all 0.2s",
        textTransform: "none",
        fontSize: "1.1rem",
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.paper",
        color: "text.primary",
        "&:hover": {
          borderWidth: 1,
          borderColor: "primary.main",
          bgcolor: "primary.50",
          transform: "translateY(-2px)",
          boxShadow: 2,
        },
        "&:active": {
          transform: "translateY(0)",
          boxShadow: 1,
        },
      }}
    >
      {choice}
    </Button>
  );
}
