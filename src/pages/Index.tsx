
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { Mic, FileText, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <PageLayout className="py-0">
      {/* Hero section */}
      <div className="flex flex-col md:flex-row items-center py-16 gap-8">
        <div className="md:w-1/2 space-y-6">
          <div className="inline-block bg-app-blue/10 text-app-blue font-medium px-4 py-2 rounded-full text-sm">
            Effortless Meeting Notes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Never Miss a <span className="text-app-blue">Key Point</span> Again
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Intelligent Meeting Assistant automatically transcribes, summarizes, and extracts action items from your meetings in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button size="lg" className="bg-app-blue hover:bg-app-dark-blue text-lg h-12">
              <Link to="/new-meeting">Start Recording</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg h-12">
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-app-blue to-blue-400 rounded-xl blur-xl opacity-30"></div>
            <img 
              src="/meeting.jpg" 
              alt="Meeting Assistant Interface" 
              className="relative rounded-xl shadow-lg border border-gray-200 bg-white"
              width={600}
              height={400}
            />
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-24 bg-white -mx-8 px-8">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our intelligent assistant makes capturing meeting information effortless and accurate
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-app-blue rounded-xl flex items-center justify-center mb-6">
                <Mic className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Record</h3>
              <p className="text-gray-600">
                Use your microphone to capture meeting audio, with real-time transcription that follows your conversation.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-app-blue rounded-xl flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Transcribe</h3>
              <p className="text-gray-600">
                AI-powered speech-to-text conversion with high accuracy, proper punctuation, and speaker attribution.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-app-blue rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Summarize</h3>
              <p className="text-gray-600">
                Automatically extract key points and action items in real-time, so you can focus on the conversation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="py-24 text-center bg-gradient-to-br from-app-blue/5 to-app-blue/10 rounded-3xl my-12">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-gray-600">
            Join thousands of professionals who use Intelligent Meeting Assistant to save time and capture every important detail.
          </p>
          <Button size="lg" className="bg-app-blue hover:bg-app-dark-blue text-lg h-12">
            <Link to="/new-meeting">Start Your First Meeting</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
