
// src/components/meeting/AudioRecorder.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { MicIcon, StopCircleIcon } from "lucide-react";

interface AudioRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  isRecording, 
  onStartRecording, 
  onStopRecording 
}) => {
  return (
    <div className="audio-recorder">
      {!isRecording ? (
        <Button 
          onClick={onStartRecording} 
          className="record-button"
          size="lg"
          variant="default"
        >
          <MicIcon className="mr-2 h-5 w-5" />
          Start Recording
        </Button>
      ) : (
        <Button 
          onClick={onStopRecording} 
          className="stop-button"
          size="lg"
          variant="destructive"
        >
          <StopCircleIcon className="mr-2 h-5 w-5" />
          Stop Recording
        </Button>
      )}
    </div>
  );
};

export default AudioRecorder;
