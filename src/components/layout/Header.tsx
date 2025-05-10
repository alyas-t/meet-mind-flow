
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full py-4 border-b bg-white">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <Mic className="w-6 h-6 text-app-blue mr-2" />
            <span className="text-xl font-bold text-app-blue">MeetingScribe</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild>
            <Link to="/new-meeting">New Meeting</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
