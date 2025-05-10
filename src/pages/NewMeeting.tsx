
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';
import AudioRecorder from '@/components/meeting/AudioRecorder';
import TranscriptPanel from '@/components/meeting/TranscriptPanel';
import KeyPointsPanel from '@/components/meeting/KeyPointsPanel';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const NewMeeting = () => {
  const [meetingTitle, setMeetingTitle] = useState<string>('Untitled Meeting');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const handleTranscriptUpdate = (text: string) => {
    setTranscript(prev => [...prev, text]);
  };
  
  const handleSaveMeeting = async () => {
    setIsSaving(true);
    
    try {
      // In a real implementation, this would save to AWS S3 and DynamoDB
      // For now, we'll simulate the saving process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Meeting saved successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast.error("Failed to save meeting. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <PageLayout className="py-6">
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
