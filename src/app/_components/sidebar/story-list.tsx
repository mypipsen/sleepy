import { List, ListItemButton, ListItemText, Typography } from "@mui/material";

type StoryItem = {
  id: number;
  title?: string | null;
  text?: string | null;
  prompt: string;
  createdAt: Date;
  type: "story" | "adventure";
};

type StoryListProps = {
  stories: StoryItem[] | undefined;
  onSelect: (id: number, type: "story" | "adventure") => void;
  isLoading: boolean;
};

export function StoryList({ stories, onSelect, isLoading }: StoryListProps) {
  if (isLoading) {
    return <Typography sx={{ p: 2 }}>Loading...</Typography>;
  }

  if (!stories?.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No items yet.
      </Typography>
    );
  }

  return (
    <List dense>
      {stories.map((story) => (
        <ListItemButton
          key={`${story.type}-${story.id}`}
          onClick={() => onSelect(story.id, story.type)}
        >
          <ListItemText
            primary={
              story.type === "story"
                ? (story.title ?? "Untitled Story")
                : (story.title ?? story.prompt ?? "Untitled Adventure")
            }
            secondary={
              <Typography
                variant="caption"
                component="span"
                color="text.secondary"
              >
                {story.type === "adventure" && "Adventure • "}
                {story.createdAt.toLocaleDateString()}
              </Typography>
            }
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
