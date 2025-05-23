
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AwsCredentialNotice from '../ui/aws-credential-notice';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  showAwsNotice?: boolean;
}

const PageLayout = ({ 
  children, 
  className = '', 
  fullWidth = false,
  showAwsNotice = true
}: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className={`flex-1 py-8 ${className}`}>
        <div className={`container ${fullWidth ? 'max-w-full px-4' : ''}`}>
          {showAwsNotice && <AwsCredentialNotice />}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
