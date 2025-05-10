
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout = ({ children, className = '' }: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-1 py-8 ${className}`}>
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
