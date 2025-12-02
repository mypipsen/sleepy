"use client";

import { List, Typography } from "@mui/material";
import { StoryListItem } from "./story-list-item";

type Story = {
    id: number;
    prompt: string | null;
    createdAt: Date;
};

type StoryListProps = {
    stories: Story[] | undefined;
    selectedId: number | null;
    onSelect: (id: number) => void;
    onDelete: (id: number) => void;
    isLoading: boolean;
};

export function StoryList({
    stories,
    selectedId,
    onSelect,
    onDelete,
    isLoading,
}: StoryListProps) {
    if (isLoading) {
        return (
            <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                Loading...
            </Typography>
        );
    }

    return (
        <List>
            {stories?.map((story) => (
                <StoryListItem
                    key={story.id}
                    story={story}
                    isSelected={selectedId === story.id}
                    onSelect={() => onSelect(story.id)}
                    onDelete={(e) => {
                        e.stopPropagation();
                        onDelete(story.id);
                    }}
                />
            ))}
        </List>
    );
}
