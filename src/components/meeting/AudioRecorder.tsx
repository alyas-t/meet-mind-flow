
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Settings } from 'lucide-react';
import { toast } from 'sonner';
import transcriptionService from '@/services/aws/transcriptionService';
import { getAwsConfig } from '@/services/aws/config';

interface AudioRecorderProps {
  onTranscriptUpdate: (text: string) => void;
}

const AudioRecorder = ({ onTranscriptUpdate }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isUsingAws, setIsUsingAws] = useState<boolean>(false);
  const [recordingStatus, setRecordingStatus] = useState<string>("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if AWS is properly configured
    const config = getAwsConfig();
    const awsConfigured = 
      config.credentials.accessKeyId !== "YOUR_ACCESS_KEY_ID" && 
      config.credentials.secretAccessKey !== "YOUR_SECRET_ACCESS_KEY";
    
    setIsUsingAws(awsConfigured);
    console.log("AWS configuration status:", {
      configured: awsConfigured,
      region: config.region,
      hasSessionToken: !!config.credentials.sessionToken,
      bucket: import.meta.env.VITE_S3_BUCKET_NAME
    });
  }, []);

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
      setRecordingStatus("Initializing microphone...");
      await transcriptionService.startTranscription((text) => {
        onTranscriptUpdate(text);
        setRecordingStatus("Transcribing...");
      });
      setIsRecording(true);
      setRecordingStatus("Recording...");
      toast.success(`Recording started${isUsingAws ? ' with AWS Transcribe' : ' (mock mode)'}`);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setRecordingStatus("");
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    transcriptionService.stopTranscription();
    setIsRecording(false);
    setRecordingStatus("Processing recording...");
    
    // Clear status after a delay
    setTimeout(() => {
      setRecordingStatus("");
    }, 3000);
    
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
      
      <div className="text-xl font-mono mb-2">
        {formatTime(elapsedTime)}
      </div>
      
      {recordingStatus && (
        <div className="text-sm text-gray-600 mb-4">{recordingStatus}</div>
      )}
      
      {isUsingAws && <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mb-4">AWS Transcribe Enabled</div>}
      
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
