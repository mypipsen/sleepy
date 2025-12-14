"use client";

import ErrorIcon from "@mui/icons-material/Error";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useRef, useState } from "react";

import { api } from "~/trpc/react";

type VoiceRecorderProps = {
  onTranscribe: (text: string) => void;
  disabled?: boolean;
};

export function VoiceRecorder({
  onTranscribe,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const transcribe = api.transcribe.transcribe.useMutation();

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Data = base64Audio.split(",")[1];

        if (base64Data) {
          const { text } = await transcribe.mutateAsync({ audio: base64Data });
          if (text) {
            onTranscribe(text);
          }
        }
      };
    } catch (error) {
      console.error("Transcription error:", error);
      setError("Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  };

  return (
    <Tooltip
      title={error ?? (isRecording ? "Stop recording" : "Start recording")}
    >
      <IconButton
        onClick={toggleRecording}
        color={error ? "warning" : isRecording ? "error" : "primary"}
        disabled={disabled || isTranscribing}
        sx={{
          border: "1px solid",
          borderColor: error
            ? "warning.main"
            : isRecording
              ? "error.main"
              : "primary.main",
        }}
      >
        {isTranscribing ? (
          <CircularProgress size={24} />
        ) : error ? (
          <ErrorIcon />
        ) : isRecording ? (
          <StopIcon />
        ) : (
          <MicIcon />
        )}
      </IconButton>
    </Tooltip>
  );
}
