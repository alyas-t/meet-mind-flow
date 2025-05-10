
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Settings } from 'lucide-react';
import { toast } from 'sonner';
import transcriptionService from '@/services/aws/transcriptionService';

interface AudioRecorderProps {
  onTranscriptUpdate: (text: string) => void;
}

const AudioRecorder = ({ onTranscriptUpdate }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Set up timer to track recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      await transcriptionService.startTranscription(onTranscriptUpdate);
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    transcriptionService.stopTranscription();
    setIsRecording(false);
    toast.info("Recording stopped");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-xl font-medium">Audio Recording</h3>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Audio Settings</span>
        </Button>
      </div>
      
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${isRecording ? 'bg-red-100' : 'bg-gray-100'}`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 animate-pulse-subtle' : 'bg-app-blue'}`}>
          {isRecording ? (
            <MicOff className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </div>
      </div>
      
      <div className="text-xl font-mono mb-4">
        {formatTime(elapsedTime)}
      </div>
      
      <Button 
        className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
    </div>
  );
};

export default AudioRecorder;
