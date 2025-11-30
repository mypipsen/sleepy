export function getImagePrompt(story: string, instruction: string) {
  return `You are an illustrator creating a cozy, magical, and child-friendly image that represents the following story:

${story}

Follow these instructions:

1. Capture the main scene or moment that best reflects the story’s mood.
2. Include the main characters described in the story.
3. Use a warm, soft, and gentle color palette suitable for children.
4. Emphasize a calm, peaceful, and magical atmosphere.
5. Style: whimsical, storybook-like, with friendly and approachable characters.
6. Avoid anything scary, dark, or intense.

[USER'S FREE TEXT INSTRUCTIONS/PROMPT HERE]
\`\`\`
${instruction}
\`\`\`

---

Output a single illustration that could accompany this story as a bedtime picture.`;
}
