
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface AudioRecorderProps {
  onTranscriptUpdate: (text: string) => void;
}

const AudioRecorder = ({ onTranscriptUpdate }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  // For now, we'll simulate transcription with mock data
  const mockTranscriptionText = [
    "Hello everyone, thank you for joining today's meeting.",
    "Let's start by discussing the current project status.",
    "We've made good progress on the first milestone.",
    "I think we should prioritize the user interface improvements.",
    "Does anyone have questions about the timeline?",
    "We should allocate more resources to testing before the next release.",
    "Let's make sure we address all the feedback from the last user testing session.",
  ];

  useEffect(() => {
    if (isRecording) {
      let count = 0;
      // Simple simulation - add a new line to the transcript every few seconds
      const transcriptionInterval = setInterval(() => {
        if (count < mockTranscriptionText.length) {
          onTranscriptUpdate(mockTranscriptionText[count]);
          count++;
        } else {
          clearInterval(transcriptionInterval);
        }
      }, 3000);

      return () => clearInterval(transcriptionInterval);
    }
  }, [isRecording, onTranscriptUpdate]);

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast.success("Recording started");
      
      // In a real implementation, we would send audio chunks to a transcription service
      mediaRecorder.ondataavailable = (e) => {
        console.log("Audio data available", e.data);
        // Here we would send this data to a transcription service
      };
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      
      streamRef.current.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      toast.info("Recording stopped");
    }
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
