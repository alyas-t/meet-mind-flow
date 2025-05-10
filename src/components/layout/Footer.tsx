
import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-4 text-center text-sm text-gray-500 border-t">
      <div className="container">
        <p>© {new Date().getFullYear()} Intelligent Meeting Assistant</p>
      </div>
    </footer>
  );
};

export default Footer;
