
// src/components/meeting/AudioRecorder.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { MicIcon, StopCircleIcon } from "lucide-react";
import SpeakerSelector from "./SpeakerSelector";

interface AudioRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSelectSpeaker?: (speaker: string) => void;
  currentSpeaker?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  isRecording, 
  onStartRecording, 
  onStopRecording,
  onSelectSpeaker,
  currentSpeaker
}) => {
  return (
    <div className="audio-recorder space-y-4">
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
        <>
          {onSelectSpeaker && (
            <div className="mb-4">
              <SpeakerSelector 
                onSelectSpeaker={onSelectSpeaker} 
                currentSpeaker={currentSpeaker}
              />
            </div>
          )}
          <Button 
            onClick={onStopRecording} 
            className="stop-button w-full"
            size="lg"
            variant="destructive"
          >
            <StopCircleIcon className="mr-2 h-5 w-5" />
            Stop Recording
          </Button>
        </>
      )}
    </div>
  );
};

export default AudioRecorder;
