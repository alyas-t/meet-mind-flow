
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import TranscriptPanel from '@/components/meeting/TranscriptPanel';
import KeyPointsPanel from '@/components/meeting/KeyPointsPanel';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { downloadAsFile, shareContent } from '@/utils/exportUtils';
import { Download, Share2 } from 'lucide-react';

interface TranscriptEntry {
  text: string;
  speaker?: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration?: string;
  transcript: TranscriptEntry[] | string[];
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
            transcript: data.transcript as TranscriptEntry[] | string[] || []
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

  const handleDownloadTranscript = () => {
    if (!meeting) return;
    
    const fileName = `${meeting.title.replace(/\s+/g, '_')}_transcript.txt`;
    const formattedDate = new Date(meeting.date).toLocaleDateString();
    
    // Create header with meeting details
    const header = `Meeting: ${meeting.title}\nDate: ${formattedDate}\n${meeting.duration ? `Duration: ${meeting.duration}\n` : ''}\n\n`;
    
    // Format transcript based on its structure
    let transcriptText: string;
    
    if (Array.isArray(meeting.transcript)) {
      // Handle both string[] and TranscriptEntry[]
      transcriptText = meeting.transcript.map(entry => {
        if (typeof entry === 'string') {
          return entry;
        } else {
          return entry.speaker ? `${entry.speaker}: ${entry.text}` : entry.text;
        }
      }).join('\n');
    } else {
      transcriptText = "No transcript available";
    }
    
    // Combine header with transcript text
    const content = header + transcriptText;
    
    // Download the transcript
    downloadAsFile(content, fileName);
  };

  const handleShareNotes = async () => {
    if (!meeting) return;
    
    // Format meeting information for sharing
    const formattedDate = new Date(meeting.date).toLocaleDateString();
    const title = `Meeting Notes: ${meeting.title}`;
    
    // Create summary text with key points and action items
    let summaryText = `Meeting Notes: ${meeting.title}\nDate: ${formattedDate}\n\n`;
    
    // Add key points
    if (meeting.key_points.length > 0) {
      summaryText += "Key Points:\n";
      meeting.key_points.forEach((point, index) => {
        summaryText += `${index + 1}. ${point}\n`;
      });
      summaryText += "\n";
    }
    
    // Add action items
    if (meeting.action_items.length > 0) {
      summaryText += "Action Items:\n";
      meeting.action_items.forEach((item, index) => {
        summaryText += `${index + 1}. ${item}\n`;
      });
    }
    
    // Get the current URL for sharing
    const url = window.location.href;
    
    // Share the content
    await shareContent(title, summaryText, url);
  };

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
        <Button variant="outline" onClick={handleDownloadTranscript}>
          <Download className="h-4 w-4 mr-2" /> Download Transcript
        </Button>
        <Button onClick={handleShareNotes}>
          <Share2 className="h-4 w-4 mr-2" /> Share Notes
        </Button>
      </div>
    </PageLayout>
  );
};

export default MeetingDetail;
