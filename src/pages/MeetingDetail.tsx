import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';
import TranscriptPanel from '@/components/meeting/TranscriptPanel';
import KeyPointsPanel from '@/components/meeting/KeyPointsPanel';
import { toast } from 'sonner';

// Fallback mock data in case we can't find the meeting
const mockMeetingsData = {
  '1': {
    id: '1',
    title: 'Weekly Team Standup',
    date: '2025-05-09',
    duration: '45 min',
    transcript: [
      "Hello everyone, thank you for joining today's meeting.",
      "Let's start by discussing the current project status.",
      "We've made good progress on the first milestone.",
      "I think we should prioritize the user interface improvements.",
      "Does anyone have questions about the timeline?",
      "We should allocate more resources to testing before the next release.",
      "Let's make sure we address all the feedback from the last user testing session."
    ],
    keyPoints: [
      "Made good progress on first milestone",
      "Should prioritize UI improvements",
      "Allocate more resources to testing",
      "Address feedback from last user testing"
    ],
    actionItems: [
      "Review UI improvement proposals",
      "Schedule additional testing sessions",
      "Compile user feedback report"
    ],
  },
  '2': {
    id: '2',
    title: 'Project Planning Session',
    date: '2025-05-07',
    duration: '60 min',
    transcript: [
      "Welcome to our project planning session.",
      "Today we need to finalize the roadmap for Q3.",
      "Marketing wants to launch the new features by August.",
      "Development team estimates they need 6 weeks for implementation.",
      "We should start with user research as soon as possible.",
      "Budget has been approved for additional resources.",
    ],
    keyPoints: [
      "Finalize Q3 roadmap",
      "Marketing launch target: August",
      "Development needs 6 weeks for implementation",
      "Start user research ASAP",
      "Budget approved for additional resources"
    ],
    actionItems: [
      "Create detailed Q3 roadmap document",
      "Schedule user research sessions",
      "Allocate approved resources to teams",
      "Set up weekly progress tracking",
      "Coordinate with marketing on launch timeline"
    ],
  },
};

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration?: string;
  transcript: string[];
  keyPoints: string[];
  actionItems: string[];
}

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    try {
      // Try to fetch from localStorage first
      const meetingsJSON = localStorage.getItem('meetings');
      if (meetingsJSON) {
        const meetings = JSON.parse(meetingsJSON);
        const foundMeeting = meetings.find((m: Meeting) => m.id === id);
        
        if (foundMeeting) {
          setMeeting(foundMeeting);
          return;
        }
      }
      
      // Fallback to mock data if meeting not found in localStorage
      const mockMeeting = mockMeetingsData[id as keyof typeof mockMeetingsData];
      if (mockMeeting) {
        setMeeting(mockMeeting as Meeting);
      }
    } catch (error) {
      console.error('Error loading meeting:', error);
      toast.error('Failed to load meeting details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p>Loading meeting details...</p>
        </div>
      </PageLayout>
    );
  }

  if (!meeting) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Meeting not found</h2>
          <p className="text-gray-500">The meeting you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-app-blue">{meeting.title}</h1>
        <p className="text-gray-500">{new Date(meeting.date).toLocaleDateString()} {meeting.duration && `• ${meeting.duration}`}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-300px)]">
        <TranscriptPanel transcript={meeting.transcript} autoScroll={false} />
        <KeyPointsPanel 
          keyPoints={meeting.keyPoints} 
          actionItems={meeting.actionItems} 
          isLoading={false} 
          error="" 
        />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline">Download Transcript</Button>
        <Button>Share Notes</Button>
      </div>
    </PageLayout>
  );
};

export default MeetingDetail;
