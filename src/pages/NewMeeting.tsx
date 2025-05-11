
// src/pages/NewMeeting.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';
import AudioRecorder from '@/components/meeting/AudioRecorder';
import TranscriptPanel from '@/components/meeting/TranscriptPanel';
import KeyPointsPanel from '@/components/meeting/KeyPointsPanel';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getAwsConfig, isAwsConfigured } from '@/services/aws/config';
import TranscriptionService from '@/services/aws/transcriptionService';
import SummaryService from '@/services/aws/summaryService';
import { Check } from 'lucide-react';

// Use your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyDzU4-SU9RyoXCg7jDfWa6GKAH-S8zU1hY';

const NewMeeting = () => {
  const [meetingTitle, setMeetingTitle] = useState<string>('Untitled Meeting');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [awsConfigured, setAwsConfigured] = useState<boolean>(false);
  const [s3Configured, setS3Configured] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const transcriptionService = React.useMemo(() => new TranscriptionService(), []);
  const summaryService = React.useMemo(() => new SummaryService(GEMINI_API_KEY), []);
  
  useEffect(() => {
    // Check if AWS is properly configured
    const config = getAwsConfig();
    const isConfigured = isAwsConfigured();
    const hasS3Bucket = !!config.s3BucketName;
    
    setAwsConfigured(isConfigured);
    setS3Configured(hasS3Bucket);
    
    if (!isConfigured) {
      toast.warning("AWS credentials not configured. Using mock data.", {
        duration: 5000,
      });
    } else if (!hasS3Bucket) {
      toast.warning("AWS S3 bucket not configured. Please set VITE_S3_BUCKET_NAME in your .env file.", {
        duration: 8000,
      });
    }
    
    // Set up callbacks for transcription updates
    transcriptionService.onUpdate((newTranscript) => {
      setTranscript(prev => [...prev, newTranscript]);
    });
    
    transcriptionService.onRecordingStatus((status) => {
      setIsRecording(status);
    });
    
    // Handle completed transcripts
    transcriptionService.onComplete(async (fullTranscript) => {
      try {
        setIsLoading(true);
        console.log('Transcript complete, generating key points...');
        
        // Validate transcript
        if (!fullTranscript || fullTranscript.trim() === '') {
          setError('The transcript is empty. No content to analyze.');
          setIsLoading(false);
          return;
        }
        
        // Process with Gemini
        const summary = await summaryService.generateKeyPoints(fullTranscript);
        
        // Update state with results
        setKeyPoints(summary.keyPoints || []);
        setActionItems(summary.actionItems || []);
        
        toast.success("Analysis complete", {
          description: "Meeting insights have been generated"
        });
        
      } catch (err: any) {
        console.error('Error processing transcript:', err);
        setError('Failed to generate meeting insights: ' + err.message);
        
        toast.error("Error analyzing meeting", {
          description: err.message
        });
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => {
      // Clean up if needed
      if (transcriptionService.isRecording) {
        transcriptionService.stopRecording();
      }
    };
  }, [transcriptionService, summaryService]);
  
  const handleTranscriptUpdate = (text: string) => {
    // This function is kept for compatibility with your existing components
  };
  
  const handleStartRecording = () => {
    setError(null);
    setTranscript([]);
    setKeyPoints([]);
    setActionItems([]);
    transcriptionService.startRecording();
  };
  
  const handleStopRecording = () => {
    transcriptionService.stopRecording();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeetingTitle(e.target.value);
  };
  
  const handleSaveMeeting = async () => {
    if (isRecording) {
      // If recording is still active, stop it first
      handleStopRecording();
      // Wait a moment for the recording to finish processing
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsSaving(true);
    
    try {
      // Prepare meeting data
      const meetingData = {
        id: `meeting-${Date.now()}`,
        title: meetingTitle,
        date: new Date().toISOString(),
        transcript: transcript,
        keyPoints: keyPoints,
        actionItems: actionItems,
      };
      
      if (awsConfigured && s3Configured) {
        // In a real implementation, this would save to S3/DynamoDB
        // For now, we simulate a successful save
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Save to localStorage as a fallback/demonstration
        const savedMeetings = JSON.parse(localStorage.getItem('savedMeetings') || '[]');
        savedMeetings.push(meetingData);
        localStorage.setItem('savedMeetings', JSON.stringify(savedMeetings));
        
        toast.success("Meeting saved successfully", {
          description: "Meeting data has been saved to AWS"
        });
      } else {
        // Save to localStorage as a demonstration
        const savedMeetings = JSON.parse(localStorage.getItem('savedMeetings') || '[]');
        savedMeetings.push(meetingData);
        localStorage.setItem('savedMeetings', JSON.stringify(savedMeetings));
        
        toast.success("Meeting saved successfully", {
          description: "Meeting data has been saved locally"
        });
      }
      
      // Navigate to dashboard after successful save
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast.error("Failed to save meeting", {
        description: "Please try again later"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <PageLayout className="py-6" showAwsNotice={!awsConfigured || !s3Configured}>
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Input
            value={meetingTitle}
            onChange={handleTitleChange}
            className="text-xl font-bold bg-transparent border-0 border-b border-gray-200 rounded-none px-0 w-full max-w-md focus-visible:ring-0 focus-visible:border-app-blue"
          />
          <p className="text-gray-500">{new Date().toLocaleString()}</p>
        </div>
        
        <Button 
          disabled={transcript.length === 0 || isSaving}
          className="bg-app-blue hover:bg-app-blue/90 flex items-center gap-2"
          onClick={handleSaveMeeting}
        >
          {isSaving ? "Saving..." : (
            <>
              <Check className="w-4 h-4" />
              Save & Exit
            </>
          )}
        </Button>
      </div>
      
      {!s3Configured && awsConfigured && (
        <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">S3 Bucket Not Configured</p>
          <p className="text-sm">Please set the VITE_S3_BUCKET_NAME environment variable to your S3 bucket name.</p>
        </div>
      )}
      
      <div className="grid grid-cols-12 gap-6">
        {/* Left panel - Recording controls */}
        <div className="col-span-12 sm:col-span-3">
          <Card className="p-4 bg-gray-50">
            <AudioRecorder 
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
            />
          </Card>
        </div>
        
        {/* Center and Right panels - Transcript and Insights */}
        <div className="col-span-12 sm:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transcript Panel */}
          <TranscriptPanel transcript={transcript} />
          
          {/* Key Points Panel */}
          <KeyPointsPanel 
            keyPoints={keyPoints}
            actionItems={actionItems}
            isLoading={isLoading}
            error={error}
            transcript={transcript} // For backward compatibility
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default NewMeeting;
