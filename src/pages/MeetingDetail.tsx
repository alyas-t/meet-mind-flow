
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';
import TranscriptPanel from '@/components/meeting/TranscriptPanel';
import KeyPointsPanel from '@/components/meeting/KeyPointsPanel';

// Mock data
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
    keyPoints: 4,
    actionItems: 3,
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
    keyPoints: 7,
    actionItems: 5,
  },
};

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const meeting = id ? mockMeetingsData[id as keyof typeof mockMeetingsData] : null;

  if (!meeting) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Meeting not found</h2>
          <p className="text-gray-500">The meeting you're looking for doesn't exist or has been deleted.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-app-blue">{meeting.title}</h1>
        <p className="text-gray-500">{new Date(meeting.date).toLocaleDateString()} • {meeting.duration}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-300px)]">
        <TranscriptPanel transcript={meeting.transcript} autoScroll={false} />
        <KeyPointsPanel transcript={meeting.transcript} />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline">Download Transcript</Button>
        <Button>Share Notes</Button>
      </div>
    </PageLayout>
  );
};

export default MeetingDetail;
