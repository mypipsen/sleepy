"use client";

import { ListItem, ListItemButton, ListItemText, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

type Story = {
    id: number;
    prompt: string | null;
    createdAt: Date;
};

type StoryListItemProps = {
    story: Story;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: (e: React.MouseEvent) => void;
};

export function StoryListItem({
    story,
    isSelected,
    onSelect,
    onDelete,
}: StoryListItemProps) {
    return (
        <ListItem
            disablePadding
            secondaryAction={
                <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={onDelete}
                    size="small"
                    sx={{
                        opacity: 0.6,
                        "&:hover": { opacity: 1, color: "error.main" },
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            }
        >
            <ListItemButton selected={isSelected} onClick={onSelect} sx={{ pr: 6 }}>
                <ListItemText
                    primary={story.prompt ?? "Untitled"}
                    secondary={new Date(story.createdAt).toLocaleDateString()}
                    primaryTypographyProps={{
                        noWrap: true,
                        variant: "body2",
                        fontWeight: isSelected ? "bold" : "medium",
                    }}
                    secondaryTypographyProps={{
                        noWrap: true,
                        variant: "caption",
                    }}
                />
            </ListItemButton>
        </ListItem>
    );
}
