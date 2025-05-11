
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import TranscriptPanel from '@/components/meeting/TranscriptPanel';
import KeyPointsPanel from '@/components/meeting/KeyPointsPanel';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Download, Share2 } from 'lucide-react';
import { downloadAsFile, shareContent } from '@/utils/exportUtils';

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration?: string;
  transcript: string[];
  key_points: string[];
  action_items: string[];
}

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMeeting = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.log('Error fetching from Supabase, trying localStorage:', error);
          
          // Try to fetch from localStorage as fallback
          const meetingsJSON = localStorage.getItem('meetings');
          if (meetingsJSON) {
            const meetings = JSON.parse(meetingsJSON);
            const foundMeeting = meetings.find((m: any) => m.id === id);
            
            if (foundMeeting) {
              setMeeting({
                ...foundMeeting,
                key_points: foundMeeting.keyPoints || foundMeeting.key_points || [],
                action_items: foundMeeting.actionItems || foundMeeting.action_items || []
              });
              return;
            }
          }
          
          // If not found in localStorage or Supabase
          toast.error('Meeting not found');
        } else if (data) {
          // Format data from Supabase
          setMeeting({
            ...data,
            key_points: data.key_points as string[] || [],
            action_items: data.action_items as string[] || [],
            transcript: data.transcript as string[] || []
          });
        }
      } catch (error) {
        console.error('Error loading meeting:', error);
        toast.error('Failed to load meeting details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  const handleDownloadTranscript = () => {
    if (!meeting) return;
    
    // Format transcript for download
    const formattedTranscript = meeting.transcript.join('\n\n');
    const filename = `${meeting.title.replace(/\s+/g, '_')}_transcript_${new Date().toISOString().split('T')[0]}.txt`;
    
    downloadAsFile(formattedTranscript, filename);
  };

  const handleShareNotes = async () => {
    if (!meeting) return;
    
    // Format meeting notes for sharing
    const meetingDate = new Date(meeting.date).toLocaleDateString();
    const keyPointsList = meeting.key_points.map(point => `• ${point}`).join('\n');
    const actionItemsList = meeting.action_items.map(item => `• ${item}`).join('\n');
    
    const sharableContent = `
Meeting Notes: ${meeting.title}
Date: ${meetingDate}
${meeting.duration ? `Duration: ${meeting.duration}\n` : ''}

Key Points:
${keyPointsList || 'None'}

Action Items:
${actionItemsList || 'None'}
`.trim();

    await shareContent(
      `Meeting Notes: ${meeting.title}`,
      sharableContent,
      window.location.href
    );
  };

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
          keyPoints={meeting.key_points} 
          actionItems={meeting.action_items} 
          isLoading={false} 
          error="" 
        />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={handleDownloadTranscript}
          disabled={!meeting.transcript || meeting.transcript.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Transcript
        </Button>
        <Button onClick={handleShareNotes}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Notes
        </Button>
      </div>
    </PageLayout>
  );
};

export default MeetingDetail;
