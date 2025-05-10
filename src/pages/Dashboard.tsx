
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from '@/components/layout/PageLayout';
import { Plus } from 'lucide-react';

// Mock data for demonstration purposes
const mockMeetings = [
  {
    id: '1',
    title: 'Weekly Team Standup',
    date: '2025-05-09',
    duration: '45 min',
    keyPoints: 4,
    actionItems: 3,
  },
  {
    id: '2',
    title: 'Project Planning Session',
    date: '2025-05-07',
    duration: '60 min',
    keyPoints: 7,
    actionItems: 5,
  },
  {
    id: '3',
    title: 'Client Presentation Prep',
    date: '2025-05-05',
    duration: '30 min',
    keyPoints: 3,
    actionItems: 2,
  },
];

const Dashboard = () => {
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
      
      {mockMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMeetings.map((meeting) => (
            <Card key={meeting.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>{meeting.title}</CardTitle>
                <CardDescription>
                  {new Date(meeting.date).toLocaleDateString()} • {meeting.duration}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <div>
                    <p><span className="font-medium">{meeting.keyPoints}</span> Key Points</p>
                  </div>
                  <div>
                    <p><span className="font-medium">{meeting.actionItems}</span> Action Items</p>
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
