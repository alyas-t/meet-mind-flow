
// src/components/AudioRecorder.tsx
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
    <div className="audio-recorder flex flex-col items-center gap-4">
      {!isRecording ? (
        <Button 
          onClick={onStartRecording} 
          className="record-button w-full"
          size="lg"
          variant="default"
        >
          <MicIcon className="mr-2 h-5 w-5" />
          Start Recording
        </Button>
      ) : (
        <Button 
          onClick={onStopRecording} 
          className="stop-button w-full"
          size="lg"
          variant="destructive"
        >
          <StopCircleIcon className="mr-2 h-5 w-5" />
          Stop Recording
        </Button>
      )}
      
      <div className="text-center text-sm text-muted-foreground mt-2">
        {isRecording ? (
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Recording in progress...</span>
          </div>
        ) : (
          <p>Click to start recording your meeting</p>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
