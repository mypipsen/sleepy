export function getImagePrompt(story: string) {
  return `Create a friendly illustration for a childrens bedtime story. The image should feel soft, warm, and comforting, with gentle lighting and rounded shapes. Nothing scary or intense. It should visually match the main characters, setting, and mood of the story.

Story for visual guidance:
\`\`\`
${story}
\`\`\`

Art style guidelines:
- Modern cartoon style similar to Paw Patrol and other popular kids TV shows today
- Bright but soothing colors
- Simple clean character designs with big expressive eyes
- Soft edges and smooth shading
- Calm and happy expressions
- A cozy feeling that supports bedtime

Do not include text in the image. Focus on a single scene that represents the heart of the story and feels magical and peaceful.`;
}
