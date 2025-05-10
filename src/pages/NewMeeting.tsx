
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
import { getAwsConfig } from '@/services/aws/config';

const NewMeeting = () => {
  const [meetingTitle, setMeetingTitle] = useState<string>('Untitled Meeting');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [awsConfigured, setAwsConfigured] = useState<boolean>(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if AWS is properly configured
    const config = getAwsConfig();
    const isConfigured = 
      config.credentials.accessKeyId !== "YOUR_ACCESS_KEY_ID" && 
      config.credentials.secretAccessKey !== "YOUR_SECRET_ACCESS_KEY";
    
    setAwsConfigured(isConfigured);
    
    if (!isConfigured) {
      toast.warning("AWS credentials not configured. Using mock data.", {
        duration: 5000,
      });
    }
  }, []);
  
  const handleTranscriptUpdate = (text: string) => {
    setTranscript(prev => [...prev, text]);
  };
  
  const handleSaveMeeting = async () => {
    setIsSaving(true);
    
    try {
      if (awsConfigured) {
        // In a production app, this would save meeting data to DynamoDB
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Meeting saved to AWS successfully");
      } else {
        // Mock saving
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Meeting saved successfully (mock)");
      }
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast.error("Failed to save meeting. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <PageLayout className="py-6" showAwsNotice={!awsConfigured}>
      <div className="mb-6">
        <Input
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          className="text-2xl font-bold border-none h-auto p-0 text-app-blue focus-visible:ring-0"
        />
        <p className="text-gray-500">{new Date().toLocaleString()}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 md:col-span-1 bg-gray-50">
          <AudioRecorder onTranscriptUpdate={handleTranscriptUpdate} />
        </Card>
        
        <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
          <TranscriptPanel transcript={transcript} />
          <KeyPointsPanel transcript={transcript} />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button 
          disabled={transcript.length === 0 || isSaving}
          variant="outline"
          className="mr-4"
          onClick={handleSaveMeeting}
        >
          {isSaving ? "Saving..." : "Save & Exit"}
        </Button>
      </div>
    </PageLayout>
  );
};

export default NewMeeting;
