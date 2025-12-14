import { List, ListItemButton, ListItemText, Typography } from "@mui/material";

type Story = {
  id: number;
  title: string | null;
  createdAt: Date;
};

type StoryListProps = {
  stories: Story[] | undefined;
  onSelect: (id: number) => void;
  isLoading: boolean;
};

export function StoryList({ stories, onSelect, isLoading }: StoryListProps) {
  if (isLoading) {
    return <Typography sx={{ p: 2 }}>Loading...</Typography>;
  }

  if (!stories?.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No stories yet.
      </Typography>
    );
  }

  return (
    <List dense>
      {stories.map((story) => (
        <ListItemButton key={story.id} onClick={() => onSelect(story.id)}>
          <ListItemText
            primary={story.title ?? "Untitled Story"}
            secondary={story.createdAt.toLocaleDateString()}
            primaryTypographyProps={{
              noWrap: true,
              style: { fontWeight: 500 },
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
}
