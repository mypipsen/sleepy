"use client";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

type ModeToggleProps = {
  mode: "story" | "adventure" | "coloring";
  onChange: (mode: "story" | "adventure" | "coloring") => void;
  disabled?: boolean;
};

export function ModeToggle({ mode, onChange, disabled }: ModeToggleProps) {
  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={(_, newMode) => {
        if (newMode) onChange(newMode as "story" | "adventure" | "coloring");
      }}
      aria-label="story mode"
      size="small"
      fullWidth
      disabled={disabled}
    >
      <ToggleButton value="story" aria-label="story">
        Story
      </ToggleButton>
      <ToggleButton value="adventure" aria-label="adventure">
        Adventure
      </ToggleButton>
      <ToggleButton value="coloring" aria-label="coloring">
        Coloring
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
