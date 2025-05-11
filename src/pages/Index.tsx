
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { Mic, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, isLoading } = useAuth();
  
  // If user is logged in, redirect to dashboard
  if (!isLoading && user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <PageLayout fullWidth showAwsNotice={false}>
      <div className="min-h-[calc(100vh-150px)] flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-32">
          <div className="container mx-auto text-center flex flex-col items-center">
            <div className="bg-app-blue p-4 rounded-full mb-6">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              MeetingScribe
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-8">
              Your AI-powered meeting assistant that captures transcripts and generates smart summaries in real-time.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="text-lg bg-app-blue hover:bg-app-dark-blue" asChild>
                <Link to="/auth">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-blue-50 p-3 rounded-full w-fit mb-4">
                  <Mic className="w-6 h-6 text-app-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Transcription</h3>
                <p className="text-gray-600">
                  Automatically capture your meetings with advanced speech recognition technology.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-blue-50 p-3 rounded-full w-fit mb-4">
                  <CheckCircle className="w-6 h-6 text-app-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Summaries</h3>
                <p className="text-gray-600">
                  Get instant key points and action items extracted from your meeting content.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-blue-50 p-3 rounded-full w-fit mb-4">
                  <ArrowRight className="w-6 h-6 text-app-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
                <p className="text-gray-600">
                  Save and share meeting notes with your team for better collaboration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your meetings?</h2>
            <Button size="lg" className="bg-app-blue hover:bg-app-dark-blue" asChild>
              <Link to="/auth">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
