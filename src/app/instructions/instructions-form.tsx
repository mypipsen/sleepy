"use client";

import { useState, useEffect } from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";

type Instruction = {
  id: number;
  text: string | null;
  imageText: string | null;
};

type InstructionsFormProps = {
  instruction: Instruction | null | undefined;
  isLoading: boolean;
  onSave: (text: string, imageText: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function InstructionsForm({
  instruction,
  isLoading,
  onSave,
  onDelete,
}: InstructionsFormProps) {
  const [text, setText] = useState("");
  const [imageText, setImageText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setText(instruction?.text ?? "");
    setImageText(instruction?.imageText ?? "");
  }, [instruction]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(text, imageText);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await onDelete();
      setText("");
      setImageText("");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return null; // Loading handled by parent
  }

  return (
    <>
      <TextField
        fullWidth
        multiline
        minRows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g., Always include a friendly animal character, use simple language suitable for young children, etc."
        variant="outlined"
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        multiline
        minRows={8}
        value={imageText}
        onChange={(e) => setImageText(e.target.value)}
        placeholder="e.g., Kids listening to the story are ages 5 and 3 with light brown hair."
        variant="outlined"
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          onClick={handleSave}
          disabled={isSaving || !text.trim()}
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={
            isSaving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
        >
          {isSaving ? "Saving..." : "Save Instructions"}
        </Button>

        {instruction && (
          <IconButton
            onClick={handleDelete}
            disabled={isSaving}
            color="error"
            title="Delete instructions"
            sx={{
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    </>
  );
}
