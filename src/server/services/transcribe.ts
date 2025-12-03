import { openai } from "@ai-sdk/openai";
import { experimental_transcribe } from "ai";

export async function transcribeAudio(base64Audio: string) {
  const buffer = Buffer.from(base64Audio, "base64");
  const { text } = await experimental_transcribe({
    model: openai.transcription("whisper-1"),
    audio: buffer,
  });

  return text;
}
