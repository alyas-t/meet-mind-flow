
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from '@/components/layout/PageLayout';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration?: string;
  keyPoints: string[];
  actionItems: string[];
  transcript: string[];
  createdAt: string;
}

const Dashboard = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Get saved meetings from localStorage
      const savedMeetingsJSON = localStorage.getItem('meetings');
      if (savedMeetingsJSON) {
        const savedMeetings = JSON.parse(savedMeetingsJSON);
        setMeetings(savedMeetings);
      }
    } catch (error) {
      console.error('Error loading saved meetings:', error);
      toast.error('Failed to load your meetings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Meetings</h1>
        <Button asChild>
          <Link to="/new-meeting" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Meeting
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <p>Loading your meetings...</p>
        </div>
      ) : meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>{meeting.title}</CardTitle>
                <CardDescription>
                  {new Date(meeting.date).toLocaleDateString()} {meeting.duration && `• ${meeting.duration}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <div>
                    <p><span className="font-medium">{meeting.keyPoints.length}</span> Key Points</p>
                  </div>
                  <div>
                    <p><span className="font-medium">{meeting.actionItems.length}</span> Action Items</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to={`/meeting/${meeting.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No meetings yet</h3>
          <p className="text-gray-500 mb-6">Start a new meeting to begin capturing notes</p>
          <Button asChild>
            <Link to="/new-meeting">Record New Meeting</Link>
          </Button>
        </div>
      )}
    </PageLayout>
  );
};

export default Dashboard;
