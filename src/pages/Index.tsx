
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { Mic, FileText, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <PageLayout className="py-0">
      {/* Hero section */}
      <div className="flex flex-col md:flex-row items-center py-16">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-app-blue">
            Never Miss a Key Point Again
          </h1>
          <p className="text-xl mb-8 text-gray-600">
            Intelligent Meeting Assistant automatically transcribes, summarizes, and extracts action items from your meetings in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-lg">
              <Link to="/new-meeting">Start Recording</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img 
            src="/placeholder.svg" 
            alt="Meeting Assistant Interface" 
            className="max-w-full rounded-lg shadow-lg"
            width={500}
            height={300}
          />
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 bg-gray-50 -mx-8 px-8">
        <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-app-blue rounded-full flex items-center justify-center mb-4">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Record</h3>
            <p className="text-gray-600">
              Use your microphone to capture meeting audio, with real-time transcription.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-app-blue rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Transcribe</h3>
            <p className="text-gray-600">
              AI-powered speech-to-text conversion with high accuracy and punctuation.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-app-blue rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Summarize</h3>
            <p className="text-gray-600">
              Automatically extract key points and action items in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
          Join thousands of professionals who use Intelligent Meeting Assistant to save time and capture every important detail.
        </p>
        <Button asChild size="lg" className="text-lg">
          <Link to="/new-meeting">Start Your First Meeting</Link>
        </Button>
      </div>
    </PageLayout>
  );
};

export default Index;
